/**
 * Module principal de l'application AuthManager
 * 
 * Configure:
 * - Variables d'environnement (ConfigModule)
 * - Connexion base de données MySQL (TypeOrmModule)
 * - Modules métier (AuthModule)
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { DashboardModule } from './dashboard/dashboard.module';


@Module({
    imports: [
        // ==================== CONFIGURATION ====================
        ConfigModule.forRoot({
            isGlobal: true,              // Accessible dans tous les modules
            envFilePath: '.env',
            cache: true,                 // Mise en cache pour performance
            expandVariables: true,       // Support des variables dans .env
        }),

        // ==================== BASE DE DONNÉES ====================
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('AUTH_DB_HOST', 'localhost'),
                port: configService.get('AUTH_DB_PORT', 3306),
                username: configService.get('AUTH_DB_USERNAME'),
                password: configService.get('AUTH_DB_PASSWORD'),
                database: configService.get('AUTH_DB_DATABASE'),

                // Auto-chargement des entités
                autoLoadEntities: true,
                // entities: [__dirname + '/**/*.entity{.ts,.js}'],

                // CRITIQUE: false en production pour éviter la perte de données
                synchronize: true, // IMPORTANT: false en production

                // Logs SQL en développement uniquement
                logging: configService.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],

                // // Options de pool de connexions
                // extra: {
                //     connectionLimit: 10,        // Max 10 connexions simultanées
                //     connectTimeout: 60000,      // Timeout connexion: 60s
                //     acquireTimeout: 60000,      // Timeout acquisition: 60s
                //     timeout: 60000,             // Timeout requête: 60s
                // },

                // // Retry automatique en cas d'erreur de connexion
                // retryAttempts: 3,
                // retryDelay: 3000,

                // // Charset UTF-8 pour support caractères internationaux
                // charset: 'utf8mb4',
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        RolesModule,
        DashboardModule
    ],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }