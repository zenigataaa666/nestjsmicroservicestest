import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) { }

    async findAll() {
        return this.permissionRepository.find();
    }

    async create(data: { name: string; description?: string; resource?: string; action?: string }) {
        const existingPermission = await this.permissionRepository.findOne({ where: { name: data.name } });
        if (existingPermission) throw new ConflictException(`La permission ${data.name} existe déjà`);

        const permission = this.permissionRepository.create(data);
        return this.permissionRepository.save(permission);
    }

    async update(id: string, data: { name?: string; description?: string; resource?: string; action?: string }) {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) throw new NotFoundException('Permission non trouvée');

        if (data.name && data.name !== permission.name) {
            const existing = await this.permissionRepository.findOne({ where: { name: data.name } });
            if (existing) throw new ConflictException(`La permission ${data.name} existe déjà`);
        }

        Object.assign(permission, data);
        return this.permissionRepository.save(permission);
    }

    async delete(id: string) {
        const result = await this.permissionRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException('Permission non trouvée');
        return { success: true };
    }
}
