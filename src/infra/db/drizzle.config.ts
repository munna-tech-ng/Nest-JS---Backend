
import type { Config } from "drizzle-kit";
import { DATABASE_URL } from "../../core/utils/env"

export default {
  schema: "./src/infra/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL as string,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
} satisfies Config;