/**
 * Guard JWT personnalisé
 * 
 * Responsabilités:
 * - Vérification de l'authentification JWT
 * - Support des routes publiques via @Public()
 * - Messages d'erreur personnalisés
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * Détermine si la route nécessite une authentification
     */
    canActivate(context: ExecutionContext) {
        // Vérifier si la route est marquée comme publique
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Sinon, vérifier le JWT
        return super.canActivate(context);
    }

    /**
     * Gestion personnalisée des erreurs d'authentification
     */
    handleRequest(err, user, info, context) {
        // Si erreur ou pas d'utilisateur, rejeter
        if (err || !user) {
            // Messages d'erreur personnalisés selon le type d'erreur
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token expiré. Veuillez vous reconnecter.');
            }

            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Token invalide ou malformé.');
            }

            if (info?.name === 'NotBeforeError') {
                throw new UnauthorizedException('Token pas encore valide.');
            }

            throw err || new UnauthorizedException('Authentification requise.');
        }

        return user;
    }
}