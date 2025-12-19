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
    Inject,
    HttpException,
    HttpStatus,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';

// Interface du service gRPC
interface DepartmentsServiceClient {
    getDepartments(data: any): Promise<any>;
    getDepartment(data: { id: string }): Promise<any>;
    createDepartment(data: any): Promise<any>;
    updateDepartment(data: any): Promise<any>;
    deleteDepartment(data: { id: string; deleted_by?: string }): Promise<any>;
}

@ApiTags('Departments Management')
@Controller('api/v1/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsGatewayController implements OnModuleInit {
    private readonly logger = new Logger(DepartmentsGatewayController.name);
    private departmentsServiceClient: DepartmentsServiceClient;

    constructor(
        @Inject('EMPLOYEES_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.departmentsServiceClient = this.client.getService<DepartmentsServiceClient>('DepartmentsService');
        this.logger.log('✅ Client gRPC DepartmentsService initialisé');
    }

    @Get()
    @ApiOperation({ summary: 'Liste des départements' })
    @Roles('admin', 'hr_manager')
    async getDepartments(@Query() query: DepartmentQueryDto) {
        try {
            this.logger.log(`Récupération de la liste des départements`);

            const result = await this.departmentsServiceClient.getDepartments({
                page: query.page || 1,
                limit: query.limit || 10,
                search: query.search || '',
                // department_id: query.departmentId || '',
                // is_active: query.isActive !== undefined ? query.isActive : true,
                // sort_by: query.sortBy || 'last_name',
                // sort_order: query.sortOrder || 'ASC',
            });

            return result;
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
            return await this.departmentsServiceClient.getDepartment({ id });
        } catch (error) {
            if (error.code === 5) { // NOT_FOUND
                throw new HttpException(
                    `Employé #${id} non trouvé`,
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                'Erreur lors de la récupération de le département',
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

            return await this.departmentsServiceClient.createDepartment({
                ...createDepartmentDto,
                created_by: user.id,
            });
        } catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                throw new HttpException(
                    'Un département avec cet email existe déjà',
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
            return await this.departmentsServiceClient.updateDepartment({
                id,
                ...updateDepartmentDto,
                updated_by: user.id,
            });
        } catch (error) {
            if (error.code === 5) {
                throw new HttpException(`Employé #${id} non trouvé`, HttpStatus.NOT_FOUND);
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
            return await this.departmentsServiceClient.deleteDepartment({
                id,
                deleted_by: user.id,
            });
        } catch (error) {
            if (error.code === 5) {
                throw new HttpException(`Employé #${id} non trouvé`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                'Erreur lors de la suppression',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}