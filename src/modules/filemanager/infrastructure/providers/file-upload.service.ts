import { Inject, Injectable } from "@nestjs/common";
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
    try {
      // Generate unique filename
      const fileExtension = extname(file.originalName);
      const uniqueFilename = `${randomUUID()}${fileExtension}`;

      if (options?.queue === true) {
        // Queue the upload for background processing
        let fileData: Buffer;
        let actualSize = file.size;
        
        if (Buffer.isBuffer(file.data)) {
          fileData = file.data;
          actualSize = fileData.length;
        } else {
          // Convert stream to buffer for queue
          const chunks: Buffer[] = [];
          for await (const chunk of file.data) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          fileData = Buffer.concat(chunks);
          actualSize = fileData.length;
        }

        await this.fileUploadQueue.add(
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
        const uploadedFile = await this.storage.uploadFile(
          {
            filename: uniqueFilename,
            data: file.data,
            mimetype: file.mimetype,
            size: file.size,
          },
          {
            folder: options?.folder,
            subfolder: options?.subfolder,
          }
        );

        return {
          filename: uploadedFile.filename,
          path: uploadedFile.path,
          queued: false,
        };
      }
    } catch (error) {
      throw new FileUploadException(error.message);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.storage.deleteFile(filePath);
    } catch (error) {
      throw new FileUploadException(`Failed to delete file: ${error.message}`);
    }
  }
}

