import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionsDto {
    @ApiProperty({ example: ['perm-uuid-1', 'perm-uuid-2'], description: 'Liste complète des IDs de permissions' })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    permissions: string[];
}
