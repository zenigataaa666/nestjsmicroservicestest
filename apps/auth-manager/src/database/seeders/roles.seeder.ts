import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Permission } from '../../auth/entities/permission.entity';
import { Role } from '../../auth/entities/role.entity';

@Injectable()
export class RolesSeeder {
    private readonly logger = new Logger(RolesSeeder.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async run(): Promise<void> {
        this.logger.log('--- Démarrage de l\'amorçage des Rôles et Permissions ---');

        const permissionRepo = this.dataSource.getRepository(Permission);
        const roleRepo = this.dataSource.getRepository(Role);

        // 1. Définition des ressources et permissions
        const resources = ['employees', 'departments', 'users', 'roles'];
        const actions = ['create', 'read', 'update', 'delete', 'manage'];

        const allPermissions: Permission[] = [];

        for (const resource of resources) {
            for (const action of actions) {
                const permissionName = `${resource}.${action}`;

                let permission = await permissionRepo.findOne({
                    where: { name: permissionName }
                });

                if (!permission) {
                    this.logger.log(`➕ Création permission: ${permissionName}`);
                    permission = permissionRepo.create({
                        name: permissionName,
                        resource: resource,
                        action: action,
                        description: `Permet de ${action} sur ${resource}`
                    });
                    permission = await permissionRepo.save(permission);
                } else {
                    // this.logger.debug(`➡️ Permission existante: ${permissionName}`);
                }

                allPermissions.push(permission);
            }
        }

        // 2. Création du rôle ADMIN
        const adminRoleName = 'admin';
        let adminRole = await roleRepo.findOne({
            where: { name: adminRoleName },
            relations: ['permissions'] // Important pour ne pas écraser bêtement
        });

        if (!adminRole) {
            this.logger.log(`👑 Création du rôle: ${adminRoleName}`);
            adminRole = roleRepo.create({
                name: adminRoleName,
                description: 'Administrateur avec accès complet',
                permissions: allPermissions
            });
            await roleRepo.save(adminRole);
            this.logger.log(`✅ Rôle ${adminRoleName} créé avec ${allPermissions.length} permissions.`);
        } else {
            this.logger.log(`🔄 Mise à jour du rôle: ${adminRoleName}`);
            // On met à jour les permissions pour être sûr qu'il a tout
            adminRole.permissions = allPermissions;
            await roleRepo.save(adminRole);
            this.logger.log(`✅ Rôle ${adminRoleName} mis à jour avec ${allPermissions.length} permissions.`);
        }

        this.logger.log('--- Amorçage des Rôles terminé ---');
    }
}
