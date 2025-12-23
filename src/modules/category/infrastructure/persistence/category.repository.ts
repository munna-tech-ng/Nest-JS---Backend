import { Inject, Injectable } from "@nestjs/common";
import { eq, inArray, sql } from "drizzle-orm";
import { CategoryRepositoryPort } from "../../domain/contracts/category-repository.port";
import { Category } from "../../domain/entities/category.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";
import { Database } from "src/infra/db/db.module";

@Injectable()
export class CategoryRepository implements CategoryRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async create(data: { name: string; description?: string }): Promise<Category> {
    const [result] = await this.db
      .insert(schema.category)
      .values({
        name: data.name,
        description: data.description ?? "",
      })
      .returning();

    return Category.fromSchema(result);
  }

  async update(id: number, data: { name?: string; description?: string }): Promise<Category> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.category)
      .set(updateData)
      .where(eq(schema.category.id, id))
      .returning();

    if (!result) {
      throw new Error("Category not found");
    }

    return Category.fromSchema(result);
  }

  async findById(id: number, includeDeleted: boolean = false): Promise<Category | null> {
    // Query API v2: where should use callback function, not SQL objects
    const result = await this.db.query.category.findFirst({
      where: includeDeleted
        ? (category, { eq }) => eq(category.id, id)
        : (category, { eq, and }) => and(eq(category.id, id), eq(category.is_deleted, false)),
    });

    return result ? Category.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Category[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    // For query API v2: orderBy should be an object { field: "asc" | "desc" }
    let orderByForQueryAPI: Record<string, "asc" | "desc">;
    const conditions = includeDeleted ? undefined : eq(schema.category.is_deleted, false);
    
    switch (orderBy) {
      case "name":
        orderByForQueryAPI = { name: sortOrder };
        break;
      case "createdAt":
        orderByForQueryAPI = { createdAt: sortOrder };
        break;
      case "updatedAt":
        orderByForQueryAPI = { updatedAt: sortOrder };
        break;
      default:
        orderByForQueryAPI = { createdAt: sortOrder };
    }

    // Query API v2: where should use callback function, not SQL objects
    const queryOptions: any = {
      where: includeDeleted
        ? undefined
        : (category: any, { eq }: any) => eq(category.is_deleted, false),
      orderBy: orderByForQueryAPI,
    };

    if (isPaginate) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const [items, totalResult] = await Promise.all([
      this.db.query.category.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.category)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Category.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.category)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.category.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(schema.category)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.category.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.category)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.category.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(schema.category)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.category.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.category).where(eq(schema.category.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db.delete(schema.category).where(inArray(schema.category.id, ids));
  }
}

