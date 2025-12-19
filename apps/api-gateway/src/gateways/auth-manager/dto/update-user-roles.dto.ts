import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
    @ApiProperty({ example: ['uuid-role-1', 'uuid-role-2'], description: 'Liste des IDs de rôles' })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    role_ids: string[];
}
