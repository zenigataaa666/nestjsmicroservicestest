import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Put,
    Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsersGatewayService } from './users-gateway.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@ApiTags('Gestion des Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersGatewayController {
    constructor(private readonly usersGatewayService: UsersGatewayService) { }

    @Get()
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Lister les utilisateurs' })
    @ApiResponse({ status: 200, description: 'Liste des utilisateurs paginée' })
    async getUsers(@Query() query: GetUsersQueryDto) {
        return this.usersGatewayService.getUsers(query);
    }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Créer un utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé' })
    async createUser(@Body() createUserDto: CreateUserDto) {
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
    @Roles('admin')
    @ApiOperation({ summary: 'Mettre à jour les rôles d\'un utilisateur' })
    @ApiBody({ type: UpdateUserRolesDto })
    async updateUserRoles(
        @Param('id') id: string,
        @Body() dto: UpdateUserRolesDto
    ) {
        return this.usersGatewayService.updateUserRoles(id, dto.role_ids);
    }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
    @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersGatewayService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Supprimer un utilisateur' })
    @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
    async deleteUser(@Param('id') id: string) {
        return this.usersGatewayService.deleteUser(id);
    }
}
