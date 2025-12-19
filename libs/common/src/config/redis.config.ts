import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (configService: ConfigService) => ({
    transport: Transport.REDIS,
    options: {
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        retryAttempts: 5,
        retryDelay: 3000,
    },
});