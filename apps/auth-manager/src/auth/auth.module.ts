/**
 * Module d'authentification
 * 
 * Regroupe tous les composants liés à l'authentification:
 * - Entités TypeORM
 * - Stratégies d'authentification (DB, LDAP)
 * - Service et Controller
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Credential } from './entities/credential.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { DatabaseStrategy } from './strategies/database.strategy';
import { LdapStrategy } from './strategies/ldap.strategy';

import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Credential, User, Role, Permission, RefreshToken]),
        JwtModule.register({}), // Juste pour le service de décodage dans AuthService
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        DatabaseStrategy,
        LdapStrategy,
        {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                return new Redis({
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    password: configService.get('REDIS_PASSWORD'),
                });
            },
            inject: [ConfigService],
        }
    ],
    exports: [AuthService],
})
export class AuthModule { }