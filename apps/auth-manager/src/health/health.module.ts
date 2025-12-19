import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        AuthModule, // Provides REDIS_CLIENT
    ],
    controllers: [HealthController],
})
export class HealthModule { }
