import { pgTable, serial, text, timestamp, index, boolean } from "drizzle-orm/pg-core";

export const category = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description').default(''),
    is_deleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    index('idx_category_name').on(table.name),
]);

export type Category = typeof category.$inferSelect;