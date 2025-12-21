import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { FileUploadServicePort } from "../../domain/contracts/file-upload-service.port";
import { StoragePort, STORAGE } from "../../domain/contracts/storage.port";
import { FILE_UPLOAD_QUEUE } from "src/infra/queue/queue.config";
import { FileUploadException } from "../../domain/exceptions";
import { randomUUID } from "crypto";
import { extname } from "path";

@Injectable()
export class FileUploadService implements FileUploadServicePort {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @Inject(STORAGE)
    private readonly storage: StoragePort,
    @InjectQueue(FILE_UPLOAD_QUEUE)
    private readonly fileUploadQueue: Queue,
  ) {}

  async uploadFile(
    file: {
      filename: string;
      data: Buffer | NodeJS.ReadableStream;
      mimetype: string;
      size: number;
      originalName: string;
    },
    options?: {
      queue?: boolean;
      folder?: string;
      subfolder?: string;
    }
  ): Promise<{ filename: string; path: string; queued?: boolean }> {
    // try {
      // Validate input
      if (!file.data) {
        throw new FileUploadException('File data is required');
      }
      if (!file.originalName) {
        throw new FileUploadException('File original name is required');
      }

      // Generate unique filename
      const fileExtension = extname(file.originalName);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      
      this.logger.debug(`Starting upload: ${file.originalName} -> ${uniqueFilename} (queue: ${options?.queue ?? false})`);

      if (options?.queue === true) {
        // Queue the upload for background processing
        let fileData: Buffer;
        let actualSize = file.size;
        
        if (Buffer.isBuffer(file.data)) {
          fileData = file.data;
          actualSize = fileData.length;
        } else {
          // Convert stream to buffer for queue
          this.logger.debug(`Converting stream to buffer for queued upload: ${file.originalName}`);
          const chunks: Buffer[] = [];
          for await (const chunk of file.data) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          fileData = Buffer.concat(chunks);
          actualSize = fileData.length;
          this.logger.debug(`Stream converted to buffer: ${actualSize} bytes`);
        }

        this.logger.log(`Queueing file upload: ${uniqueFilename} (${actualSize} bytes) to queue: ${FILE_UPLOAD_QUEUE}`);
        
        const job = await this.fileUploadQueue.add(
          'upload-file',
          {
            filename: uniqueFilename,
            data: fileData,
            mimetype: file.mimetype,
            size: actualSize,
            originalName: file.originalName,
            folder: options?.folder,
            subfolder: options?.subfolder,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          }
        );

        this.logger.log(`File upload job queued successfully: ${job.id}`);

        // Return immediate response with queued status
        const folder = options?.folder ?? "general";
        const subfolder = options?.subfolder ?? "";
        const path = `uploads/${folder}/${subfolder}/${uniqueFilename}`.replace(/\/+/g, "/");

        return {
          filename: uniqueFilename,
          path: path,
          queued: true,
        };
      } else {
        // Direct upload without queue
        // Handle stream to buffer conversion if needed
        let fileData: Buffer | NodeJS.ReadableStream = file.data;
        let actualSize = file.size;

        if (!Buffer.isBuffer(file.data)) {
          // Convert stream to buffer for direct upload
          this.logger.debug(`Converting stream to buffer for direct upload: ${file.originalName}`);
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of file.data) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            fileData = Buffer.concat(chunks);
            actualSize = fileData.length;
            this.logger.debug(`Stream converted to buffer: ${actualSize} bytes`);
          } catch (streamError) {
            this.logger.error(`Error converting stream to buffer: ${streamError.message}`, streamError.stack);
            throw new FileUploadException(`Failed to read file stream: ${streamError.message}`);
          }
        }

        this.logger.log(`Uploading file directly: ${uniqueFilename} (${actualSize} bytes)`);
        
        const uploadedFile = await this.storage.uploadFile(
          {
            filename: uniqueFilename,
            data: fileData,
            mimetype: file.mimetype,
            size: actualSize,
          },
          {
            folder: options?.folder,
            subfolder: options?.subfolder,
          }
        );

        this.logger.log(`File uploaded successfully: ${uploadedFile.path}`);

        return {
          filename: uploadedFile.filename,
          path: uploadedFile.path,
          queued: false,
        };
      }
    // } catch (error) {
    //   this.logger.error(`File upload error: ${error.message}`, error.stack);
    //   if (error instanceof FileUploadException) {
    //     throw error;
    //   }
    //   throw new FileUploadException(error.message || 'Unknown error occurred during file upload');
    // }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.storage.deleteFile(filePath);
    } catch (error) {
      throw new FileUploadException(`Failed to delete file: ${error.message}`);
    }
  }
}

