import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
    @Get()
    @Public()
    @ApiOperation({ summary: 'Vérifier l\'état de l\'API Gateway' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'api-gateway',
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
        };
    }

    @Get('ready')
    @Public()
    @ApiOperation({ summary: 'Vérifier si l\'API est prête (readiness probe)' })
    ready() {
        // Ici vous pourriez vérifier la connexion à Redis, etc.
        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('live')
    @Public()
    @ApiOperation({ summary: 'Vérifier si l\'API est vivante (liveness probe)' })
    live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
}