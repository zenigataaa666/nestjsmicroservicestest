import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PermissionsGatewayService } from './permissions-gateway.service';

@ApiTags('Gestion des Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsGatewayController {
    constructor(private readonly permissionsGatewayService: PermissionsGatewayService) { }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Lister toutes les permissions (Détails)' })
    async getAllPermissions() {
        return this.permissionsGatewayService.getAllPermissions();
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Créer une permission' })
    async createPermission(@Body() data: { name: string; description: string; resource: string; action: string }) {
        return this.permissionsGatewayService.createPermission(data);
    }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Mettre à jour une permission' })
    async updatePermission(
        @Param('id') id: string,
        @Body() data: { name?: string; description?: string; resource?: string; action?: string }
    ) {
        return this.permissionsGatewayService.updatePermission(id, data);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Supprimer une permission' })
    async deletePermission(@Param('id') id: string) {
        return this.permissionsGatewayService.deletePermission(id);
    }
}
