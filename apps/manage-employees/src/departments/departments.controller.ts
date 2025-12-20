import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class DepartmentsController {
  private readonly logger = new Logger(DepartmentsController.name);

  constructor(private readonly departmentsService: DepartmentsService) { }

  // ==================== GET DEPARTMENTS ====================
  @GrpcMethod('DepartmentsService', 'GetDepartments')
  async getDepartments(data: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) {
    try {
      this.logger.debug(`Récupération des départements`);

      const result = await this.departmentsService.findAll({
        page: data.page || 1,
        limit: data.limit || 10,
        search: data.search,
        // isActive filter removed from proto for Departments? Checking proto...
        // Proto: GetDepartmentsRequest { ... string search = 3; bool is_active = 4; ... }
        // Wait, current proto snippet in plan (Step 2266) REMOVED is_active from GetDepartmentsRequest???
        // Let's check Step 2266 content.
        // message GetDepartmentsRequest { ... string search = 3; string sort_by = 4; ... } -> NO is_active in Step 2266 snippet.
        // Entity doesn't have status anymore. So removing isActive filter is correct.
        sortBy: data.sort_by || 'name',
        sortOrder: data.sort_order || 'ASC',
      });

      // Formatter la réponse selon departments.proto
      return {
        data: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        total_pages: result.meta.totalPages,
      };
    } catch (error) {
      this.logger.error(`Erreur get_departments: ${error.message}`);
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Erreur lors de la récupération des départments',
      });
    }
  }

  // ==================== GET DEPARTMENT ====================
  @GrpcMethod('DepartmentsService', 'GetDepartment')
  async getDepartment(data: { id: string }) {
    try {
      this.logger.debug(`Récupération du département ${data.id}`);
      const department = await this.departmentsService.findOne(data.id);
      return department;
    } catch (error) {
      this.logger.error(`Erreur get_department: ${error.message}`);
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: error.message || 'Département non trouvé',
      });
    }
  }

  // ==================== CREATE DEPARTMENT ====================
  @GrpcMethod('DepartmentsService', 'CreateDepartment')
  async createDepartment(data: CreateDepartmentDto) {
    try {
      this.logger.log(`Création d'un département`);

      const department = await this.departmentsService.create(data);
      return department;
    } catch (error) {
      this.logger.error(`Erreur create_department: ${error.message}`);

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

  // ==================== UPDATE DEPARTMENT ====================
  @GrpcMethod('DepartmentsService', 'UpdateDepartment')
  async updateDepartment(data: { id: string; } & UpdateDepartmentDto) {
    try {
      const { id, ...updateData } = data;
      this.logger.log(`Modification du département ${id}`);

      const department = await this.departmentsService.update(id, updateData);
      return department;
    } catch (error) {
      this.logger.error(`Erreur update_department: ${error.message}`);

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

  // ==================== DELETE DEPARTMENT ====================
  @GrpcMethod('DepartmentsService', 'DeleteDepartment')
  async deleteDepartment(data: { id: string; }) {
    try {
      this.logger.warn(`Suppression du département ${data.id}`);
      await this.departmentsService.remove(data.id);

      return {
        success: true,
        message: 'Département supprimé avec succès',
        code: 0,
      };
    } catch (error) {
      this.logger.error(`Erreur delete_department: ${error.message}`);
      throw new RpcException({
        code: 5,
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  }
}