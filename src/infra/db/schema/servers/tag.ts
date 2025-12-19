import { pgTable, serial, text, timestamp, index, boolean } from "drizzle-orm/pg-core";

export const tag = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description').default(''),
    is_deleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    index('idx_tag_name').on(table.name),
]);

export type Tag = typeof tag.$inferSelect;