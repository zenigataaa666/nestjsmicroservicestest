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
    is_active?: boolean;
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
        isActive: data.is_active,
        sortBy: data.sort_by || 'lastName',
        sortOrder: data.sort_order || 'ASC',
      });

      console.log('result', result);

      // Formatter la réponse selon manage-employees.proto
      return {
        data: result.data.map(emp => this.formatEmployee(emp)),
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
      return this.formatEmployee(employee);
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
  async createEmployee(data: CreateEmployeeDto & { created_by?: string }) {
    try {
      const { created_by, ...employeeData } = data;
      // this.logger.log(`Création d'un employé par ${created_by}`);
      // const employee = await this.employeesService.create(employeeData, created_by);

      this.logger.log(`Création d'un employé`);

      const employee = await this.employeesService.create(employeeData);
      return this.formatEmployee(employee);
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
  async updateEmployee(data: { id: string; updated_by?: string } & UpdateEmployeeDto) {
    try {
      const { id, updated_by, ...updateData } = data;
      // this.logger.log(`Modification de l'employé ${id} par ${updated_by}`);
      // const employee = await this.employeesService.update(id, updateData, updated_by);

      this.logger.log(`Modification de l'employé ${id}`);

      const employee = await this.employeesService.update(id, updateData);
      return this.formatEmployee(employee);
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
  async deleteEmployee(data: { id: string; deleted_by?: string }) {
    try {
      // this.logger.warn(`Suppression de l'employé ${data.id} par ${data.deleted_by}`);
      // await this.employeesService.remove(data.id, data.deleted_by);
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

  // // ==================== DEACTIVATE EMPLOYEE ====================
  // @GrpcMethod('EmployeesService', 'DeactivateEmployee')
  // async deactivateEmployee(data: { id: string; deactivated_by?: string }) {
  //   try {
  //     this.logger.log(`Désactivation de l'employé ${data.id}`);
  //     const employee = await this.employeesService.deactivate(data.id, data.deactivated_by);
  //     return this.formatEmployee(employee);
  //   } catch (error) {
  //     throw new RpcException({
  //       code: 3,
  //       message: error.message || 'Erreur lors de la désactivation',
  //     });
  //   }
  // }

  // // ==================== ACTIVATE EMPLOYEE ====================
  // @GrpcMethod('EmployeesService', 'ActivateEmployee')
  // async activateEmployee(data: { id: string; activated_by?: string }) {
  //   try {
  //     this.logger.log(`Réactivation de l'employé ${data.id}`);
  //     const employee = await this.employeesService.activate(data.id, data.activated_by);
  //     return this.formatEmployee(employee);
  //   } catch (error) {
  //     throw new RpcException({
  //       code: 3,
  //       message: error.message || 'Erreur lors de la réactivation',
  //     });
  //   }
  // }

  // // ==================== GET EMPLOYEES BY DEPARTMENT ====================
  // @GrpcMethod('EmployeesService', 'GetEmployeesByDepartment')
  // async getEmployeesByDepartment(data: { department_id: string }) {
  //   try {
  //     this.logger.debug(`Récupération des employés du département ${data.department_id}`);
  //     const employees = await this.employeesService.findByDepartment(data.department_id);

  //     return {
  //       data: employees.map(emp => this.formatEmployee(emp)),
  //       total: employees.length,
  //       page: 1,
  //       limit: employees.length,
  //       total_pages: 1,
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       code: 13,
  //       message: 'Erreur lors de la récupération',
  //     });
  //   }
  // }

  // // ==================== GET EMPLOYEE STATS ====================
  // @GrpcMethod('EmployeesService', 'GetEmployeeStats')
  // async getEmployeeStats(data: { id: string }) {
  //   try {
  //     this.logger.debug(`Récupération des stats de l'employé ${data.id}`);
  //     const stats = await this.employeesService.getStats(data.id);

  //     return {
  //       employee: {
  //         id: stats.employee.id,
  //         full_name: stats.employee.fullName,
  //         email: stats.employee.email,
  //         position: stats.employee.position || '',
  //         department: stats.employee.department || '',
  //       },
  //       employment: {
  //         hire_date: stats.employment.hireDate?.toString() || '',
  //         years_of_service: stats.employment.yearsOfService || 0,
  //         months_of_service: stats.employment.monthsOfService || 0,
  //         is_active: stats.employment.isActive,
  //       },
  //     };
  //   } catch (error) {
  //     throw new RpcException({
  //       code: 5,
  //       message: error.message || 'Erreur lors de la récupération des statistiques',
  //     });
  //   }
  // }

  // ==================== HELPER: FORMAT EMPLOYEE ====================
  private formatEmployee(employee: any) {
    return {
      id: employee.id,
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email,
      phone: employee.phone_number || '',
      position: employee.position || '',
      hire_date: employee.hire_date?.toISOString() || '',
      salary: employee.salary || 0,
      is_active: employee.status === 'active',
      department: employee.department ? {
        id: employee.department.id,
        code: employee.department.code,
        name: employee.department.name,
        description: employee.department.description || '',
        manager_id: employee.department.manager_id || '',
        is_active: employee.department.status === 'active',
        created_at: employee.department.created_at?.toISOString() || '',
        updated_at: employee.department.updated_at?.toISOString() || '',
      } : null,
      department_id: employee.department_id || '',
      user_id: employee.user_id || '',
      created_at: employee.created_at?.toISOString() || '',
      updated_at: employee.updated_at?.toISOString() || '',
    };
  }
}