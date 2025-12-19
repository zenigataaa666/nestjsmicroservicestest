import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthDashboardService } from './auth-dashboard.service';

@ApiTags('Auth Dashboard')
@Controller('auth/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuthDashboardController {
    constructor(private readonly dashboardService: AuthDashboardService) { }

    @Get('stats')
    @Roles('admin')
    @ApiOperation({ summary: 'Get auth dashboard statistics' })
    async getStats() {
        return this.dashboardService.getStats();
    }
}
