import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
    @ApiProperty({ example: 'Create Users', description: 'Nom lisible de la permission' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Allows creating new users', description: 'Description de la permission' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'users', description: 'Ressource concernée' })
    @IsString()
    @IsNotEmpty()
    resource: string;

    @ApiProperty({ example: 'create', description: 'Action autorisée' })
    @IsString()
    @IsNotEmpty()
    action: string;
}
