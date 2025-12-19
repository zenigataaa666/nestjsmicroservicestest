/**
 * Entité Permission
 * 
 * Représente une permission granulaire dans le système.
 * Les permissions définissent ce qu'un utilisateur peut faire sur une ressource.
 * 
 * Format recommandé: resource.action
 * Exemples: employees.read, employees.write, employees.delete
 * 
 * Relations:
 * - ManyToMany avec Role (une permission peut appartenir à plusieurs rôles)
 */

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
    // ==================== CLÉS ====================

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ==================== INFORMATIONS DE LA PERMISSION ====================

    /**
     * Nom unique de la permission (slug)
     * Format: resource.action (ex: employees.read, employees.write)
     */
    @Column({ type: 'varchar', unique: true, length: 255 })
    name: string;

    /**
     * Ressource concernée par la permission
     * Exemples: employees, events, assets, departments, etc.
     */
    @Column({ type: 'varchar', nullable: true, length: 255 })
    resource: string | null;

    /**
     * Action autorisée sur la ressource
     * Exemples: read, write, delete, manage, export, etc.
     */
    @Column({ type: 'varchar', nullable: true, length: 255 })
    action: string | null;

    /**
     * Description lisible de la permission
     */
    @Column({ nullable: true, type: 'text' })
    description: string | null;

    // ==================== RELATIONS ====================

    /**
     * Relation ManyToMany avec Role (côté inverse)
     * Une permission peut appartenir à plusieurs rôles
     */
    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    // ==================== MÉTADONNÉES ====================

    @CreateDateColumn()
    created_at: Date;
}