import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGatewayService } from './roles-gateway.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@ApiTags('Gestion des Rôles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesGatewayController {
    constructor(private readonly rolesGatewayService: RolesGatewayService) { }

    @Get()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Lister les rôles' })
    async getRoles() {
        return this.rolesGatewayService.getRoles();
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Créer un rôle' })
    async createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesGatewayService.createRole(createRoleDto);
    }

    @Put(':id/permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Mettre à jour les permissions d\'un rôle' })
    @ApiBody({ type: UpdateRolePermissionsDto })
    async updateRolePermissions(
        @Param('id') id: string,
        @Body() dto: UpdateRolePermissionsDto
    ) {
        return this.rolesGatewayService.updateRolePermissions(id, dto.permissions);
    }
}
