import { health, Health } from './schema/users/health.schema';
import { Global, Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { DRIZZLE } from './db.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

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
                // Create drizzle entry
                return drizzle({ client: pool });
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