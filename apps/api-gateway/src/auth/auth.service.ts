// /**
//  * Service d'authentification de l'API Gateway
//  * 
//  * Responsabilités:
//  * - Communication avec le microservice AuthManager via gRPC
//  * - Génération des tokens JWT
//  * - Gestion de la session utilisateur
//  */

import { Injectable, Inject, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { lastValueFrom, Observable } from 'rxjs';

interface AuthServiceClient {
    Authenticate(data: { identifier: string; password: string; type?: string }): Observable<any>;
    ValidateToken(data: { token: string }): Observable<{ valid: boolean }>;
    RefreshToken(data: { refresh_token: string }): Observable<any>;
    Logout(data: { user_id: string; access_token?: string }): Observable<{ success: boolean; message: string; code: number }>;
}

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly logger = new Logger(AuthService.name);
    private authServiceClient: AuthServiceClient;

    constructor(
        @Inject('AUTH_PACKAGE') private client: ClientGrpc,
        private jwtService: JwtService,
    ) { }

    onModuleInit() {
        this.authServiceClient = this.client.getService<AuthServiceClient>('AuthService');
        this.logger.log('✅ Client gRPC AuthService initialisé');
    }

    async login(loginDto: LoginDto) {
        try {
            this.logger.log(`Tentative de connexion pour: ${loginDto.username} (base: ${loginDto.base})`);

            // Mapping pour le nouveau contrat gRPC (identifier / type)
            const type = loginDto.base === 'ldap' ? 'ldap' : 'password';

            // Appel gRPC
            const response = await lastValueFrom(
                this.authServiceClient.Authenticate({
                    identifier: loginDto.username,
                    password: loginDto.password,
                    type: type,
                })
            );

            this.logger.debug(`Réponse gRPC reçue`);

            if (!response || !response.id) {
                throw new UnauthorizedException('Identifiants invalides');
            }

            // Génération du payload JWT (Access Token)
            const payload = {
                sub: response.id,
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles || [],
                permissions: response.permissions || [],
            };

            const accessToken = this.jwtService.sign(payload);

            this.logger.log(`✅ Connexion réussie pour: ${response.username}`);

            return {
                access_token: accessToken,
                refresh_token: response.refresh_token, // Nouveau champ
                token_type: 'Bearer',
                expires_in: 900, // 15 min (configuré dans JwtModule habituellement)
                user: {
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    first_name: response.first_name,
                    last_name: response.last_name,
                    full_name: response.full_name,
                    phone: response.phone,
                    roles: response.roles,
                    permissions: response.permissions,
                },
            };
        } catch (error) {
            this.logger.error(`Erreur lors de l'authentification: ${error.message}`);

            if (error.code === 16) {
                throw new UnauthorizedException('Identifiants invalides');
            }
            if (error.code === 14) {
                throw new UnauthorizedException('Service d\'authentification temporairement indisponible');
            }

            throw new UnauthorizedException(error.message || 'Erreur lors de l\'authentification');
        }
    }

    async refresh(refreshToken: string) {
        try {
            // Appel gRPC pour rotation du Refresh Token
            const response = await lastValueFrom(
                this.authServiceClient.RefreshToken({ refresh_token: refreshToken })
            );

            const user = response.user;

            // Génération nouveau Access Token
            const payload = {
                sub: user.id,
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles.map(r => r.name), // Attention à la structure RoleResponse vs string
                permissions: user.permissions,
            };

            return {
                access_token: this.jwtService.sign(payload),
                refresh_token: response.refresh_token,
                token_type: 'Bearer',
                expires_in: 900,
            };
        } catch (error) {
            this.logger.warn(`Échec refresh token: ${error.message}`);
            throw new UnauthorizedException('Session expirée ou invalide');
        }
    }

    async logout(userId: string, accessToken?: string) {
        return lastValueFrom(this.authServiceClient.Logout({ user_id: userId, access_token: accessToken }));
    }
}