import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, IsEnum, IsUUID, MaxLength, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    user_id?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    employee_code: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    first_name?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    last_name: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone_number?: string;

    @IsDateString()
    hire_date: string;

    @IsOptional()
    @IsDateString()
    birth_date?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    position?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salary?: number;

    @IsOptional()
    @IsUUID()
    department_id?: string;

    @IsOptional()
    @IsEnum(['active', 'on_leave', 'suspended', 'terminated'])
    status?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;
}
