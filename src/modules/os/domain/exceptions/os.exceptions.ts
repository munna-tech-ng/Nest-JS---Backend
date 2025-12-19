import { NotFoundException } from "@nestjs/common";

export class OsNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`OS with id ${id ?? 'provided'} not found`);
  }
}

export class OsAlreadyExistsException extends Error {
  constructor(field: string, value: string) {
    super(`OS with ${field} "${value}" already exists`);
  }
}

