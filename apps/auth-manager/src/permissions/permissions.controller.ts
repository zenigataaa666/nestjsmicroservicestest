import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PermissionsService } from './permissions.service';

@Controller()
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @GrpcMethod('RolesService', 'GetAllPermissions')
    async getAllPermissions() {
        try {
            const permissions = await this.permissionsService.findAll();
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
            const permission = await this.permissionsService.create(data);
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
            const permission = await this.permissionsService.update(data.id, data);
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
            await this.permissionsService.delete(data.id);
            return { success: true };
        } catch (error) {
            throw new RpcException({
                code: 5,
                message: error.message || 'Erreur suppression permission',
            });
        }
    }

    // Keep GetPermissions (strings) for compatibility if needed, or redirect to GetAllPermissions logic
    // But currently RolesService uses it. We should assume RolesService might delegate to PermissionsService or keep it.
    // For now, let's keep CRUD here. 
}
