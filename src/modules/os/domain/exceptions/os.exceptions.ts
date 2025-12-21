import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class OsNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `OS with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "OS Not Found",
      {
        code: "OS_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class OsAlreadyExistsException extends BaseException {
  constructor(field: string, value: string) {
    super(
      `OS with ${field} "${value}" already exists`,
      HttpStatus.CONFLICT,
      "OS Already Exists",
      {
        code: "OS_ALREADY_EXISTS",
        field: field,
        value: value,
      },
      false, // Don't log expected business exceptions
    );
  }
}

