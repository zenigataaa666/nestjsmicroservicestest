/**
 * Controller de health check
 * 
 * Endpoints pour vérifier l'état du service (utilisé par PM2, Kubernetes, etc.)
 */

import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ) { }

    /**
     * Health check basique
     * Retourne l'état du service avec uptime et usage mémoire
     */
    @Get()
    @ApiOperation({ summary: 'Vérifier l\'état du service' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'auth-manager',
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
        };
    }

    /**
     * Readiness probe (Kubernetes)
     * Indique si le service est prêt à recevoir du trafic
     */
    @Get('ready')
    @ApiOperation({ summary: 'Readiness probe' })
    async ready() {
        const errors: string[] = [];

        // 1. Check DB
        try {
            if (!this.dataSource.isInitialized) {
                errors.push('Database not initialized');
            } else {
                await this.dataSource.query('SELECT 1');
            }
        } catch (e) {
            errors.push(`Database error: ${e.message}`);
        }

        // 2. Check Redis
        try {
            const ping = await this.redis.ping();
            if (ping !== 'PONG') errors.push('Redis ping failed');
        } catch (e) {
            errors.push(`Redis error: ${e.message}`);
        }

        if (errors.length > 0) {
            return {
                status: 'not_ready',
                errors,
                timestamp: new Date().toISOString(),
            };
        }

        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Liveness probe (Kubernetes)
     * Indique si le service est vivant
     */
    @Get('live')
    @ApiOperation({ summary: 'Liveness probe' })
    live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
}