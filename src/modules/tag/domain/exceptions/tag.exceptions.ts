import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class TagNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `Tag with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "Tag Not Found",
      {
        code: "TAG_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class TagAlreadyExistsException extends BaseException {
  constructor(name: string) {
    super(
      `Tag with name "${name}" already exists`,
      HttpStatus.CONFLICT,
      "Tag Already Exists",
      {
        code: "TAG_ALREADY_EXISTS",
        field: "name",
        name: name,
      },
      false, // Don't log expected business exceptions
    );
  }
}

