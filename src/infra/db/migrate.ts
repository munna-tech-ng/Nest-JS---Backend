/**
 * Production DB migrator (drizzle-orm, not drizzle-kit).
 * Usage: node dist/infra/db/migrate.js
 * Requires DATABASE_URL and ./drizzle migrations folder next to the app root.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
// import path from 'node:path';
import { resolve } from 'node:path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const migrationsFolder = process.env.DRIZZLE_MIGRATIONS_FOLDER
    ? path.resolve(process.env.DRIZZLE_MIGRATIONS_FOLDER)
    : path.resolve(process.cwd(), 'drizzle');

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool);

  try {
    console.log(`Migrating from ${migrationsFolder} …`);
    await migrate(db, {
      migrationsFolder,
      // Match drizzle.config.ts migrations.table / schema
      migrationsTable: 'migrations',
      migrationsSchema: 'public',
    });
    console.log('Migrations applied successfully');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
