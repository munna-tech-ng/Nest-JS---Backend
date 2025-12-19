import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
import { ServerRepositoryPort } from "../../domain/contracts/server-repository.port";
import { Server } from "../../domain/entities/server.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class ServerRepository implements ServerRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: {
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
  }): Promise<Server> {
    const [result] = await this.db
      .insert(schema.server)
      .values({
        name: data.name,
        ip: data.ip,
        port: data.port ?? 3500,
        status: data.status ?? "offline",
        is_premium: data.isPremium ?? false,
        is_active: data.isActive ?? true,
        ccu: data.ccu ?? 0,
        max_ccu: data.maxCcu ?? 100,
        bandwidth: data.bandwidth ?? 0,
        speed: data.speed ?? 0,
        priority: data.priority ?? 0,
        flag: data.flag ?? "",
        location_id: data.locationId ?? 0,
        description: data.description ?? "",
      })
      .returning();

    const server = Server.fromSchema(result);

    // Handle categories
    if (data.categoryIds && data.categoryIds.length > 0) {
      await this.addCategories(server.id, data.categoryIds);
    }

    // Handle tags
    if (data.tagIds && data.tagIds.length > 0) {
      await this.addTags(server.id, data.tagIds);
    }

    return server;
  }

  async update(id: number, data: {
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
  }): Promise<Server> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.ip !== undefined) updateData.ip = data.ip;
    if (data.port !== undefined) updateData.port = data.port;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isPremium !== undefined) updateData.is_premium = data.isPremium;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.ccu !== undefined) updateData.ccu = data.ccu;
    if (data.maxCcu !== undefined) updateData.max_ccu = data.maxCcu;
    if (data.bandwidth !== undefined) updateData.bandwidth = data.bandwidth;
    if (data.speed !== undefined) updateData.speed = data.speed;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.flag !== undefined) updateData.flag = data.flag;
    if (data.locationId !== undefined) updateData.location_id = data.locationId;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.server)
      .set(updateData)
      .where(eq(schema.server.id, id))
      .returning();

    if (!result) {
      throw new Error("Server not found");
    }

    // Handle categories
    if (data.categoryIds !== undefined) {
      // Remove all existing categories
      await this.db.delete(schema.server_category).where(eq(schema.server_category.server_id, id));
      // Add new categories
      if (data.categoryIds.length > 0) {
        await this.addCategories(id, data.categoryIds);
      }
    }

    // Handle tags
    if (data.tagIds !== undefined) {
      // Remove all existing tags
      await this.db.delete(schema.server_tags).where(eq(schema.server_tags.server_id, id));
      // Add new tags
      if (data.tagIds.length > 0) {
        await this.addTags(id, data.tagIds);
      }
    }

    return Server.fromSchema(result);
  }

  async findById(id: number, includeDeleted: boolean = false): Promise<Server | null> {
    const conditions = includeDeleted
      ? eq(schema.server.id, id)
      : and(eq(schema.server.id, id), eq(schema.server.is_deleted, false));

    const result = await this.db.query.server.findFirst({
      where: conditions,
    });

    return result ? Server.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Server[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    const conditions = includeDeleted ? undefined : eq(schema.server.is_deleted, false);

    const orderFn = sortOrder === "asc" ? asc : desc;
    let orderByClause: any[];
    switch (orderBy) {
      case "name":
        orderByClause = [orderFn(schema.server.name)];
        break;
      case "ip":
        orderByClause = [orderFn(schema.server.ip)];
        break;
      case "status":
        orderByClause = [orderFn(schema.server.status)];
        break;
      case "createdAt":
        orderByClause = [orderFn(schema.server.createdAt)];
        break;
      case "updatedAt":
        orderByClause = [orderFn(schema.server.updatedAt)];
        break;
      default:
        orderByClause = [orderFn(schema.server.createdAt)];
    }

    const queryOptions: any = {
      where: conditions,
      orderBy: orderByClause,
    };

    if (isPaginate) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const [items, totalResult] = await Promise.all([
      this.db.query.server.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.server)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Server.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.server)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.server.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.server)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.server.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.server)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.server.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.server)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.server.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    // Delete relationships first
    await this.db.delete(schema.server_category).where(eq(schema.server_category.server_id, id));
    await this.db.delete(schema.server_tags).where(eq(schema.server_tags.server_id, id));
    // Delete server
    await this.db.delete(schema.server).where(eq(schema.server.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    // Delete relationships first
    await this.db.delete(schema.server_category).where(inArray(schema.server_category.server_id, ids));
    await this.db.delete(schema.server_tags).where(inArray(schema.server_tags.server_id, ids));
    // Delete servers
    await this.db.delete(schema.server).where(inArray(schema.server.id, ids));
  }

  async addCategories(serverId: number, categoryIds: number[]): Promise<void> {
    if (categoryIds.length === 0) return;
    await this.db.insert(schema.server_category).values(
      categoryIds.map(categoryId => ({
        server_id: serverId,
        category_id: categoryId,
      }))
    );
  }

  async removeCategories(serverId: number, categoryIds: number[]): Promise<void> {
    if (categoryIds.length === 0) return;
    await this.db.delete(schema.server_category)
      .where(
        and(
          eq(schema.server_category.server_id, serverId),
          inArray(schema.server_category.category_id, categoryIds)
        )
      );
  }

  async addTags(serverId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    await this.db.insert(schema.server_tags).values(
      tagIds.map(tagId => ({
        server_id: serverId,
        tag_id: tagId,
      }))
    );
  }

  async removeTags(serverId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    await this.db.delete(schema.server_tags)
      .where(
        and(
          eq(schema.server_tags.server_id, serverId),
          inArray(schema.server_tags.tag_id, tagIds)
        )
      );
  }
}

