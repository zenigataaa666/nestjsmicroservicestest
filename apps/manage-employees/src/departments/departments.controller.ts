// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   HttpCode,
//   HttpStatus,
//   ParseUUIDPipe,
//   UseGuards,
// } from '@nestjs/common';
// import { DepartmentsService } from './departments.service';
// import { CreateDepartmentDto } from './dto/create-department.dto';
// import { UpdateDepartmentDto } from './dto/update-department.dto';
// import { PaginationDto } from '../common/dto/pagination.dto';

// @Controller('departments')
// export class DepartmentsController {
//   constructor(private readonly departmentsService: DepartmentsService) { }

//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   create(@Body() createDepartmentDto: CreateDepartmentDto) {
//     return this.departmentsService.create(createDepartmentDto);
//   }

//   @Get()
//   findAll(@Query() paginationDto: PaginationDto) {
//     return this.departmentsService.findAll(paginationDto);
//   }

//   @Get('roots')
//   findRootDepartments() {
//     return this.departmentsService.findRootDepartments();
//   }

//   @Get(':id')
//   findOne(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.findOne(id);
//   }

//   @Get(':id/children')
//   findChildren(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.findChildren(id);
//   }

//   @Get(':id/hierarchy')
//   getDepartmentHierarchy(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.getDepartmentHierarchy(id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() updateDepartmentDto: UpdateDepartmentDto,
//   ) {
//     return this.departmentsService.update(id, updateDepartmentDto);
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   remove(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.remove(id);
//   }

//   @Delete(':id/hard')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   hardDelete(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.hardDelete(id);
//   }

//   @Post(':id/restore')
//   restore(@Param('id', ParseUUIDPipe) id: string) {
//     return this.departmentsService.restore(id);
//   }
// }


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
    is_active?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) {
    try {
      this.logger.debug(`Récupération des départements`);

      const result = await this.departmentsService.findAll({
        page: data.page || 1,
        limit: data.limit || 10,
        search: data.search,
        isActive: data.is_active,
        sortBy: data.sort_by || 'name',
        sortOrder: data.sort_order || 'ASC',
      });

      console.log('result', result);

      // Formatter la réponse selon departments.proto
      return {
        data: result.data.map(dept => this.formatDepartment(dept)),
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

  // ==================== GET EMPLOYEE ====================
  @GrpcMethod('DepartmentsService', 'GetDepartment')
  async getDepartment(data: { id: string }) {
    try {
      this.logger.debug(`Récupération de l'employé ${data.id}`);
      const department = await this.departmentsService.findOne(data.id);
      return this.formatDepartment(department);
    } catch (error) {
      this.logger.error(`Erreur get_department: ${error.message}`);
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: error.message || 'Employé non trouvé',
      });
    }
  }

  // ==================== CREATE EMPLOYEE ====================
  @GrpcMethod('DepartmentsService', 'CreateDepartment')
  async createDepartment(data: CreateDepartmentDto & { created_by?: string }) {
    try {
      const { created_by, ...departmentData } = data;
      // this.logger.log(`Création d'un employé par ${created_by}`);
      // const department = await this.departmentsService.create(departmentData, created_by);

      this.logger.log(`Création d'un employé`);

      const department = await this.departmentsService.create(departmentData);
      return this.formatDepartment(department);
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

  // ==================== UPDATE EMPLOYEE ====================
  @GrpcMethod('DepartmentsService', 'UpdateDepartment')
  async updateDepartment(data: { id: string; updated_by?: string } & UpdateDepartmentDto) {
    try {
      const { id, updated_by, ...updateData } = data;
      // this.logger.log(`Modification de l'employé ${id} par ${updated_by}`);
      // const department = await this.departmentsService.update(id, updateData, updated_by);

      this.logger.log(`Modification de l'employé ${id}`);

      const department = await this.departmentsService.update(id, updateData);
      return this.formatDepartment(department);
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

  // ==================== DELETE EMPLOYEE ====================
  @GrpcMethod('DepartmentsService', 'DeleteDepartment')
  async deleteDepartment(data: { id: string; deleted_by?: string }) {
    try {
      // this.logger.warn(`Suppression de l'employé ${data.id} par ${data.deleted_by}`);
      // await this.departmentsService.remove(data.id, data.deleted_by);
      this.logger.warn(`Suppression de l'employé ${data.id}`);
      await this.departmentsService.remove(data.id);

      return {
        success: true,
        message: 'Employé supprimé avec succès',
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

  // ==================== HELPER: FORMAT DEPARTMENT ====================
  private formatDepartment(department: any) {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
      description: department.description || '',
      manager_id: department.manager_id || '',
      is_active: department.status === 'active',
      created_at: department.created_at?.toISOString() || '',
      updated_at: department.updated_at?.toISOString() || '',
    };
  }
}