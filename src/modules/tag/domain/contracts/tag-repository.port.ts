import { Tag } from "../entities/tag.entity";

export interface TagRepositoryPort {
  create(data: { name: string; description?: string }): Promise<Tag>;
  update(id: number, data: { name?: string; description?: string }): Promise<Tag>;
  findById(id: number, includeDeleted?: boolean): Promise<Tag | null>;
  findAll(options: { page?: number; limit?: number; includeDeleted?: boolean; isPaginate?: boolean; orderBy?: string; sortOrder?: "asc" | "desc" }): Promise<{ items: Tag[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
}

export const TAG_REPO = "TAG_REPOSITORY_PORT";

