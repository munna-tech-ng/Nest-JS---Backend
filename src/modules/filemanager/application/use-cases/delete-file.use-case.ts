import { Inject, Injectable } from "@nestjs/common";
import { FileUploadServicePort, FILE_UPLOAD_SERVICE } from "../../domain/contracts/file-upload-service.port";
import { FileNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeleteFileUseCase {
  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadServicePort,
  ) {}

  async execute(filePath: string): Promise<void> {
    try {
      await this.fileUploadService.deleteFile(filePath);
    } catch (error) {
      throw new FileNotFoundException(filePath);
    }
  }
}

