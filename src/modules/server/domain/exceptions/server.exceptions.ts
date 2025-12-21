import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class ServerNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `Server with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "Server Not Found",
      {
        code: "SERVER_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class ServerAlreadyExistsException extends BaseException {
  constructor(field: string, value: string) {
    super(
      `Server with ${field} "${value}" already exists`,
      HttpStatus.CONFLICT,
      "Server Already Exists",
      {
        code: "SERVER_ALREADY_EXISTS",
        field: field,
        value: value,
      },
      false, // Don't log expected business exceptions
    );
  }
}

