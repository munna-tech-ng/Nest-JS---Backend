import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class LocationNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `Location with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "Location Not Found",
      {
        code: "LOCATION_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class LocationAlreadyExistsException extends BaseException {
  constructor(field: string, value: string) {
    super(
      `Location with ${field} "${value}" already exists`,
      HttpStatus.CONFLICT,
      "Location Already Exists",
      {
        code: "LOCATION_ALREADY_EXISTS",
        field: field,
        value: value,
      },
      false, // Don't log expected business exceptions
    );
  }
}

export class SpecialLocationNotFoundException extends BaseException {
  constructor(id?: number) {
    super(
      `Special location with id ${id ?? 'provided'} not found`,
      HttpStatus.NOT_FOUND,
      "Special Location Not Found",
      {
        code: "SPECIAL_LOCATION_NOT_FOUND",
        id: id,
      },
      false, // Don't log expected business exceptions
    );
  }
}

