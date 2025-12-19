import { UploadedFile } from "../entities/uploaded-file.entity";

export interface StoragePort {
  uploadFile(
    file: {
      filename: string;
      data: Buffer | NodeJS.ReadableStream;
      mimetype: string;
      size: number;
    },
    options?: {
      folder?: string;
      subfolder?: string;
    }
  ): Promise<UploadedFile>;
  
  deleteFile(filePath: string): Promise<void>;
  
  getFileUrl(filePath: string): string;
}

export const STORAGE = "STORAGE_PORT";

