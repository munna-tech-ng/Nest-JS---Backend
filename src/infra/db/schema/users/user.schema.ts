import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    is_guest: boolean('is_guest').default(false),
    phone: text("phone").unique(),
    code: text("code").default(""),
    password: text('password').notNull(),
    avatar: text("avatar").default(""),
    provider: text("provider").notNull(),
    provider_id: text("provider_id").default(""),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// export type
export type User = typeof user.$inferSelect;