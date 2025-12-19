import { IsOptional, IsInt, Min, Max, IsString, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Numéro de page', minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Nombre d\'éléments par page', minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'Doe', description: 'Recherche par nom, prénom ou email' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Filtrer par département' })
    @IsOptional()
    @IsUUID('4')
    department_id?: string;

    @ApiPropertyOptional({ example: true, description: 'Filtrer par statut actif' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    is_active?: boolean;

    @ApiPropertyOptional({ example: 'last_name', description: 'Champ de tri', default: 'last_name' })
    @IsOptional()
    @IsString()
    @IsIn(['first_name', 'last_name', 'email', 'position', 'hire_date', 'created_at'])
    sort_by?: string = 'last_name';

    @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'], description: 'Ordre de tri' })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sort_order?: 'ASC' | 'DESC' = 'ASC';
}