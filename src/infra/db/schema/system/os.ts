import { pgTable, serial, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const os = pgTable('os', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    code: text('code').notNull().unique(),
    description: text('description').default(''),
    is_deleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    index('idx_os_code').on(table.code),
]);
export type Os = typeof os.$inferSelect;