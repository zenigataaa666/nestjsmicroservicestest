import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, MaxLength, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    code: string;

    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    parent_id?: string;

    @IsOptional()
    @IsUUID()
    manager_id?: string;

    @IsEnum(['active', 'inactive', 'archived'])
    status: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    budget?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    cost_center?: string;
}