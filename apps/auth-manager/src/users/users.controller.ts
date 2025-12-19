import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @GrpcMethod('UsersService', 'GetUsers')
    async getUsers(data: { pagination: any }) {
        try {
            return await this.usersService.findAll(data.pagination);
        } catch (error) {
            throw new RpcException({
                code: 13,
                message: error.message || 'Erreur récupération utilisateurs',
            });
        }
    }

    @GrpcMethod('UsersService', 'GetUser')
    async getUser(data: { user_id: string }) {
        try {
            const user = await this.usersService.findOne(data.user_id);
            return this.formatUser(user);
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: 'Utilisateur non trouvé',
            });
        }
    }

    @GrpcMethod('UsersService', 'CreateUser')
    async createUser(data: any) {
        try {
            const user = await this.usersService.create(data);
            return this.formatUser(user);
        } catch (error) {
            throw new RpcException({
                code: 6, // ALREADY_EXISTS / CONFLICT
                message: error.message || 'Erreur création utilisateur',
            });
        }
    }

    @GrpcMethod('UsersService', 'UpdateUserRoles')
    async updateUserRoles(data: { user_id: string; role_ids: string[] }) {
        try {
            const user = await this.usersService.updateRoles(data.user_id, data.role_ids);
            return this.formatUser(user);
        } catch (error) {
            throw new RpcException({
                code: 3, // INVALID_ARGUMENT
                message: error.message || 'Erreur lors de la mise à jour',
            });
        }
    }

    @GrpcMethod('UsersService', 'GetUserPermissions')
    async getUserPermissions(data: { user_id: string }) {
        try {
            const permissions = await this.usersService.getPermissions(data.user_id);
            return { permissions };
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: 'Utilisateur non trouvé',
            });
        }
    }

    private formatUser(user: any) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: user.full_name,
            phone: user.phone,
            is_active: user.is_active,
            roles: user.roles.map((r) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                permissions: r.permissions ? r.permissions.map(p => p.name) : []
            })),
            permissions: user.getPermissions ? user.getPermissions() : [],
            created_at: user.created_at.toISOString(),
        };
    }
}
