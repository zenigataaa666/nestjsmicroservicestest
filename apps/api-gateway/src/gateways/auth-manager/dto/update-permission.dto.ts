import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
    @ApiPropertyOptional({ example: 'Create Users', description: 'Nom lisible' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Allows creating new users', description: 'Description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'users', description: 'Ressource' })
    @IsString()
    @IsOptional()
    resource?: string;

    @ApiPropertyOptional({ example: 'create', description: 'Action' })
    @IsString()
    @IsOptional()
    action?: string;
}
