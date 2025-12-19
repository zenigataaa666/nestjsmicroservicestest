import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../auth/entities/role.entity';
import { Permission } from '../auth/entities/permission.entity';

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
}
