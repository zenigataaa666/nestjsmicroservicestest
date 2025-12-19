import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsersGatewayService } from './users-gateway.service';

@ApiTags('Gestion des Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsGatewayController {
    constructor(private readonly usersGatewayService: UsersGatewayService) { }

    @Get()
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Lister toutes les permissions (Détails)' })
    async getAllPermissions() {
        return this.usersGatewayService.getAllPermissions();
    }

    @Post()
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Créer une permission' })
    async createPermission(@Body() data: { name: string; description: string; resource: string; action: string }) {
        return this.usersGatewayService.createPermission(data);
    }

    @Put(':id')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Mettre à jour une permission' })
    async updatePermission(
        @Param('id') id: string,
        @Body() data: { name?: string; description?: string; resource?: string; action?: string }
    ) {
        return this.usersGatewayService.updatePermission(id, data);
    }

    @Delete(':id')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Supprimer une permission' })
    async deletePermission(@Param('id') id: string) {
        return this.usersGatewayService.deletePermission(id);
    }
}
