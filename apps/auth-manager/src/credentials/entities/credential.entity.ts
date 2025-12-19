/**
 * Entité Credential
 * 
 * Représente les identifiants de connexion d'un utilisateur.
 * Un credential est lié à UN utilisateur via user_id.
 * 
 * Relations:
 * - ManyToOne avec User (un credential appartient à un user)
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CredentialType {
  PASSWORD = 'password',
  LDAP = 'ldap',
  API_KEY = 'api_key',
}

@Entity('credentials')
@Index(['user_id', 'identifier'])
export class Credential {
  // ==================== CLÉS ====================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== RELATION AVEC USER ====================

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @ManyToOne(() => User, (user) => user.credentials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ==================== DONNÉES D'AUTHENTIFICATION ====================

  /**
   * Type d'authentification
   * - password: Authentification locale par mot de passe
   * - ldap: Authentification via Active Directory/LDAP
   * - api_key: Authentification par clé API
   */
  @Column({
    type: 'enum',
    enum: CredentialType,
    default: CredentialType.PASSWORD,
  })
  type: CredentialType;

  /**
   * Identifiant pour la connexion
   * - Pour password: username ou email
   * - Pour ldap: sAMAccountName
   * - Pour api_key: clé générée
   */
  @Column({ type: 'varchar', length: 255 })
  identifier: string;

  /**
   * Mot de passe hashé avec bcrypt
   * - password: Hash bcrypt du mot de passe
   * - ldap: NULL (authentification déléguée)
   * - api_key: Hash de la clé
   */
  @Column({ type: 'varchar', nullable: true, length: 255, select: false })
  password: string | null;

  /**
   * Statut actif/inactif du credential
   * Si false, ce credential ne peut pas être utilisé
   */
  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

  /**
   * Date et heure de la dernière connexion réussie
   */
  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date | null;

  // ==================== MÉTADONNÉES ====================

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}