/**
 * DTO pour la connexion
 * 
 * Validation des données d'authentification envoyées par le frontend
 */

import { IsNotEmpty, IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Nom d\'utilisateur, email ou identifiant LDAP',
        minLength: 3,
        maxLength: 20,
    })
    @IsString({ message: 'Le username doit être une chaîne de caractères' })
    @IsNotEmpty({ message: 'Le username est requis' })
    @MinLength(3, { message: 'Le username doit contenir au moins 3 caractères' })
    @MaxLength(20, { message: 'Le username ne peut pas dépasser 20 caractères' })
    username: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Mot de passe',
        minLength: 6,
    })
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
    @IsNotEmpty({ message: 'Le mot de passe est requis' })
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    password: string;

    @ApiPropertyOptional({
        example: 'db',
        enum: ['db', 'ldap'],
        default: 'db',
        description: 'Type d\'authentification (db = local/password, ldap = Active Directory)'
    })
    @IsOptional()
    @IsIn(['db', 'ldap'], { message: 'La méthode doit être "db" ou "ldap"' })
    base?: 'db' | 'ldap' = 'db';
}