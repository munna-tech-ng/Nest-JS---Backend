import { health, Health } from './schema/users/health.schema';
import { Global, Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { DRIZZLE } from './db.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as dbSchema from './schema';
import { relations as dbRelations } from './schema/relations';

// Helper to get the properly typed database instance
// This captures the return type of drizzle() which includes the query API
type DrizzleInstance = ReturnType<typeof drizzle<typeof dbSchema>>;

// Export the database type with query API support
export type Database = DrizzleInstance extends NodePgDatabase<infer T> 
    ? NodePgDatabase<T> & { query: any }
    : DrizzleInstance;

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: DRIZZLE,
            useFactory: (configService: ConfigService) => {
                const dbUrl = configService.get<string>('DATABASE_URL');
                if (!dbUrl) {
                    throw new Error("DATABASE_URL is not set");
                }
                // db pool
                const pool = new Pool({
                    connectionString: dbUrl,
                    max: 10
                });
                const db = drizzle({ 
                    client: pool, 
                    schema: dbSchema,
                    relations: dbRelations 
                });
                
                return db;
            },
            inject: [ConfigService],
        }
    ],
    exports: [DRIZZLE],
})

export class DBModule implements OnModuleInit {
    private readonly logger = new Logger(DBModule.name);

    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<Health>
    ) { }
    async onModuleInit() {
        // check postgresql connected or not
        try {
            await this.db.select().from(health);
            this.logger.log("PostgreSQL connected successfully");
        } catch (error) {
            this.logger.error("PostgreSQL connection failed", error);
            throw new Error("PostgreSQL connection failed");
        }
    }
}