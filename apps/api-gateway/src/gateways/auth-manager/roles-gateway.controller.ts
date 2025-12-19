import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGatewayService } from './roles-gateway.service';

@ApiTags('Gestion des Rôles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesGatewayController {
    constructor(private readonly rolesGatewayService: RolesGatewayService) { }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Lister les rôles' })
    async getRoles() {
        return this.rolesGatewayService.getRoles();
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Créer un rôle' })
    async createRole(@Body() createRoleDto: { name: string; description: string; permissions: string[] }) {
        return this.rolesGatewayService.createRole(createRoleDto);
    }

    @Put(':id/permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Mettre à jour les permissions d\'un rôle' })
    async updateRolePermissions(
        @Param('id') id: string,
        @Body('permissions') permissions: string[]
    ) {
        return this.rolesGatewayService.updateRolePermissions(id, permissions);
    }
}
