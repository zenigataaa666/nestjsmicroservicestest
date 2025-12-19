// /**
//  * Controller du microservice d'authentification
//  * 
//  * Écoute les messages Redis et délègue au service.
//  * Gère la conversion des erreurs en RpcException.
//  */

import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CredentialType } from '../credentials/entities/credential.entity';

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) { }

    // ==================== AUTHENTICATE ====================
    @GrpcMethod('AuthService', 'Authenticate')
    async authenticate(data: {
        identifier: string;
        password: string;
        type?: string;
    }) {
        try {
            this.logger.log(
                `[Authenticate] Requête pour: ${data.identifier} (type: ${data.type || 'password'})`,
            );

            // Convertir le type string en enum
            let credentialType: CredentialType = CredentialType.PASSWORD;
            if (data.type) {
                const typeUpper = data.type.toLowerCase();
                if (typeUpper === 'ldap') {
                    credentialType = CredentialType.LDAP;
                } else if (typeUpper === 'api_key') {
                    credentialType = CredentialType.API_KEY;
                }
            }

            const user = await this.authService.authenticate({
                identifier: data.identifier,
                password: data.password,
                type: credentialType,
            });

            this.logger.log(`[Authenticate] Succès pour: ${data.identifier}`);

            return {
                id: user.id,
                username: user.username,
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                full_name: user.full_name || '',
                phone: user.phone || '',
                roles: user.roles,
                permissions: user.permissions,
                refresh_token: user.refresh_token,
            };
        } catch (error) {
            this.logger.error(
                `[Authenticate] Échec pour ${data.identifier}: ${error.message}`,
            );
            throw new RpcException({
                code: 16, // UNAUTHENTICATED
                message: error.message || 'Authentification échouée',
            });
        }
    }

    // ==================== REFRESH TOKEN ====================
    @GrpcMethod('AuthService', 'RefreshToken')
    async refreshToken(data: { refresh_token: string }) {
        try {
            this.logger.log(`[RefreshToken] Requête reçue`);
            return await this.authService.rotateRefreshToken(data.refresh_token);
        } catch (error) {
            this.logger.error(`[RefreshToken] Échec: ${error.message}`);
            throw new RpcException({
                code: 16, // UNAUTHENTICATED
                message: error.message || 'Session invalide ou expirée',
            });
        }
    }

    // ==================== VALIDATE TOKEN ====================
    @GrpcMethod('AuthService', 'ValidateToken')
    async validateToken(data: { token: string }) {
        try {
            const valid = await this.authService.validateToken(data.token);
            return { valid };
        } catch (error) {
            throw new RpcException({
                code: 16,
                message: 'Token invalide',
            });
        }
    }

    // ==================== LOGOUT ====================
    // ==================== LOGOUT ====================
    @GrpcMethod('AuthService', 'Logout')
    async logout(data: { user_id: string; access_token?: string }) {
        try {
            await this.authService.logout(data.user_id, data.access_token);
            return {
                success: true,
                message: 'Déconnexion réussie',
                code: 0,
            };
        } catch (error) {
            throw new RpcException({
                code: 13, // INTERNAL
                message: 'Erreur lors de la déconnexion',
            });
        }
    }
}