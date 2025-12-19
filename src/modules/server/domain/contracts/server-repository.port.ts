import { Server } from "../entities/server.entity";

export interface ServerRepositoryPort {
  create(data: {
    name: string;
    ip: string;
    port?: number;
    status?: string;
    isPremium?: boolean;
    isActive?: boolean;
    ccu?: number;
    maxCcu?: number;
    bandwidth?: number;
    speed?: number;
    priority?: number;
    flag?: string;
    locationId?: number;
    description?: string;
    categoryIds?: number[];
    tagIds?: number[];
  }): Promise<Server>;
  update(id: number, data: {
    name?: string;
    ip?: string;
    port?: number;
    status?: string;
    isPremium?: boolean;
    isActive?: boolean;
    ccu?: number;
    maxCcu?: number;
    bandwidth?: number;
    speed?: number;
    priority?: number;
    flag?: string;
    locationId?: number;
    description?: string;
    categoryIds?: number[];
    tagIds?: number[];
  }): Promise<Server>;
  findById(id: number, includeDeleted?: boolean): Promise<Server | null>;
  findAll(options: { page?: number; limit?: number; includeDeleted?: boolean }): Promise<{ items: Server[]; total: number; page: number; limit: number }>;
  delete(id: number): Promise<void>;
  deleteMultiple(ids: number[]): Promise<void>;
  restore(id: number): Promise<void>;
  restoreMultiple(ids: number[]): Promise<void>;
  deletePermanent(id: number): Promise<void>;
  deletePermanentMultiple(ids: number[]): Promise<void>;
  addCategories(serverId: number, categoryIds: number[]): Promise<void>;
  removeCategories(serverId: number, categoryIds: number[]): Promise<void>;
  addTags(serverId: number, tagIds: number[]): Promise<void>;
  removeTags(serverId: number, tagIds: number[]): Promise<void>;
}

export const SERVER_REPO = "SERVER_REPOSITORY_PORT";

