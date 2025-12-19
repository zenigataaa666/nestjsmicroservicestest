import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DashboardGatewayService } from './dashboard-gateway.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardGatewayController {
    constructor(private readonly dashboardService: DashboardGatewayService) { }

    @Get('stats')
    @Roles('admin', 'manager', 'hr_manager')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    async getStats() {
        return this.dashboardService.getStats();
    }
}
