import { NotFoundException } from "@nestjs/common";

export class LocationNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`Location with id ${id ?? 'provided'} not found`);
  }
}

export class LocationAlreadyExistsException extends Error {
  constructor(field: string, value: string) {
    super(`Location with ${field} "${value}" already exists`);
  }
}

export class SpecialLocationNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`Special location with id ${id ?? 'provided'} not found`);
  }
}

