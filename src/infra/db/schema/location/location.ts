import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const location = pgTable('locations', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    code: text('code').notNull().unique(),
    lat: text('lat').default(''),
    lng: text('lng').default(''),
    flag: text('flag').default(''),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    index('idx_location_code').on(table.code),
]);

export type Location = typeof location.$inferSelect;