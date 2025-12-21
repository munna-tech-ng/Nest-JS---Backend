import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class FileUploadException extends BaseException {
  constructor(message: string) {
    super(
      `File upload failed: ${message}`,
      HttpStatus.BAD_REQUEST,
      "File Upload Failed",
      {
        code: "FILE_UPLOAD_FAILED",
        message: message,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class FileNotFoundException extends BaseException {
  constructor(filePath: string) {
    super(
      `File not found: ${filePath}`,
      HttpStatus.NOT_FOUND,
      "File Not Found",
      {
        code: "FILE_NOT_FOUND",
        filePath: filePath,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class InvalidFileTypeException extends BaseException {
  constructor(allowedTypes: string[]) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      HttpStatus.BAD_REQUEST,
      "Invalid File Type",
      {
        code: "INVALID_FILE_TYPE",
        allowedTypes: allowedTypes,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class FileSizeExceededException extends BaseException {
  constructor(maxSize: number) {
    super(
      `File size exceeds maximum allowed size: ${maxSize} bytes`,
      HttpStatus.BAD_REQUEST,
      "File Size Exceeded",
      {
        code: "FILE_SIZE_EXCEEDED",
        maxSize: maxSize,
      },
      false, // Don't log expected business exceptions
    );
  }
}

