import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface EmployeesServiceClient {
    getEmployees(data: any): Observable<any>;
    getEmployee(data: { id: string }): Observable<any>;
    createEmployee(data: any): Observable<any>;
    updateEmployee(data: any): Observable<any>;
    deleteEmployee(data: { id: string; deleted_by?: string }): Observable<any>;
    getEmployeesByDepartment(data: { department_id: string }): Observable<any>;
}

@Injectable()
export class EmployeesGatewayService implements OnModuleInit {
    private employeesService: EmployeesServiceClient;

    constructor(
        @Inject('MANAGER_EMPLOYEES_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.employeesService = this.client.getService<EmployeesServiceClient>('EmployeesService');
    }

    async getEmployees(query: any) {
        return lastValueFrom(this.employeesService.getEmployees({
            page: query.page || 1,
            limit: query.limit || 10,
            search: query.search || '',
            department_id: query.department_id || '',
            is_active: query.is_active !== undefined ? query.is_active : true,
            sort_by: query.sort_by || 'last_name',
            sort_order: query.sort_order || 'ASC',
        }));
    }

    async getEmployee(id: string) {
        return lastValueFrom(this.employeesService.getEmployee({ id }));
    }

    async createEmployee(data: any) {
        return lastValueFrom(this.employeesService.createEmployee(data));
    }

    async updateEmployee(id: string, data: any) {
        return lastValueFrom(this.employeesService.updateEmployee({ ...data, id }));
    }

    async deleteEmployee(id: string, deletedBy: string) {
        return lastValueFrom(this.employeesService.deleteEmployee({ id, deleted_by: deletedBy }));
    }

    async getEmployeesByDepartment(departmentId: string) {
        return lastValueFrom(this.employeesService.getEmployeesByDepartment({ department_id: departmentId }));
    }
}
