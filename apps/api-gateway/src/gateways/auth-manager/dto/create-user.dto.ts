import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'jdoe', description: 'Nom d\'utilisateur' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @ApiPropertyOptional({ example: 'password123', description: 'Mot de passe initial (optionnel si généré auto)' })
    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @ApiProperty({ example: 'John', description: 'Prénom' })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe', description: 'Nom de famille' })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email professionnel' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: ['role-uuid-1', 'role-uuid-2'], description: 'IDs des rôles à assigner' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    role_ids?: string[];

    @ApiPropertyOptional({ example: 'password', enum: ['password', 'ldap'], default: 'password', description: 'Type de credential' })
    @IsString()
    @IsOptional()
    credential_type?: string = 'password';
}
