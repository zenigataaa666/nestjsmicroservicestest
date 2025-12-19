import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
    @ApiProperty({ example: 'John', description: 'Prénom de l\'employé' })
    @IsString()
    @IsNotEmpty({ message: 'Le prénom est requis' })
    @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' })
    first_name: string;

    @ApiProperty({ example: 'Doe', description: 'Nom de famille de l\'employé' })
    @IsString()
    @IsNotEmpty({ message: 'Le nom est requis' })
    @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
    last_name: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email professionnel' })
    @IsEmail({}, { message: 'Email invalide' })
    @IsNotEmpty({ message: 'L\'email est requis' })
    email: string;

    @ApiPropertyOptional({ example: '+241 01 23 45 67', description: 'Numéro de téléphone' })
    @IsString()
    @IsOptional()
    phone_number?: string;

    @ApiPropertyOptional({ example: 'Développeur Senior', description: 'Poste occupé' })
    @IsString()
    @IsOptional()
    position?: string;

    @ApiPropertyOptional({ example: '2024-01-15', description: 'Date d\'embauche (ISO 8601)' })
    @IsDateString({}, { message: 'Date d\'embauche invalide (format: YYYY-MM-DD)' })
    @IsOptional()
    hire_date?: Date;

    @ApiPropertyOptional({ example: 5000000, description: 'Salaire mensuel' })
    @IsNumber({}, { message: 'Le salaire doit être un nombre' })
    @Min(0, { message: 'Le salaire doit être positif' })
    @Max(999999999, { message: 'Salaire trop élevé' })
    @Type(() => Number)
    @IsOptional()
    salary?: number;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID du département' })
    @IsUUID('4', { message: 'ID de département invalide' })
    @IsOptional()
    department_id?: string;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID utilisateur associé (AuthManager)' })
    @IsUUID('4', { message: 'ID utilisateur invalide' })
    @IsOptional()
    user_id?: string;
}