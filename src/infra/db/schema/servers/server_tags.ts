import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { server } from "./server";
import { tag } from "./tag";

export const server_tags = pgTable('server_tags', {
    server_id: integer('server_id').notNull().references(() => server.id),
    tag_id: integer('tag_id').notNull().references(() => tag.id),
}, (table) => [
    primaryKey({ columns: [table.server_id, table.tag_id] }),
]);