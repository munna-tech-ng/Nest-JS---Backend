import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { FILE_UPLOAD_QUEUE } from './queue.config';

@Global()
@Module({
    imports: [
        ConfigModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
                const redisPort = configService.get<number>('REDIS_PORT', 6379);
                const redisPassword = configService.get<string>('REDIS_PASSWORD');

                return {
                    connection: {
                        host: redisHost,
                        port: redisPort,
                        ...(redisPassword && { password: redisPassword }),
                    },
                };
            },
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: FILE_UPLOAD_QUEUE,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule implements OnModuleInit {
    private readonly logger = new Logger(QueueModule.name);

    onModuleInit() {
        this.logger.log('Queue module initialized');
    }
}

