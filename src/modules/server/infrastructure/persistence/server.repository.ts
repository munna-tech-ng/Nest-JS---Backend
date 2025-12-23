import { Inject, Injectable } from "@nestjs/common";
import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
import { ServerRepositoryPort } from "../../domain/contracts/server-repository.port";
import { Server } from "../../domain/entities/server.entity";
import { Location } from "src/modules/location/domain/entities/location.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import { Database } from "src/infra/db/db.module";
import * as schema from "src/infra/db/schema";
import { ServerSchema } from "src/infra/db/schema/servers/server";

@Injectable()
export class ServerRepository implements ServerRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) { }

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
      .insert(schema.serverSchema)
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
      .update(schema.serverSchema)
      .set(updateData)
      .where(eq(schema.serverSchema.id, id))
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

  async findById(id: number, includeDeleted: boolean = false, withLocation: boolean = false): Promise<Server | null> {
    const conditions = includeDeleted
      ? (server: ServerSchema, { eq }) => eq(server.id, id)
      : (server: ServerSchema, { eq, and }) => and(eq(server.id, id), eq(server.is_deleted, false));

    const withClause = withLocation ? {
      location: true,
    } : undefined;

    // Use query API if available, otherwise fallback to regular query builder
    if (this.db.query?.serverSchema) {
      // Query API v2: where should use callback function, not SQL objects
      const result = await this.db.query.serverSchema.findFirst({
        where: conditions,
        with: withClause,
      });
      return result ? Server.fromSchema(result) : null;
    }

    // Fallback to regular query builder
    const [result] = await this.db
      .select()
      .from(schema.serverSchema)
      .where(conditions as any)
      .limit(1);

    if (!result) {
      return null;
    }

    // If withLocation is true, fetch location separately
    if (withLocation && result.location_id) {
      const [location] = await this.db
        .select()
        .from(schema.location)
        .where(eq(schema.location.id, result.location_id))
        .limit(1);
      
      return Server.fromSchema({ ...result, location: location || undefined });
    }

    return Server.fromSchema(result);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
    groupByLocation?: boolean;
  }): Promise<{ items: Server[] | Array<{ location: Location; servers: Server[] }>; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";
    const groupByLocation = options.groupByLocation ?? false;
    const conditions = includeDeleted ? undefined : eq(schema.serverSchema.is_deleted, false);

    // If grouping by location, use a different approach
    if (groupByLocation) {
      return this.findAllGroupedByLocation({
        page,
        limit,
        isPaginate,
        includeDeleted,
        orderBy,
        sortOrder,
      });
    }

    // For query API v2: orderBy should be an object { field: "asc" | "desc" }
    // For regular query builder: orderBy should be an array of SQL functions
    let orderByForQueryAPI: Record<string, "asc" | "desc">;
    let orderByClause: any[];
    
    switch (orderBy) {
      case "name":
        orderByForQueryAPI = { name: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.name) : desc(schema.serverSchema.name)];
        break;
      case "ip":
        orderByForQueryAPI = { ip: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.ip) : desc(schema.serverSchema.ip)];
        break;
      case "status":
        orderByForQueryAPI = { status: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.status) : desc(schema.serverSchema.status)];
        break;
      case "createdAt":
        orderByForQueryAPI = { createdAt: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.createdAt) : desc(schema.serverSchema.createdAt)];
        break;
      case "updatedAt":
        orderByForQueryAPI = { updatedAt: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.updatedAt) : desc(schema.serverSchema.updatedAt)];
        break;
      default:
        orderByForQueryAPI = { createdAt: sortOrder };
        orderByClause = [sortOrder === "asc" ? asc(schema.serverSchema.createdAt) : desc(schema.serverSchema.createdAt)];
    }

    // Query API v2: where should use callback function, not SQL objects
    const queryOptions: any = {
      where: includeDeleted
        ? undefined
        : (server: any, { eq }: any) => eq(server.is_deleted, false),
      orderBy: orderByForQueryAPI,
    };

    if (isPaginate) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    // Use query API if available, otherwise fallback to regular query builder
    let items: any[];
    let totalResult: any[];

    if (this.db.query?.serverSchema) {
      [items, totalResult] = await Promise.all([
        this.db.query.serverSchema.findMany(queryOptions),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(schema.serverSchema)
          .where(conditions ?? sql`1=1`),
      ]);
    } else {
      // Fallback to regular query builder
      const baseQuery = this.db
        .select()
        .from(schema.serverSchema)
        .where(conditions ?? sql`1=1`)
        .orderBy(...orderByClause);
      
      const itemsQuery = isPaginate 
        ? baseQuery.limit(limit).offset((page - 1) * limit)
        : baseQuery;
      
      [items, totalResult] = await Promise.all([
        itemsQuery,
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(schema.serverSchema)
          .where(conditions ?? sql`1=1`),
      ]);
    }

    return {
      items: items.map((item) => Server.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async findByIp(ip: string): Promise<Server | null> {
    const [result] = await this.db.select().from(schema.serverSchema).where(eq(schema.serverSchema.ip, ip)).limit(1);
    return result ? Server.fromSchema(result) : null;
  }

  private async findAllGroupedByLocation(options: {
    page: number;
    limit: number;
    isPaginate: boolean;
    includeDeleted: boolean;
    orderBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ items: Array<{ location: Location; servers: Server[] }>; total: number; page: number; limit: number }> {
    const { page, limit, isPaginate, includeDeleted, orderBy, sortOrder } = options;
    const conditions = includeDeleted ? undefined : eq(schema.serverSchema.is_deleted, false);

    // Build orderBy clause for servers
    const orderFn = sortOrder === "asc" ? asc : desc;
    let serverOrderByClause: any[];
    switch (orderBy) {
      case "name":
        serverOrderByClause = [orderFn(schema.serverSchema.name)];
        break;
      case "ip":
        serverOrderByClause = [orderFn(schema.serverSchema.ip)];
        break;
      case "status":
        serverOrderByClause = [orderFn(schema.serverSchema.status)];
        break;
      case "createdAt":
        serverOrderByClause = [orderFn(schema.serverSchema.createdAt)];
        break;
      case "updatedAt":
        serverOrderByClause = [orderFn(schema.serverSchema.updatedAt)];
        break;
      default:
        serverOrderByClause = [orderFn(schema.serverSchema.createdAt)];
    }

    // Fetch all servers with their location relation
    let serversWithLocation: any[];
    if (this.db.query?.serverSchema) {
      serversWithLocation = await this.db.query.serverSchema.findMany({
        where: includeDeleted
          ? undefined
          : (server: any, { eq }: any) => eq(server.is_deleted, false),
        with: {
          location: true,
        },
        orderBy: { [orderBy]: sortOrder },
      });
    } else {
      // Fallback: fetch servers and locations separately
      const servers = await this.db
        .select()
        .from(schema.serverSchema)
        .where(conditions ?? sql`1=1`)
        .orderBy(...serverOrderByClause);

      // Get unique location IDs (filter out null/undefined and 0)
      const locationIds = [...new Set(servers.map(s => s.location_id).filter((id): id is number => id !== null && id !== undefined && id > 0))];
      
      // Fetch locations
      const locations = locationIds.length > 0
        ? await this.db
            .select()
            .from(schema.location)
            .where(inArray(schema.location.id, locationIds))
        : [];

      // Map locations by ID
      const locationMap = new Map(locations.map(loc => [loc.id, loc]));

      // Combine servers with locations
      serversWithLocation = servers.map(server => ({
        ...server,
        location: server.location_id ? locationMap.get(server.location_id) || null : null,
      }));
    }

    // Group servers by location
    const locationMap = new Map<number, { location: any; servers: any[] }>();

    for (const server of serversWithLocation) {
      const locationId = server.location_id;
      if (!locationId || locationId === 0 || !server.location) {
        continue; // Skip servers without location
      }

      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          location: Location.fromSchema(server.location),
          servers: [],
        });
      }

      locationMap.get(locationId)!.servers.push(Server.fromSchema(server));
    }

    // Convert map to array and sort servers within each location
    const groupedItems = Array.from(locationMap.values()).map(group => ({
      location: group.location,
      servers: group.servers.sort((a, b) => {
        // Sort servers within location based on orderBy
        switch (orderBy) {
          case "name":
            return sortOrder === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          case "ip":
            return sortOrder === "asc"
              ? a.ip.localeCompare(b.ip)
              : b.ip.localeCompare(a.ip);
          case "status":
            return sortOrder === "asc"
              ? a.status.localeCompare(b.status)
              : b.status.localeCompare(a.status);
          case "createdAt":
            return sortOrder === "asc"
              ? a.createdAt.getTime() - b.createdAt.getTime()
              : b.createdAt.getTime() - a.createdAt.getTime();
          case "updatedAt":
            return sortOrder === "asc"
              ? a.updatedAt.getTime() - b.updatedAt.getTime()
              : b.updatedAt.getTime() - a.updatedAt.getTime();
          default:
            return sortOrder === "asc"
              ? a.createdAt.getTime() - b.createdAt.getTime()
              : b.createdAt.getTime() - a.createdAt.getTime();
        }
      }),
    }));

    // Sort locations by name (you can change this to sort by other fields)
    groupedItems.sort((a, b) => a.location.name.localeCompare(b.location.name));

    // Apply pagination on grouped locations
    const total = groupedItems.length;
    let paginatedItems = groupedItems;

    if (isPaginate) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedItems = groupedItems.slice(startIndex, endIndex);
    }

    return {
      items: paginatedItems,
      total,
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : paginatedItems.length,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.serverSchema)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.serverSchema.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.serverSchema)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.serverSchema.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.serverSchema)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.serverSchema.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.serverSchema)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.serverSchema.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    // Delete relationships first
    await this.db.delete(schema.server_category).where(eq(schema.server_category.server_id, id));
    await this.db.delete(schema.server_tags).where(eq(schema.server_tags.server_id, id));
    // Delete server
    await this.db.delete(schema.serverSchema).where(eq(schema.serverSchema.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    // Delete relationships first
    await this.db.delete(schema.server_category).where(inArray(schema.server_category.server_id, ids));
    await this.db.delete(schema.server_tags).where(inArray(schema.server_tags.server_id, ids));
    // Delete servers
    await this.db.delete(schema.serverSchema).where(inArray(schema.serverSchema.id, ids));
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

