import { integer, pgTable, serial, text, timestamp, boolean, foreignKey, index } from "drizzle-orm/pg-core";
import { location } from "../location/location";

export const server = pgTable('servers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    ip: text('ip').notNull().unique(),
    port: integer('port').default(3500),
    status: text('status').default('offline'),
    is_premium: boolean('is_premium').default(false),
    is_active: boolean('is_active').default(true),
    is_deleted: boolean('is_deleted').default(false),
    ccu: integer('ccu').default(0),
    max_ccu: integer('max_ccu').default(100),
    bandwidth: integer('bandwidth').default(0),
    speed: integer('speed').default(0),
    priority: integer('priority').default(0),
    flag: text('flag').default(''),
    location_id: integer('location_id').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    description: text('description').default(''),
}, (table) => [
    foreignKey({
        columns: [table.location_id],
        foreignColumns: [location.id],
        name: 'fk_server_location',
    }),
    // index location_id
    index('idx_server_location_id').on(table.location_id),
]);

export type Server = typeof server.$inferSelect;