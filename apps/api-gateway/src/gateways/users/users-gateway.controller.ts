import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Put
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsersGatewayService } from './users-gateway.service';

@ApiTags('Gestion des Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersGatewayController {
    constructor(private readonly usersGatewayService: UsersGatewayService) { }

    @Get()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Lister les utilisateurs' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Liste des utilisateurs paginée' })
    async getUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string
    ) {
        return this.usersGatewayService.getUsers({ page, limit, search });
    }

    @Post()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Créer un utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé' })
    async createUser(@Body() createUserDto: any) {
        return this.usersGatewayService.createUser(createUserDto);
    }

    @Get(':id')
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
    @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
    @ApiResponse({ status: 200, description: 'Détails de l\'utilisateur' })
    async getUser(@Param('id') id: string) {
        return this.usersGatewayService.getUser(id);
    }

    @Post(':id/roles')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Mettre à jour les rôles d\'un utilisateur' })
    async updateUserRoles(
        @Param('id') id: string,
        @Body('role_ids') roleIds: string[]
    ) {
        return this.usersGatewayService.updateUserRoles(id, roleIds);
    }
}
