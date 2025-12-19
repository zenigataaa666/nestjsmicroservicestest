import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    @ApiPropertyOptional({ example: true, description: 'Statut actif de l\'employé' })
    @IsBoolean({ message: 'Le statut doit être un booléen' })
    @IsOptional()
    is_active?: boolean;
}