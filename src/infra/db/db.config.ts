import { registerAs } from "@nestjs/config";

export default registerAs('db_config', () => ({
    url: process.env.DATABASE_URL ?? null,
    config: 'DRZZLE'
}));

export const DRIZZLE = "DRIZZLE_DB";