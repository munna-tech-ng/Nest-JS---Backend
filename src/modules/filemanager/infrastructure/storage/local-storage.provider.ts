import { Injectable } from "@nestjs/common";
import { StoragePort } from "../../domain/contracts/storage.port";
import { UploadedFile } from "../../domain/entities/uploaded-file.entity";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { unlink } from "fs/promises";
import { join } from "path";
import { pipeline } from "stream/promises";

@Injectable()
export class LocalStorageProvider implements StoragePort {
  private readonly basePath: string;

  constructor() {
    // Default to public/uploads directory
    this.basePath = join(process.cwd(), "public", "uploads");
    this.ensureDirectoryExists(this.basePath);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      try {
        // Create directory and all parent directories if they don't exist
        mkdirSync(dirPath, { recursive: true });
      } catch (error) {
        throw new Error(`Failed to create directory: ${dirPath}. Error: ${error.message}`);
      }
    }
  }

  async uploadFile(
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
  ): Promise<UploadedFile> {
    const folder = options?.folder ?? "general";
    const subfolder = options?.subfolder ?? "";
    
    // Build the full upload path
    const uploadPath = join(this.basePath, folder, subfolder);
    
    // Ensure directory exists before writing (creates all parent directories if needed)
    this.ensureDirectoryExists(uploadPath);

    const filePath = join(uploadPath, file.filename);
    const relativePath = join("uploads", folder, subfolder, file.filename).replace(/\\/g, "/");

    try {
      // Double-check directory exists right before writing (in case of race conditions)
      this.ensureDirectoryExists(uploadPath);
      
      if (Buffer.isBuffer(file.data)) {
        // Handle Buffer
        const writeStream = createWriteStream(filePath);
        writeStream.write(file.data);
        writeStream.end();
        await new Promise<void>((resolve, reject) => {
          writeStream.on("finish", () => resolve());
          writeStream.on("error", (err) => reject(err));
        });
      } else {
        // Handle Stream
        const writeStream = createWriteStream(filePath);
        await pipeline(file.data, writeStream);
      }

      return new UploadedFile(
        file.filename,
        relativePath,
        file.filename,
        file.mimetype,
        file.size,
        new Date(),
      );
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(process.cwd(), "public", filePath);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      await unlink(fullPath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  getFileUrl(filePath: string): string {
    // Return relative path that can be served via /public/ route
    return `/public/${filePath}`;
  }
}

