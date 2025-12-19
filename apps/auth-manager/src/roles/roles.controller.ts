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

    @GrpcMethod('RolesService', 'GetAllPermissions')
    async getAllPermissions() {
        try {
            const permissions = await this.rolesService.findAllPermissionsFull();
            return {
                permissions: permissions.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    resource: p.resource,
                    action: p.action
                }))
            };
        } catch (error) {
            throw new RpcException({
                code: 13,
                message: error.message || 'Erreur récupération permissions',
            });
        }
    }

    @GrpcMethod('RolesService', 'CreatePermission')
    async createPermission(data: any) {
        try {
            const permission = await this.rolesService.createPermission(data);
            return {
                id: permission.id,
                name: permission.name,
                description: permission.description,
                resource: permission.resource,
                action: permission.action
            };
        } catch (error) {
            throw new RpcException({
                code: 6,
                message: error.message || 'Erreur création permission',
            });
        }
    }

    @GrpcMethod('RolesService', 'UpdatePermission')
    async updatePermission(data: any) {
        try {
            const permission = await this.rolesService.updatePermission(data.id, data);
            return {
                id: permission.id,
                name: permission.name,
                description: permission.description,
                resource: permission.resource,
                action: permission.action
            };
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: error.message || 'Erreur modification permission',
            });
        }
    }

    @GrpcMethod('RolesService', 'DeletePermission')
    async deletePermission(data: { id: string }) {
        try {
            await this.rolesService.deletePermission(data.id);
            return { success: true };
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: error.message || 'Erreur suppression permission',
            });
        }
    }
}
