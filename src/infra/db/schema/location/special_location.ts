import { foreignKey, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { location } from "./location";

export const special_location = pgTable('special_locations', {
    id: serial('id').primaryKey(),
    location_id: integer('location_id').notNull().references(() => location.id),
    type: text('type').notNull().default(''),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    foreignKey({ 
        columns: [table.location_id], 
        foreignColumns: [location.id], 
        name: 'fk_special_location_location' 
    }),
]);