/**
 * Service d'authentification principal
 * 
 * Responsabilités:
 * - Authentification (DB ou LDAP)
 * - Gestion des utilisateurs
 * - Gestion des rôles
 * - Extraction des permissions
 * 
 * Toute la logique métier de l'authentification est centralisée ici.
 */

import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { Credential, CredentialType } from './entities/credential.entity';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { DatabaseStrategy } from './strategies/database.strategy';
import { LdapStrategy } from './strategies/ldap.strategy';
import { JwtService } from '@nestjs/jwt'; // Pour décoder si besoin le token

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly REFRESH_TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 jours

    constructor(
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private readonly databaseStrategy: DatabaseStrategy,
        private readonly ldapStrategy: LdapStrategy,
        private readonly jwtService: JwtService,
    ) { }

    // ==================== AUTHENTIFICATION ====================

    /**
     * Authentifie un utilisateur selon le type de credential
     */
    async authenticate(data: {
        identifier: string;
        password: string;
        type?: CredentialType;
    }) {
        const { identifier, password, type = CredentialType.PASSWORD } = data;

        try {
            let user: User;

            // Choix de la stratégie d'authentification
            switch (type) {
                case CredentialType.LDAP:
                    this.logger.log(`Authentification LDAP demandée pour: ${identifier}`);
                    user = await this.ldapStrategy.authenticate(identifier, password);
                    break;

                case CredentialType.PASSWORD:
                    this.logger.log(`Authentification DB demandée pour: ${identifier}`);
                    user = await this.databaseStrategy.authenticate(identifier, password);
                    break;

                case CredentialType.API_KEY:
                    this.logger.log(`Authentification API Key demandée`);
                    throw new Error('Authentification par API Key non implémentée');

                default:
                    throw new Error(`Type d'authentification non supporté: ${type}`);
            }

            // Vérifications de sécurité
            if (!user) {
                throw new UnauthorizedException('Identifiants invalides');
            }

            if (!user.is_active) {
                throw new UnauthorizedException('Compte désactivé');
            }

            // Mise à jour de la dernière connexion
            await this.updateLastLogin(identifier, type);

            // Extraction des permissions
            const permissions = user.getPermissions();

            // Création du Refresh Token
            const refreshToken = await this.createRefreshToken(user.id);

            // Retour des informations utilisateur
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                phone: user.phone,
                roles: user.roles.map((r) => r.name),
                permissions,
                refresh_token: refreshToken,
            };
        } catch (error) {
            this.logger.error(`Erreur authentification pour ${identifier}: ${error.message}`);
            throw new UnauthorizedException('Identifiants invalides');
        }
    }

    /**
   * Met à jour la date de dernière connexion
   */
    private async updateLastLogin(
        identifier: string,
        type: CredentialType,
    ): Promise<void> {
        try {
            await this.credentialRepository.update(
                { identifier, type },
                { last_login_at: new Date() },
            );
        } catch (error) {
            this.logger.warn(
                `Erreur mise à jour last_login_at pour ${identifier}: ${error.message}`,
            );
        }
    }

    // ==================== GESTION DES TOKENS ====================

    /**
     * Crée un Refresh Token sécurisé pour l'utilisateur
     */
    async createRefreshToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL);

        const refreshToken = this.refreshTokenRepository.create({
            user_id: userId,
            token,
            expires_at: expiresAt,
        });

        await this.refreshTokenRepository.save(refreshToken);
        return token;
    }

    /**
     * Rafraîchit un token (Rotation)
     */
    async rotateRefreshToken(token: string) {
        // 1. Trouver le token
        const storedToken = await this.refreshTokenRepository.findOne({
            where: { token },
            relations: ['user', 'user.roles', 'user.roles.permissions']
        });

        if (!storedToken) {
            throw new UnauthorizedException('Token invalide');
        }

        if (storedToken.is_revoked) {
            // Détection de vol de token (Reuse Detection)
            this.logger.warn(`Tentative de réutilisation d'un token révoqué ! User: ${storedToken.user_id}`);
            // Dans un cas réel, on révoquerait TOUS les tokens de l'utilisateur par sécurité
            await this.refreshTokenRepository.update({ user_id: storedToken.user_id }, { is_revoked: true });
            throw new UnauthorizedException('Token révoqué');
        }

        if (storedToken.expires_at < new Date()) {
            throw new UnauthorizedException('Token expiré');
        }

        // 2. Révoquer l'ancien (Rotation)
        storedToken.is_revoked = true;
        await this.refreshTokenRepository.save(storedToken);

        // 3. Créer un nouveau
        const newToken = await this.createRefreshToken(storedToken.user_id);
        const user = storedToken.user;

        return {
            refresh_token: newToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                phone: user.phone,
                is_active: user.is_active,
                roles: user.roles.map(r => ({ id: r.id, name: r.name, description: r.description })),
                created_at: user.created_at.toISOString(),
                permissions: user.getPermissions(),
            }
        };
    }

    /**
     * Valide un Access Token (via Blacklist Redis)
     */
    async validateToken(token: string): Promise<boolean> {
        if (!token) return false;

        // Vérifier blacklist Redis
        const isBlacklisted = await this.redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return false;
        }

        return true;
    }

    // ==================== DÉCONNEXION ====================

    // ==================== DÉCONNEXION ====================

    async logout(userId: string, accessToken?: string): Promise<void> {
        this.logger.log(`Déconnexion de l'utilisateur: ${userId}`);

        // 1. Révocation des refresh tokens (optionnel, ici on garde la session active sur autres devices si on veut)
        // await this.refreshTokenRepository.update({ user_id: userId }, { is_revoked: true });

        // 2. Blacklist de l'Access Token
        if (accessToken) {
            try {
                // Décodage sans vérification (car on veut juste l'exp)
                const decoded: any = this.jwtService.decode(accessToken);

                if (decoded && decoded.exp) {
                    const ttl = Math.floor(decoded.exp - Date.now() / 1000);

                    if (ttl > 0) {
                        this.logger.debug(`Blacklisting token for ${ttl}s`);
                        await this.redis.set(`blacklist:${accessToken}`, 'true', 'EX', ttl);
                    }
                }
            } catch (error) {
                this.logger.warn(`Erreur lors du blacklist du token: ${error.message}`);
            }
        }
    }
}