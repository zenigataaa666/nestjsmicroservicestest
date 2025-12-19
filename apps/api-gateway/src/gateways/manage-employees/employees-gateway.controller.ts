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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { EmployeesGatewayService } from './employees-gateway.service';

@ApiTags('Employees Management')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesGatewayController {
    private readonly logger = new Logger(EmployeesGatewayController.name);

    constructor(
        private readonly employeesGatewayService: EmployeesGatewayService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Liste des employés' })
    @Roles('admin', 'hr_manager')
    async getEmployees(@Query() query: EmployeeQueryDto) {
        try {
            this.logger.log(`Récupération de la liste des employés`);
            return await this.employeesGatewayService.getEmployees(query);
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
            return await this.employeesGatewayService.getEmployee(id);
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
            return await this.employeesGatewayService.createEmployee({
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
            return await this.employeesGatewayService.updateEmployee(id, {
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
            return await this.employeesGatewayService.deleteEmployee(id, user.id);
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

    @Get('department/:departmentId')
    @ApiOperation({ summary: 'Employés par département' })
    @Roles('admin', 'hr_manager')
    async getEmployeesByDepartment(@Param('departmentId') departmentId: string) {
        try {
            return await this.employeesGatewayService.getEmployeesByDepartment(departmentId);
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}