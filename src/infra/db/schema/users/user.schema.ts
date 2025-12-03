import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    code: text("code").default(""),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// export type
export type User = typeof user.$inferSelect;