import { NotFoundException } from "@nestjs/common";

export class CategoryNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`Category with id ${id ?? 'provided'} not found`);
  }
}

export class CategoryAlreadyExistsException extends Error {
  constructor(name: string) {
    super(`Category with name "${name}" already exists`);
  }
}

