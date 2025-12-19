import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialsSeeder } from './credentials.seeder';
import { RolesSeeder } from './roles.seeder';
import { User } from '../../users/entities/user.entity';
import { Credential } from '../../credentials/entities/credential.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Module({
    imports: [
        // ==================== CONFIGURATION ====================
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            // Pas de cache nécessaire pour un script one-off
        }),

        // ==================== BASE DE DONNÉES ====================
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('AUTH_MANAGER_DB_HOST', 'localhost'),
                port: configService.get('AUTH_MANAGER_DB_PORT', 3306),
                username: configService.get('AUTH_MANAGER_DB_USERNAME'),
                password: configService.get('AUTH_MANAGER_DB_PASSWORD'),
                database: configService.get('AUTH_MANAGER_DB_DATABASE'),
                autoLoadEntities: false,
                entities: [User, Credential, Role, Permission],
                synchronize: true, // IMPORTANT: Enable sync to fix join table schema if needed
                logging: ['error'],
            }),
            inject: [ConfigService],
        }),

        // Enregistrement des entités pour que TypeORM les connaisse dans ce contexte
        TypeOrmModule.forFeature([User, Credential, Role, Permission]),
    ],
    providers: [CredentialsSeeder, RolesSeeder],
})
export class SeederModule { }
