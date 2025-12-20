import { IsString, IsOptional, IsUUID, MaxLength, MinLength, IsEnum } from 'class-validator';

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
}