import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const health = pgTable('health', {
    id: serial('id').primaryKey(),
    status: text('status').notNull(),
});

export type Health = typeof health.$inferSelect;