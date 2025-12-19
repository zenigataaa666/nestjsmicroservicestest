/**
 * Entité Role
 * 
 * Représente un rôle dans le système RBAC (Role-Based Access Control).
 * Un rôle regroupe un ensemble de permissions et peut être attribué à plusieurs utilisateurs.
 * 
 * Relations:
 * - ManyToMany avec User (un rôle peut être attribué à plusieurs users)
 * - ManyToMany avec Permission (un rôle peut avoir plusieurs permissions)
 * 
 * Exemples de rôles: admin, hr_manager, user, event_manager, etc.
 */

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role {
    // ==================== CLÉS ====================

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ==================== INFORMATIONS DU RÔLE ====================

    /**
     * Nom unique du rôle (slug)
     * Format recommandé: snake_case (ex: hr_manager, event_manager)
     */
    @Column({ type: 'varchar', unique: true, length: 255 })
    name: string;

    /**
     * Description lisible du rôle
     */
    @Column({ type: 'text', nullable: true })
    description: string | null;

    // ==================== RELATIONS ====================

    /**
     * Relation ManyToMany avec User (côté inverse)
     * Un rôle peut être attribué à plusieurs utilisateurs
     */
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    /**
     * Relation ManyToMany avec Permission
     * Un rôle peut avoir plusieurs permissions
     */
    @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
    @JoinTable({
        name: 'roles_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    // ==================== MÉTADONNÉES ====================

    @CreateDateColumn()
    created_at: Date;
}