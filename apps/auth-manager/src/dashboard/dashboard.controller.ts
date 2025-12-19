import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @GrpcMethod('DashboardService', 'GetDashboardStats')
    async getDashboardStats() {
        return this.dashboardService.getStats();
    }
}
