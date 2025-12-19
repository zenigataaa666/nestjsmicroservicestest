/**
 * Entité User
 * 
 * Représente un utilisateur du système avec ses informations personnelles.
 * Un user peut avoir plusieurs credentials (password, ldap, api_key).
 * 
 * Relations:
 * - OneToMany avec Credential (un user peut avoir plusieurs credentials)
 * - ManyToMany avec Role (un user peut avoir plusieurs rôles)
 */

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Credential } from './credential.entity';

@Entity('users')
@Index(['email'])
@Index(['username'])
export class User {
    // ==================== CLÉS ====================

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ==================== INFORMATIONS PERSONNELLES ====================

    /**
     * Nom d'utilisateur unique (20 caractères max)
     * Utilisé comme identifiant principal
     */
    @Column({ type: 'varchar', unique: true, length: 20 })
    username: string;

    /**
     * Prénom de l'utilisateur (optionnel)
     */
    @Column({ type: 'varchar', nullable: true, length: 255 })
    first_name: string | null;

    /**
     * Nom de famille de l'utilisateur (obligatoire)
     */
    @Column({ type: 'varchar', length: 255 })
    last_name: string;

    /**
     * Adresse email (optionnelle mais unique si fournie)
     */
    @Column({ type: 'varchar', unique: true, nullable: true, length: 255 })
    email: string | null;

    /**
     * Numéro de téléphone
     */
    @Column({ type: 'varchar', nullable: true, length: 255 })
    phone: string | null;

    /**
     * Statut actif/inactif de l'utilisateur
     * Si false, l'utilisateur ne peut pas accéder au système
     */
    @Column({ type: 'tinyint', default: 1 })
    is_active: boolean;

    // ==================== RELATION AVEC CREDENTIALS ====================

    /**
     * Relation OneToMany vers Credential
     * Un user peut avoir plusieurs credentials (password, ldap, api_key)
     */
    @OneToMany(() => Credential, (credential) => credential.user)
    credentials: Credential[];

    // ==================== RELATION AVEC ROLES ====================

    /**
     * Relation ManyToMany avec Role
     * Un utilisateur peut avoir plusieurs rôles
     */
    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];

    // ==================== MÉTADONNÉES ====================

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Retourne le nom complet de l'utilisateur
     */
    get full_name(): string {
        if (this.first_name) {
            return `${this.first_name} ${this.last_name}`.trim();
        }
        return this.last_name;
    }

    /**
     * Vérifie si l'utilisateur possède un rôle spécifique
     * @param roleName Nom du rôle à vérifier
     * @returns true si l'utilisateur possède le rôle
     */
    hasRole(roleName: string): boolean {
        return this.roles?.some((role) => role.name === roleName) || false;
    }

    /**
     * Extrait toutes les permissions de tous les rôles de l'utilisateur
     * @returns Tableau de noms de permissions (sans doublons)
     */
    getPermissions(): string[] {
        const permissions = new Set<string>();
        this.roles?.forEach((role) => {
            role.permissions?.forEach((permission) => {
                permissions.add(permission.name);
            });
        });
        return Array.from(permissions);
    }

    /**
     * Vérifie si l'utilisateur possède une permission spécifique
     * @param permissionName Nom de la permission à vérifier
     * @returns true si l'utilisateur possède la permission
     */
    hasPermission(permissionName: string): boolean {
        return this.getPermissions().includes(permissionName);
    }
}