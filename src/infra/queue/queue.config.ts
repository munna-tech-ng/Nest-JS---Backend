import { registerAs } from "@nestjs/config";

export default registerAs('queue_config', () => ({
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD ?? undefined,
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    },
}));

export const FILE_UPLOAD_QUEUE = "backendv2-file-upload-queue";

