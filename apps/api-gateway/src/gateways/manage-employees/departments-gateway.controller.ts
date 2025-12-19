import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { DepartmentsGatewayService } from './departments-gateway.service';

@ApiTags('Departments Management')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsGatewayController {
    private readonly logger = new Logger(DepartmentsGatewayController.name);

    constructor(
        private readonly departmentsGatewayService: DepartmentsGatewayService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Liste des départements' })
    @Roles('admin', 'hr_manager')
    async getDepartments(@Query() query: DepartmentQueryDto) {
        try {
            this.logger.log(`Récupération de la liste des départements`);
            return await this.departmentsGatewayService.getDepartments(query);
        } catch (error) {
            this.logger.error(`Erreur récupération départements: ${error.message}`);
            if (error.code === 14) { // UNAVAILABLE
                throw new HttpException(
                    'Service des départements temporairement indisponible',
                    HttpStatus.SERVICE_UNAVAILABLE,
                );
            }
            throw new HttpException(
                'Erreur lors de la récupération des départements',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'un département' })
    @Roles('admin', 'hr_manager')
    async getDepartment(@Param('id') id: string) {
        try {
            return await this.departmentsGatewayService.getDepartment(id);
        } catch (error) {
            if (error.code === 5) { // NOT_FOUND
                throw new HttpException(
                    `Département #${id} non trouvé`,
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                'Erreur lors de la récupération du département',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post()
    @ApiOperation({ summary: 'Créer un département' })
    @Roles('admin')
    async createDepartment(
        @Body() createDepartmentDto: CreateDepartmentDto,
        @CurrentUser() user: any,
    ) {
        try {
            this.logger.log(`Création d'un département par ${user.email}`);
            return await this.departmentsGatewayService.createDepartment({
                ...createDepartmentDto,
                created_by: user.id,
            });
        } catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                throw new HttpException(
                    'Un département avec cet nom existe déjà',
                    HttpStatus.CONFLICT,
                );
            }
            throw new HttpException(
                'Erreur lors de la création du département',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modifier un département' })
    @Roles('admin', 'hr_manager')
    async updateDepartment(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
        @CurrentUser() user: any,
    ) {
        try {
            return await this.departmentsGatewayService.updateDepartment(id, {
                ...updateDepartmentDto,
                updated_by: user.id,
            });
        } catch (error) {
            if (error.code === 5) {
                throw new HttpException(`Département #${id} non trouvé`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                'Erreur lors de la modification',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un département' })
    @Roles('admin')
    async deleteDepartment(@Param('id') id: string, @CurrentUser() user: any) {
        try {
            return await this.departmentsGatewayService.deleteDepartment(id, user.id);
        } catch (error) {
            if (error.code === 5) {
                throw new HttpException(`Département #${id} non trouvé`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                'Erreur lors de la suppression',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}