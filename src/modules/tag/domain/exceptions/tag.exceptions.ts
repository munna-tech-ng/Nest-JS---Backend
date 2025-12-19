import { NotFoundException } from "@nestjs/common";

export class TagNotFoundException extends NotFoundException {
  constructor(id?: number) {
    super(`Tag with id ${id ?? 'provided'} not found`);
  }
}

export class TagAlreadyExistsException extends Error {
  constructor(name: string) {
    super(`Tag with name "${name}" already exists`);
  }
}

