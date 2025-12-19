/**
 * Stratégie d'authentification par base de données locale
 * 
 * Process:
 * 1. Recherche le credential par username
 * 2. Vérifie que le credential est actif
 * 3. Compare le mot de passe avec bcrypt
 * 4. Retourne l'utilisateur avec ses rôles et permissions
 * 
 * Sécurité:
 * - Le champ password a select: false dans l'entité, il faut l'inclure explicitement
 * - Utilisation de bcrypt pour la comparaison sécurisée
 * - Vérification de l'état actif du credential ET de l'utilisateur
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Credential, CredentialType } from '../../credentials/entities/credential.entity';

@Injectable()
export class DatabaseStrategy {
    private readonly logger = new Logger(DatabaseStrategy.name);

    constructor(
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
   * Authentifie un utilisateur via la base de données locale
   * 
   * @param identifier Username ou email
   * @param password Mot de passe en clair
   * @returns L'utilisateur authentifié avec ses rôles et permissions
   * @throws Error si les identifiants sont invalides
   */
    async authenticate(identifier: string, password: string): Promise<User> {
        this.logger.debug(`Tentative d'authentification DB pour: ${identifier}`);

        // Récupération du credential avec le mot de passe (select: false par défaut)
        const credential = await this.credentialRepository
            .createQueryBuilder('credential')
            .addSelect('credential.password')
            .where('credential.identifier = :identifier', { identifier })
            .andWhere('credential.type = :type', { type: CredentialType.PASSWORD })
            .andWhere('credential.is_active = :is_active', { is_active: 1 })
            .getOne();

        // Vérification de l'existence du credential
        if (!credential) {
            this.logger.warn(`Credential non trouvé pour: ${identifier}`);
            throw new Error('Identifiants invalides');
        }

        // Vérification de l'existence du mot de passe
        if (!credential.password) {
            this.logger.warn(`Mot de passe manquant pour le credential: ${identifier}`);
            throw new Error('Identifiants invalides');
        }

        // Comparaison sécurisée du mot de passe avec bcrypt
        const isPasswordValid = await bcrypt.compare(password, credential.password);

        if (!isPasswordValid) {
            this.logger.warn(`Mot de passe invalide pour: ${identifier}`);
            throw new Error('Identifiants invalides');
        }

        // Récupération de l'utilisateur avec ses relations
        const user = await this.userRepository.findOne({
            where: { id: credential.user_id },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
            this.logger.warn(`Utilisateur non trouvé pour le credential: ${identifier}`);
            throw new Error('Identifiants invalides');
        }

        // Vérification que l'utilisateur est actif
        if (!user.is_active) {
            this.logger.warn(`Utilisateur inactif: ${identifier}`);
            throw new Error('Compte désactivé');
        }

        this.logger.log(`✅ Authentification DB réussie pour: ${identifier}`);

        return user;
    }
}