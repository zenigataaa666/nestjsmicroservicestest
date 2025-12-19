import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) { }

    async findAll() {
        return this.roleRepository.find({ relations: ['permissions'] });
    }

    async create(data: { name: string; description?: string; permissions?: string[] }) {
        const existingRole = await this.roleRepository.findOne({ where: { name: data.name } });
        if (existingRole) throw new ConflictException(`Le rôle ${data.name} existe déjà`);

        const role = this.roleRepository.create({
            name: data.name,
            description: data.description
        });

        if (data.permissions && data.permissions.length > 0) {
            role.permissions = await this.permissionRepository.findBy({ name: In(data.permissions) });
        }

        return this.roleRepository.save(role);
    }

    async updatePermissions(roleId: string, permissions: string[]) {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) throw new NotFoundException('Rôle non trouvé');

        role.permissions = await this.permissionRepository.findBy({ name: In(permissions) });
        return this.roleRepository.save(role);
    }

    async findAllPermissions() {
        return this.permissionRepository.find();
    }

    async findAllPermissionsFull() {
        return this.permissionRepository.find();
    }

    async createPermission(data: { name: string; description?: string; resource?: string; action?: string }) {
        const existingPermission = await this.permissionRepository.findOne({ where: { name: data.name } });
        if (existingPermission) throw new ConflictException(`La permission ${data.name} existe déjà`);

        const permission = this.permissionRepository.create(data);
        return this.permissionRepository.save(permission);
    }

    async updatePermission(id: string, data: { name?: string; description?: string; resource?: string; action?: string }) {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) throw new NotFoundException('Permission non trouvée');

        if (data.name && data.name !== permission.name) {
            const existing = await this.permissionRepository.findOne({ where: { name: data.name } });
            if (existing) throw new ConflictException(`La permission ${data.name} existe déjà`);
        }

        Object.assign(permission, data);
        return this.permissionRepository.save(permission);
    }

    async deletePermission(id: string) {
        const result = await this.permissionRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException('Permission non trouvée');
        return { success: true };
    }
}
