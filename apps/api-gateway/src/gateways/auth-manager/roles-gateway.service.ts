import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface RolesServiceClient {
    GetRoles(data: any): Observable<any>;
    CreateRole(data: any): Observable<any>;
    UpdateRolePermissions(data: { role_id: string; permissions: string[] }): Observable<any>;
}

@Injectable()
export class RolesGatewayService implements OnModuleInit {
    private rolesService: RolesServiceClient;

    constructor(
        @Inject('AUTH_MANAGER_SERVICE') private rolesClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.rolesService = this.rolesClient.getService<RolesServiceClient>('RolesService');
    }

    // ==================== ROLES ====================

    async getRoles() {
        return lastValueFrom(this.rolesService.GetRoles({}));
    }

    async createRole(data: any) {
        return lastValueFrom(this.rolesService.CreateRole(data));
    }

    async updateRolePermissions(roleId: string, permissions: string[]) {
        return lastValueFrom(this.rolesService.UpdateRolePermissions({ role_id: roleId, permissions }));
    }
}
