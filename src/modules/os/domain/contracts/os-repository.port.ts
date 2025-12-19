import { Os } from "../entities/os.entity";

export interface OsRepositoryPort {
  create(data: { name: string; code: string; description?: string }): Promise<Os>;
  update(id: number, data: { name?: string; code?: string; description?: string }): Promise<Os>;
  findById(id: number, includeDeleted?: boolean): Promise<Os | null>;
  findAll(options: { page?: number; limit?: number; includeDeleted?: boolean }): Promise<{ items: Os[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
}

export const OS_REPO = "OS_REPOSITORY_PORT";

