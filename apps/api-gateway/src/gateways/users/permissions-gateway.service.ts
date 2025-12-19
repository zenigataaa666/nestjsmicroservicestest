import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface PermissionsServiceClient {
    GetPermissions(data: any): Observable<any>;
    GetAllPermissions(data: any): Observable<any>;
    CreatePermission(data: any): Observable<any>;
    UpdatePermission(data: any): Observable<any>;
    DeletePermission(data: any): Observable<any>;
}

@Injectable()
export class PermissionsGatewayService implements OnModuleInit {
    private permissionsService: PermissionsServiceClient;

    constructor(
        @Inject('PERMISSIONS_PACKAGE') private permissionsClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.permissionsService = this.permissionsClient.getService<PermissionsServiceClient>('PermissionsService');
    }
    // ==================== PERMISSIONS ====================

    async getPermissions() {
        return lastValueFrom(this.permissionsService.GetPermissions({}));
    }

    async getAllPermissions() {
        return lastValueFrom(this.permissionsService.GetAllPermissions({}));
    }

    async createPermission(data: any) {
        return lastValueFrom(this.permissionsService.CreatePermission(data));
    }

    async updatePermission(id: string, data: any) {
        return lastValueFrom(this.permissionsService.UpdatePermission({ ...data, id }));
    }

    async deletePermission(id: string) {
        return lastValueFrom(this.permissionsService.DeletePermission({ id }));
    }
}
