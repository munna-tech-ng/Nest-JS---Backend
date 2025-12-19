import { BadRequestException, NotFoundException } from "@nestjs/common";

export class FileUploadException extends BadRequestException {
  constructor(message: string) {
    super(`File upload failed: ${message}`);
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
  }
}

export class InvalidFileTypeException extends BadRequestException {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
  }
}

export class FileSizeExceededException extends BadRequestException {
  constructor(maxSize: number) {
    super(`File size exceeds maximum allowed size: ${maxSize} bytes`);
  }
}

