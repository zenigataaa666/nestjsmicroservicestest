/**
 * Stratégie d'authentification LDAP/Active Directory
 * 
 * Process:
 * 1. Connexion au serveur LDAP avec un compte de service
 * 2. Recherche de l'utilisateur par son username/email
 * 3. Tentative de connexion avec les credentials de l'utilisateur
 * 4. Si succès, synchronisation de l'utilisateur dans la base locale
 * 5. Retourne l'utilisateur avec ses rôles
 * 
 * Configuration requise:
 * - LDAP_URL: URL du serveur LDAP
 * - LDAP_BASE_DN: Base DN pour la recherche
 * - LDAP_BIND_DN: DN du compte de service
 * - LDAP_BIND_PASSWORD: Mot de passe du compte de service
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import LdapAuth from 'ldapauth-fork';
import { Credential, CredentialType } from '../entities/credential.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class LdapStrategy {
    private readonly logger = new Logger(LdapStrategy.name);

    constructor(
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Authentifie un utilisateur via LDAP
     * 
     * @param username Nom d'utilisateur LDAP (sAMAccountName)
     * @param password Mot de passe LDAP
     * @returns L'utilisateur authentifié (synchronisé dans la base locale)
     * @throws Error si l'authentification échoue
     */
    async authenticate(username: string, password: string): Promise<User> {
        // Récupération de la configuration LDAP
        const ldapUrl = this.configService.get('LDAP_URL');
        const ldapBaseDN = this.configService.get('LDAP_BASE_DN');
        const ldapBindDN = this.configService.get('LDAP_BIND_DN');
        const ldapBindPassword = this.configService.get('LDAP_BIND_PASSWORD');

        // Vérification de la configuration LDAP
        if (!ldapUrl || !ldapBaseDN) {
            this.logger.error('Configuration LDAP manquante');
            throw new Error('LDAP non configuré');
        }

        this.logger.debug(`Tentative d'authentification LDAP pour: ${username}`);

        return new Promise((resolve, reject) => {
            // Configuration du client LDAP
            const ldapClient = new LdapAuth({
                url: ldapUrl,
                bindDN: ldapBindDN,
                bindCredentials: ldapBindPassword,
                searchBase: ldapBaseDN,
                searchFilter: `(sAMAccountName=${username})`, // Active Directory
                searchAttributes: [
                    'givenName',          // Prénom
                    'sn',                 // Nom de famille
                    'company',            // Entreprise
                    'department',         // Département
                    'mail',               // Email
                    'sAMAccountName',     // Username
                    'manager',            // Manager
                    'distinguishedName',  // DN complet
                    'directReports',      // Subordonnés
                    'description',        // Description
                    'displayName',        // Nom complet
                    'cn',                 // Common Name
                ],
                reconnect: true
            });

            // Tentative d'authentification
            ldapClient.authenticate(username, password, async (err, ldapUser) => {
                // Fermeture de la connexion LDAP
                ldapClient.close((closeErr) => {
                    if (closeErr) {
                        this.logger.warn(`Erreur fermeture connexion LDAP: ${closeErr.message}`);
                    }
                });

                // Gestion des erreurs d'authentification
                if (err) {
                    this.logger.error(`Erreur authentification LDAP pour ${username}: ${err}`);
                    return reject(new Error('Identifiants invalides'));
                }

                // Vérification de l'existence de l'utilisateur LDAP
                if (!ldapUser) {
                    this.logger.warn(`Utilisateur LDAP non trouvé: ${username}`);
                    return reject(new Error('Utilisateur LDAP non trouvé'));
                }

                this.logger.debug(`Utilisateur LDAP trouvé: ${JSON.stringify(ldapUser)}`);

                try {
                    // Vérification que l'utilisateur existe dans la base locale
                    const user = await this.checkLdapUser(ldapUser.sAMAccountName);
                    this.logger.log(`✅ Authentification LDAP réussie pour: ${username}`);
                    resolve(user);
                } catch (error) {
                    this.logger.error(`Erreur sync utilisateur LDAP: ${error.message}`);
                    reject(error);
                }
            });
        });
    }

    /**
   * Vérifie qu'un utilisateur LDAP existe dans la base locale
   * 
   * L'utilisateur doit avoir un credential de type 'ldap' actif
   * 
   * @param username sAMAccountName de l'utilisateur LDAP
   * @returns L'utilisateur avec ses rôles et permissions
   * @throws Error si l'utilisateur n'existe pas ou n'est pas autorisé
   * @private
   */
    private async checkLdapUser(username: string): Promise<User> {
        if (!username) {
            throw new Error('Username LDAP manquant');
        }

        // Recherche du credential LDAP
        const credential = await this.credentialRepository.findOne({
            where: {
                identifier: username,
                type: CredentialType.LDAP,
                is_active: true,
            },
        });

        if (!credential) {
            throw new Error('Utilisateur LDAP non autorisé dans le système');
        }

        // Récupération de l'utilisateur avec ses relations
        const user = await this.userRepository.findOne({
            where: { id: credential.user_id, is_active: true },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
            throw new Error('Utilisateur associé au credential non trouvé');
        }

        return user;
    }
}