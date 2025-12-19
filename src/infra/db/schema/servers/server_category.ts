import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { server } from "./server";
import { category } from "./category";

export const server_category = pgTable('server_categories', {
    server_id: integer('server_id').notNull().references(() => server.id),
    category_id: integer('category_id').notNull().references(() => category.id),
}, (table) => [
    primaryKey({ columns: [table.server_id, table.category_id] }),
]);