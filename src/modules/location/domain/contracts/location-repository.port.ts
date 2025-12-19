import { Location } from "../entities/location.entity";

export interface LocationRepositoryPort {
  create(data: { name: string; code: string; lat?: string; lng?: string; flag?: string }): Promise<Location>;
  update(id: number, data: { name?: string; code?: string; lat?: string; lng?: string; flag?: string }): Promise<Location>;
  findById(id: number): Promise<Location | null>;
  findAll(options: { page?: number; limit?: number; isPaginate?: boolean; orderBy?: string; sortOrder?: "asc" | "desc" }): Promise<{ items: Location[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
}

export const LOCATION_REPO = "LOCATION_REPOSITORY_PORT";

