import { Category } from "../entities/category.entity";

export interface CategoryRepositoryPort {
  create(data: { name: string; description?: string }): Promise<Category>;
  update(id: number, data: { name?: string; description?: string }): Promise<Category>;
  findById(id: number, includeDeleted?: boolean): Promise<Category | null>;
  findAll(options: { page?: number; limit?: number; includeDeleted?: boolean }): Promise<{ items: Category[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
}

export const CATEGORY_REPO = "CATEGORY_REPOSITORY_PORT";

