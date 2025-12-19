/**
 * Guard de vérification des rôles
 * 
 * Responsabilités:
 * - Vérifier que l'utilisateur possède les rôles requis
 * - Messages d'erreur détaillés
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Récupération des rôles requis depuis le décorateur @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si aucun rôle requis, autoriser l'accès
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Récupération de l'utilisateur depuis la requête (ajouté par JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        // Vérification de la présence de l'utilisateur
        if (!user) {
            this.logger.warn('Tentative d\'accès sans utilisateur authentifié');
            throw new ForbiddenException('Authentification requise');
        }

        // Vérification de la présence des rôles
        if (!user.roles || !Array.isArray(user.roles)) {
            this.logger.warn(`Utilisateur ${user.username} sans rôles assignés`);
            throw new ForbiddenException('Aucun rôle assigné');
        }

        // Vérification que l'utilisateur possède au moins un des rôles requis
        const hasRole = requiredRoles.some((role) => user.roles.includes(role));

        if (!hasRole) {
            this.logger.warn(
                `Accès refusé pour ${user.username}. ` +
                `Rôles requis: [${requiredRoles.join(', ')}], ` +
                `Rôles possédés: [${user.roles.join(', ')}]`
            );

            throw new ForbiddenException(
                `Accès refusé. Rôle(s) requis: ${requiredRoles.join(' ou ')}`
            );
        }

        return true;
    }
}