// dotenv import
import dotenv from 'dotenv';
dotenv.config({ path: ['.env', '.env.local'] });

// Database URL
export const DATABASE_URL = process.env.DATABASE_URL ?? null;
