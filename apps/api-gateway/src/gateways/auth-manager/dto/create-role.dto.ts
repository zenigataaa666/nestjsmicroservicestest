import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'manager', description: 'Nom unique du rôle' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Gestionnaire d\'équipe', description: 'Description du rôle' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: ['perm-uuid-1'], description: 'IDs des permissions initiales' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissions?: string[];
}
