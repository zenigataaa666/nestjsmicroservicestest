/**
 * Stratégie JWT pour Passport
 * 
 * Responsabilités:
 * - Extraction du token depuis le header Authorization
 * - Vérification et décodage du token JWT
 * - Validation du payload
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error('JWT_SECRET must be defined in the configuration.');
        }

        super({
            // Extraction du token depuis "Authorization: Bearer <token>"
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Ne pas ignorer l'expiration du token
            ignoreExpiration: false,

            // Secret pour vérifier la signature
            secretOrKey: jwtSecret,

            // Algorithme de signature
            algorithms: ['HS256'],
        });
    }

    /**
     * Valide le payload du token JWT
     * Cette méthode est automatiquement appelée par Passport après décodage
     * 
     * @param payload Payload décodé du token
     * @returns Objet utilisateur qui sera attaché à req.user
     * @throws UnauthorizedException si le payload est invalide
     */

    async validate(payload: any) {
        // Vérification des champs obligatoires
        if (!payload.id && !payload.sub) {
            throw new UnauthorizedException('Token invalide: ID manquant');
        }

        if (!payload.username) {
            throw new UnauthorizedException('Token invalide: Username manquant');
        }

        // Retour de l'objet utilisateur
        // Cet objet sera disponible dans req.user
        return {
            id: payload.id || payload.sub,
            username: payload.username,
            // email: payload.email,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
        };
    }
}