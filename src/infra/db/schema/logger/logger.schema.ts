import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const logger = pgTable('logger', {
  id: serial('id').primaryKey(),
  level: text('level').notNull().default('info'),
  message: text('message').notNull(),
  context: jsonb('context'),
  source: text('source'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Logger = typeof logger.$inferSelect;
export type NewLogger = typeof logger.$inferInsert;
