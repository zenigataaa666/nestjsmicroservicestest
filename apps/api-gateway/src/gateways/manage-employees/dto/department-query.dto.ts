import { IsOptional, IsInt, Min, Max, IsString, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentQueryDto {
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
}