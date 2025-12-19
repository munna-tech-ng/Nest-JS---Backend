import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { StoragePort, STORAGE } from '../../domain/contracts/storage.port';
import { Inject } from '@nestjs/common';

export interface FileUploadJobData {
  filename: string;
  data: Buffer;
  mimetype: string;
  size: number;
  originalName: string;
  folder?: string;
  subfolder?: string;
}

@Processor('file-upload-queue')
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

    try {
      const uploadedFile = await this.storage.uploadFile(
        {
          filename: job.data.filename,
          data: job.data.data,
          mimetype: job.data.mimetype,
          size: job.data.size,
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
      this.logger.error(`Failed to process file upload job ${job.id}:`, error);
      throw error;
    }
  }
}

