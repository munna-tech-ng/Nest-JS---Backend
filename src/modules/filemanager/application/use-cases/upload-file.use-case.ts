import { Inject, Injectable } from "@nestjs/common";
import { FileUploadServicePort, FILE_UPLOAD_SERVICE } from "../../domain/contracts/file-upload-service.port";
import { UploadFileDto } from "../dto/upload-file.dto";
import { FileUploadException, InvalidFileTypeException, FileSizeExceededException } from "../../domain/exceptions";

@Injectable()
export class UploadFileUseCase {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadServicePort,
  ) {}

  async execute(
    file: {
      filename: string;
      data: Buffer | NodeJS.ReadableStream;
      mimetype: string;
      size: number;
      originalName: string;
    },
    options: UploadFileDto
  ) {
    // Validate file type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeException(this.ALLOWED_IMAGE_TYPES);
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new FileSizeExceededException(this.MAX_FILE_SIZE);
    }

    try {
      return await this.fileUploadService.uploadFile(file, {
        queue: options.queue,
        folder: options.folder,
        subfolder: options.subfolder,
      });
    } catch (error) {
      throw new FileUploadException(error.message);
    }
  }
}

