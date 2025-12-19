import { NotFoundException } from "@nestjs/common";

export class ServerNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`Server with id ${id ?? 'provided'} not found`);
  }
}

export class ServerAlreadyExistsException extends Error {
  constructor(field: string, value: string) {
    super(`Server with ${field} "${value}" already exists`);
  }
}

