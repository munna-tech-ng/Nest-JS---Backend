import { SpecialLocation } from "../entities/special-location.entity";

export interface SpecialLocationRepositoryPort {
  create(data: { locationId: number; type: string }): Promise<SpecialLocation>;
  update(id: number, data: { locationId?: number; type?: string }): Promise<SpecialLocation>;
  findById(id: number): Promise<SpecialLocation | null>;
  findAll(options: { page?: number; limit?: number; locationId?: number; isPaginate?: boolean; orderBy?: string; sortOrder?: "asc" | "desc" }): Promise<{ items: SpecialLocation[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
}

export const SPECIAL_LOCATION_REPO = "SPECIAL_LOCATION_REPOSITORY_PORT";

