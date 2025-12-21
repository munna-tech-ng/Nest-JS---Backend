import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { StoragePort, STORAGE } from '../../domain/contracts/storage.port';
import { Inject } from '@nestjs/common';
import { FILE_UPLOAD_QUEUE } from 'src/infra/queue/queue.config';

export interface FileUploadJobData {
  filename: string;
  data: Buffer;
  mimetype: string;
  size: number;
  originalName: string;
  folder?: string;
  subfolder?: string;
}

@Processor(FILE_UPLOAD_QUEUE)
export class FileUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(FileUploadProcessor.name);

  constructor(
    @Inject(STORAGE)
    private readonly storage: StoragePort,
  ) {
    super();
  }

  async process(job: Job<FileUploadJobData>) {
    this.logger.log(`Processing file upload job ${job.id}: ${job.data.filename}`);
    this.logger.debug(`Job data: ${JSON.stringify({ 
      filename: job.data.filename, 
      size: job.data.size, 
      mimetype: job.data.mimetype,
      folder: job.data.folder,
      subfolder: job.data.subfolder,
      dataType: job.data.data ? (Buffer.isBuffer(job.data.data) ? 'Buffer' : typeof job.data.data) : 'null'
    })}`);

    try {
      // Ensure data is a Buffer (BullMQ may deserialize it differently)
      let fileData: Buffer;
      if (Buffer.isBuffer(job.data.data)) {
        fileData = job.data.data;
      } else if (typeof job.data.data === 'string') {
        // If it was serialized as base64 string, convert back to Buffer
        fileData = Buffer.from(job.data.data, 'base64');
      } else if (job.data.data && typeof job.data.data === 'object' && 'type' in job.data.data && 'data' in job.data.data) {
        // Handle Buffer-like object from serialization
        fileData = Buffer.from((job.data.data as any).data);
      } else {
        throw new Error(`Invalid file data type: ${typeof job.data.data}. Expected Buffer.`);
      }

      this.logger.debug(`File data size: ${fileData.length} bytes`);

      const uploadedFile = await this.storage.uploadFile(
        {
          filename: job.data.filename,
          data: fileData,
          mimetype: job.data.mimetype,
          size: fileData.length,
        },
        {
          folder: job.data.folder,
          subfolder: job.data.subfolder,
        }
      );

      this.logger.log(`File uploaded successfully: ${uploadedFile.path}`);

      return {
        success: true,
        filename: uploadedFile.filename,
        path: uploadedFile.path,
      };
    } catch (error) {
      this.logger.error(`Failed to process file upload job ${job.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

