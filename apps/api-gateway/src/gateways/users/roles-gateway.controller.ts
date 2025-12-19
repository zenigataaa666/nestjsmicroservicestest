import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsersGatewayService } from './users-gateway.service';

@ApiTags('Gestion des Rôles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesGatewayController {
    constructor(private readonly usersGatewayService: UsersGatewayService) { }

    @Get()
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Lister les rôles' })
    async getRoles() {
        return this.usersGatewayService.getRoles();
    }

    @Post()
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Créer un rôle' })
    async createRole(@Body() createRoleDto: { name: string; description: string; permissions: string[] }) {
        return this.usersGatewayService.createRole(createRoleDto);
    }

    @Put(':id/permissions')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Mettre à jour les permissions d\'un rôle' })
    async updateRolePermissions(
        @Param('id') id: string,
        @Body('permissions') permissions: string[]
    ) {
        return this.usersGatewayService.updateRolePermissions(id, permissions);
    }

    @Get('permissions')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Lister toutes les permissions disponibles' })
    async getPermissions() {
        return this.usersGatewayService.getPermissions();
    }
}
