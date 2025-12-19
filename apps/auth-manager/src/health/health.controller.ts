/**
 * Controller de health check
 * 
 * Endpoints pour vérifier l'état du service (utilisé par PM2, Kubernetes, etc.)
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
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
    ready() {
        // TODO: Vérifier la connexion DB et Redis
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