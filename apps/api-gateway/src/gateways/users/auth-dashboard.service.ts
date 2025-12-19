import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface DashboardStatsService {
    getDashboardStats(data: any): Observable<any>;
}

@Injectable()
export class AuthDashboardService implements OnModuleInit {
    private dashboardService: DashboardStatsService;

    constructor(@Inject('USERS_PACKAGE') private client: ClientGrpc) { }

    onModuleInit() {
        this.dashboardService = this.client.getService<DashboardStatsService>('DashboardService');
    }

    getStats() {
        return this.dashboardService.getDashboardStats({});
    }
}
