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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';

// Interface du service gRPC
interface EmployeesServiceClient {
    getEmployees(data: any): Promise<any>;
    getEmployee(data: { id: string }): Promise<any>;
    createEmployee(data: any): Promise<any>;
    updateEmployee(data: any): Promise<any>;
    deleteEmployee(data: { id: string; deleted_by?: string }): Promise<any>;
    deactivateEmployee(data: { id: string; deactivated_by?: string }): Promise<any>;
    activateEmployee(data: { id: string; activated_by?: string }): Promise<any>;
    getEmployeeStats(data: { id: string }): Promise<any>;
    getEmployeesByDepartment(data: { department_id: string }): Promise<any>;
}

@ApiTags('Employees Management')
@Controller('api/v1/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesGatewayController implements OnModuleInit {
    private readonly logger = new Logger(EmployeesGatewayController.name);
    private employeesServiceClient: EmployeesServiceClient;

    constructor(
        @Inject('EMPLOYEES_SERVICE') private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.employeesServiceClient = this.client.getService<EmployeesServiceClient>('EmployeesService');
        this.logger.log('✅ Client gRPC EmployeesService initialisé');
    }

    @Get()
    @ApiOperation({ summary: 'Liste des employés' })
    @Roles('admin', 'hr_manager')
    async getEmployees(@Query() query: EmployeeQueryDto) {
        try {
            this.logger.log(`Récupération de la liste des employés`);

            const result = await this.employeesServiceClient.getEmployees({
                page: query.page || 1,
                limit: query.limit || 10,
                search: query.search || '',
                department_id: query.department_id || '',
                is_active: query.is_active !== undefined ? query.is_active : true,
                sort_by: query.sort_by || 'last_name',
                sort_order: query.sort_order || 'ASC',
            });

            return result;
        } catch (error) {
            this.logger.error(`Erreur récupération employés: ${error.message}`);

            if (error.code === 14) { // UNAVAILABLE
                throw new HttpException(
                    'Service des employés temporairement indisponible',
                    HttpStatus.SERVICE_UNAVAILABLE,
                );
            }

            throw new HttpException(
                'Erreur lors de la récupération des employés',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'un employé' })
    @Roles('admin', 'hr_manager')
    async getEmployee(@Param('id') id: string) {
        try {
            return await this.employeesServiceClient.getEmployee({ id });
        } catch (error) {
            if (error.code === 5) { // NOT_FOUND
                throw new HttpException(
                    `Employé #${id} non trouvé`,
                    HttpStatus.NOT_FOUND,
                );
            }
            throw new HttpException(
                'Erreur lors de la récupération de l\'employé',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post()
    @ApiOperation({ summary: 'Créer un employé' })
    @Roles('admin', 'hr_manager')
    async createEmployee(
        @Body() createEmployeeDto: CreateEmployeeDto,
        @CurrentUser() user: any,
    ) {
        try {
            this.logger.log(`Création d'un employé par ${user.email}`);

            return await this.employeesServiceClient.createEmployee({
                ...createEmployeeDto,
                created_by: user.id,
            });
        } catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                throw new HttpException(
                    'Un employé avec cet email existe déjà',
                    HttpStatus.CONFLICT,
                );
            }
            throw new HttpException(
                'Erreur lors de la création de l\'employé',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modifier un employé' })
    @Roles('admin', 'hr_manager')
    async updateEmployee(
        @Param('id') id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
        @CurrentUser() user: any,
    ) {
        try {
            return await this.employeesServiceClient.updateEmployee({
                id,
                ...updateEmployeeDto,
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
    @ApiOperation({ summary: 'Supprimer un employé' })
    @Roles('admin')
    async deleteEmployee(@Param('id') id: string, @CurrentUser() user: any) {
        try {
            return await this.employeesServiceClient.deleteEmployee({
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

    // @Post(':id/deactivate')
    // @ApiOperation({ summary: 'Désactiver un employé' })
    // @Roles('admin', 'hr_manager')
    // async deactivateEmployee(@Param('id') id: string, @CurrentUser() user: any) {
    //     try {
    //         return await this.employeesServiceClient.deactivateEmployee({
    //             id,
    //             deactivated_by: user.id,
    //         });
    //     } catch (error) {
    //         throw new HttpException(
    //             'Erreur lors de la désactivation',
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    // @Post(':id/activate')
    // @ApiOperation({ summary: 'Réactiver un employé' })
    // @Roles('admin', 'hr_manager')
    // async activateEmployee(@Param('id') id: string, @CurrentUser() user: any) {
    //     try {
    //         return await this.employeesServiceClient.activateEmployee({
    //             id,
    //             activated_by: user.id,
    //         });
    //     } catch (error) {
    //         throw new HttpException(
    //             'Erreur lors de la réactivation',
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    // @Get(':id/stats')
    // @ApiOperation({ summary: 'Statistiques d\'un employé' })
    // @Roles('admin', 'hr_manager')
    // async getEmployeeStats(@Param('id') id: string) {
    //     try {
    //         return await this.employeesServiceClient.getEmployeeStats({ id });
    //     } catch (error) {
    //         throw new HttpException(
    //             'Erreur lors de la récupération des statistiques',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    @Get('department/:departmentId')
    @ApiOperation({ summary: 'Employés par département' })
    @Roles('admin', 'hr_manager')
    async getEmployeesByDepartment(@Param('departmentId') departmentId: string) {
        try {
            return await this.employeesServiceClient.getEmployeesByDepartment({
                department_id: departmentId,
            });
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}