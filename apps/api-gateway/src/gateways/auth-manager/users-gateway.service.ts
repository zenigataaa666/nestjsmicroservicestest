import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface UsersServiceClient {
    GetUsers(data: { pagination: any }): Observable<any>;
    GetUser(data: { user_id: string }): Observable<any>;
    CreateUser(data: any): Observable<any>;
    UpdateUserRoles(data: { user_id: string; role_ids: string[] }): Observable<any>;
    GetUserPermissions(data: { user_id: string }): Observable<any>;
    UpdateUser(data: any): Observable<any>;
    DeleteUser(data: { id: string }): Observable<any>;
}

@Injectable()
export class UsersGatewayService implements OnModuleInit {
    private usersService: UsersServiceClient;

    constructor(
        @Inject('AUTH_MANAGER_SERVICE') private usersClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.usersService = this.usersClient.getService<UsersServiceClient>('UsersService');
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

    async updateUser(id: string, data: any) {
        return lastValueFrom(this.usersService.UpdateUser({ ...data, id }));
    }

    async deleteUser(id: string) {
        return lastValueFrom(this.usersService.DeleteUser({ id }));
    }
}
