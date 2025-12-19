/**
 * Module d'authentification de l'API Gateway
 * 
 * Configure:
 * - JWT (génération et validation)
 * - Passport (stratégies d'authentification)
 * - Client Redis pour communication avec AuthManager
 * - Guards d'authentification et d'autorisation
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        // ==================== PASSPORT ====================
        PassportModule.register({
            defaultStrategy: 'jwt',
            session: false,
        }),

        // ==================== JWT ====================
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRATION', '24h'),
                    algorithm: 'HS256',
                    issuer: 'api-gateway',
                    audience: 'microservices-app',
                },
            }),
            inject: [ConfigService],
        }),

        // ==================== CLIENT gRPC ====================
        ClientsModule.registerAsync([
            {
                name: 'AUTH_PACKAGE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'auth_manager',
                        protoPath: join(__dirname, '../../../proto/auth-manager.proto'),
                        url: configService.get('AUTH_GRPC_URL', '0.0.0.0:50051'),
                        loader: {
                            keepCase: true,
                            longs: String,
                            enums: String,
                            defaults: true,
                            oneofs: true,
                        },
                        // Options de retry et timeout
                        channelOptions: {
                            'grpc.max_receive_message_length': 1024 * 1024 * 100, // 100MB
                            'grpc.max_send_message_length': 1024 * 1024 * 100,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),

        // ==================== CLIENT REDIS POUR AUTHMANAGER ====================
        // ClientsModule.registerAsync([
        //     {
        //         name: 'AUTH_SERVICE',
        //         imports: [ConfigModule],
        //         useFactory: (configService: ConfigService) => ({
        //             transport: Transport.REDIS,
        //             options: {
        //                 host: configService.get('REDIS_HOST', 'localhost'),
        //                 port: configService.get('REDIS_PORT', 6379),
        //                 password: configService.get('REDIS_PASSWORD'),
        //                 retryAttempts: 5,
        //                 retryDelay: 3000,
        //                 commandTimeout: 10000,
        //             },
        //         }),
        //         inject: [ConfigService],
        //     },
        // ]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }