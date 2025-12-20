import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(private readonly employeesService: EmployeesService) { }

  // ==================== GET EMPLOYEES ====================
  @GrpcMethod('EmployeesService', 'GetEmployees')
  async getEmployees(data: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }) {
    try {
      this.logger.debug(`Récupération des employés`);

      const result = await this.employeesService.findAll({
        page: data.page || 1,
        limit: data.limit || 10,
        search: data.search,
        departmentId: data.department_id,
        // Map boolean is_active from proto to status enum logic if service supports it, 
        // or let service handle undefined (proto defaults false if missing in proto3? No, optional or default).
        // For now pass as is, service likely expects specific filters.
        // Map status from proto
        status: data.status,
        sortBy: data.sort_by || 'last_name', // standardized snake_case
        sortOrder: data.sort_order || 'ASC',
      });

      // Formatter la réponse selon manage-employees.proto
      return {
        data: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        total_pages: result.meta.totalPages,
      };
    } catch (error) {
      this.logger.error(`Erreur get_employees: ${error.message}`);
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Erreur lors de la récupération des employés',
      });
    }
  }

  // ==================== GET EMPLOYEE ====================
  @GrpcMethod('EmployeesService', 'GetEmployee')
  async getEmployee(data: { id: string }) {
    try {
      this.logger.debug(`Récupération de l'employé ${data.id}`);
      const employee = await this.employeesService.findOne(data.id);
      return employee;
    } catch (error) {
      this.logger.error(`Erreur get_employee: ${error.message}`);
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: error.message || 'Employé non trouvé',
      });
    }
  }

  // ==================== CREATE EMPLOYEE ====================
  @GrpcMethod('EmployeesService', 'CreateEmployee')
  async createEmployee(data: CreateEmployeeDto) {
    try {
      this.logger.log(`Création d'un employé`);

      const employee = await this.employeesService.create(data);
      return employee;
    } catch (error) {
      this.logger.error(`Erreur create_employee: ${error.message}`);

      if (error.message?.includes('existe déjà')) {
        throw new RpcException({
          code: 6, // ALREADY_EXISTS
          message: error.message,
        });
      }

      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: error.message || 'Erreur lors de la création',
      });
    }
  }

  // ==================== UPDATE EMPLOYEE ====================
  @GrpcMethod('EmployeesService', 'UpdateEmployee')
  async updateEmployee(data: { id: string; } & UpdateEmployeeDto) {
    try {
      const { id, ...updateData } = data;
      this.logger.log(`Modification de l'employé ${id}`);

      const employee = await this.employeesService.update(id, updateData);
      return employee;
    } catch (error) {
      this.logger.error(`Erreur update_employee: ${error.message}`);

      if (error.message?.includes('non trouvé')) {
        throw new RpcException({
          code: 5,
          message: error.message,
        });
      }

      throw new RpcException({
        code: 3,
        message: error.message || 'Erreur lors de la modification',
      });
    }
  }

  // ==================== DELETE EMPLOYEE ====================
  @GrpcMethod('EmployeesService', 'DeleteEmployee')
  async deleteEmployee(data: { id: string }) {
    try {
      this.logger.warn(`Suppression de l'employé ${data.id}`);
      await this.employeesService.remove(data.id);

      return {
        success: true,
        message: 'Employé supprimé avec succès',
        code: 0,
      };
    } catch (error) {
      this.logger.error(`Erreur delete_employee: ${error.message}`);
      throw new RpcException({
        code: 5,
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  }
}