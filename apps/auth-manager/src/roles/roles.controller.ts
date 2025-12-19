import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { RolesService } from './roles.service';

@Controller()
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @GrpcMethod('RolesService', 'GetRoles')
    async getRoles() {
        try {
            const roles = await this.rolesService.findAll();
            return {
                roles: roles.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    permissions: r.permissions ? r.permissions.map(p => p.name) : []
                }))
            };
        } catch (error) {
            throw new RpcException({
                code: 13,
                message: error.message || 'Erreur récupération rôles',
            });
        }
    }

    @GrpcMethod('RolesService', 'CreateRole')
    async createRole(data: any) {
        try {
            const role = await this.rolesService.create(data);
            return {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions ? role.permissions.map(p => p.name) : []
            };
        } catch (error) {
            throw new RpcException({
                code: 6, // ALREADY_EXISTS / CONFLICT
                message: error.message || 'Erreur création rôle',
            });
        }
    }

    @GrpcMethod('RolesService', 'UpdateRolePermissions')
    async updateRolePermissions(data: { role_id: string; permissions: string[] }) {
        try {
            const role = await this.rolesService.updatePermissions(data.role_id, data.permissions);
            return {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions ? role.permissions.map(p => p.name) : []
            };
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: 'Rôle non trouvé',
            });
        }
    }

    @GrpcMethod('RolesService', 'GetPermissions')
    async getPermissions() {
        try {
            const permissions = await this.rolesService.findAllPermissions();
            return { permissions: permissions.map(p => p.name) };
        } catch (error) {
            throw new RpcException({
                code: 13,
                message: error.message || 'Erreur récupération permissions',
            });
        }
    }
}
