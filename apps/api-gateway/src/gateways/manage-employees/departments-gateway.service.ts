import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface DepartmentsServiceClient {
    getDepartments(data: any): Observable<any>;
    getDepartment(data: { id: string }): Observable<any>;
    createDepartment(data: any): Observable<any>;
    updateDepartment(data: any): Observable<any>;
    deleteDepartment(data: { id: string; deleted_by?: string }): Observable<any>;
}

@Injectable()
export class DepartmentsGatewayService implements OnModuleInit {
    private departmentsService: DepartmentsServiceClient;

    constructor(
        @Inject('MANAGER_EMPLOYEES_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.departmentsService = this.client.getService<DepartmentsServiceClient>('DepartmentsService');
    }

    async getDepartments(query: any) {
        return lastValueFrom(this.departmentsService.getDepartments({
            page: query.page || 1,
            limit: query.limit || 10,
            search: query.search || '',
        }));
    }

    async getDepartment(id: string) {
        return lastValueFrom(this.departmentsService.getDepartment({ id }));
    }

    async createDepartment(data: any) {
        return lastValueFrom(this.departmentsService.createDepartment(data));
    }

    async updateDepartment(id: string, data: any) {
        return lastValueFrom(this.departmentsService.updateDepartment({ ...data, id }));
    }

    async deleteDepartment(id: string, deletedBy: string) {
        return lastValueFrom(this.departmentsService.deleteDepartment({ id, deleted_by: deletedBy }));
    }
}
