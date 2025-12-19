import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface DashboardService {
    getDashboardStats(data: any): Observable<any>;
}

@Injectable()
export class DashboardGatewayService implements OnModuleInit {
    private dashboardService: DashboardService;

    constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) { }

    onModuleInit() {
        this.dashboardService = this.client.getService<DashboardService>('DashboardService');
    }

    getStats() {
        return this.dashboardService.getDashboardStats({});
    }
}
