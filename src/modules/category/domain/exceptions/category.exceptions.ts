import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class CategoryNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `Category with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "Category Not Found",
      {
        code: "CATEGORY_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class CategoryAlreadyExistsException extends BaseException {
  constructor(name: string) {
    super(
      `Category with name "${name}" already exists`,
      HttpStatus.CONFLICT,
      "Category Already Exists",
      {
        code: "CATEGORY_ALREADY_EXISTS",
        field: "name",
        name: name,
      },
      false, // Don't log expected business exceptions
    );
  }
}

