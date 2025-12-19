import { UploadedFile } from "../entities/uploaded-file.entity";

export interface FileUploadServicePort {
  uploadFile(
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
  ): Promise<{ filename: string; path: string; queued?: boolean }>;
  
  deleteFile(filePath: string): Promise<void>;
}

export const FILE_UPLOAD_SERVICE = "FILE_UPLOAD_SERVICE_PORT";

