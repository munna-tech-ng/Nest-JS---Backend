import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    is_guest: boolean('is_guest').default(false),
    code: text("code").default(""),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// export type
export type User = typeof user.$inferSelect;