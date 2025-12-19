import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface UsersServiceClient {
    GetUsers(data: { pagination: any }): Observable<any>;
    GetUser(data: { user_id: string }): Observable<any>;
    CreateUser(data: any): Observable<any>;
    UpdateUserRoles(data: { user_id: string; role_ids: string[] }): Observable<any>;
    GetUserPermissions(data: { user_id: string }): Observable<any>;
}

interface RolesServiceClient {
    GetRoles(data: any): Observable<any>;
    CreateRole(data: any): Observable<any>;
    UpdateRolePermissions(data: { role_id: string; permissions: string[] }): Observable<any>;
    GetPermissions(data: any): Observable<any>;
}

@Injectable()
export class UsersGatewayService implements OnModuleInit {
    private usersService: UsersServiceClient;
    private rolesService: RolesServiceClient;

    constructor(
        @Inject('USERS_PACKAGE') private usersClient: ClientGrpc,
        @Inject('ROLES_PACKAGE') private rolesClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.usersService = this.usersClient.getService<UsersServiceClient>('UsersService');
        this.rolesService = this.rolesClient.getService<RolesServiceClient>('RolesService');
    }

    // ==================== USERS ====================

    async getUsers(pagination: any) {
        return lastValueFrom(this.usersService.GetUsers({ pagination }));
    }

    async getUser(id: string) {
        return lastValueFrom(this.usersService.GetUser({ user_id: id }));
    }

    async createUser(data: any) {
        return lastValueFrom(this.usersService.CreateUser(data));
    }

    async updateUserRoles(userId: string, roleIds: string[]) {
        return lastValueFrom(this.usersService.UpdateUserRoles({ user_id: userId, role_ids: roleIds }));
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

    async getPermissions() {
        return lastValueFrom(this.rolesService.GetPermissions({}));
    }
}
