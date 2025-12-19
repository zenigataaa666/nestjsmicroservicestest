import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John', description: 'Prénom' })
    @IsString()
    @IsOptional()
    first_name?: string;

    @ApiPropertyOptional({ example: 'Doe', description: 'Nom de famille' })
    @IsString()
    @IsOptional()
    last_name?: string;

    @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email professionnel' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+33612345678', description: 'Numéro de téléphone' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: true, description: 'Statut du compte' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
