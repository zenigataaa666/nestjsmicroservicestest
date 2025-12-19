import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) { }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    // Vérifier si le code existe déjà
    const existingCode = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code, deleted_at: IsNull() },
    });

    if (existingCode) {
      throw new ConflictException('Department code already exists');
    }

    // Vérifier que le parent existe si fourni
    if (createDepartmentDto.parent_id) {
      await this.findOne(createDepartmentDto.parent_id);
    }

    const department = this.departmentRepository.create(createDepartmentDto);

    try {
      return await this.departmentRepository.save(department);
    } catch (error) {
      throw new BadRequestException('Failed to create department');
    }
  }

  async findAll(queryDto: any) {
    const { page = 1, limit = 10, search, isActive, sortBy = 'name', sortOrder = 'ASC' } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: IsNull() };

    if (isActive !== undefined) {
      where.status = isActive ? 'active' : Not('active');
    }

    const [data, total] = await this.departmentRepository.findAndCount({
      where,
      relations: ['parent', 'manager', 'employees'],
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['parent', 'children', 'manager', 'employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async findRootDepartments(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { parent_id: IsNull(), deleted_at: IsNull() },
      relations: ['children', 'manager'],
      order: { name: 'ASC' },
    });
  }

  async findChildren(parent_id: string): Promise<Department[]> {
    const parent = await this.findOne(parent_id);

    return await this.departmentRepository.find({
      where: { parent_id: parent.id, deleted_at: IsNull() },
      relations: ['children', 'manager', 'employees'],
      order: { name: 'ASC' },
    });
  }

  async getDepartmentHierarchy(id: string): Promise<Department> {
    const department = await this.findOne(id);
    return await this.loadHierarchy(department);
  }

  private async loadHierarchy(department: Department): Promise<Department> {
    const children = await this.departmentRepository.find({
      where: { parent_id: department.id, deleted_at: IsNull() },
      relations: ['manager', 'employees'],
    });

    for (const child of children) {
      await this.loadHierarchy(child);
    }

    department.children = children;
    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    // Vérifier l'unicité du code si modifié
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingCode = await this.departmentRepository.findOne({
        where: { code: updateDepartmentDto.code, deleted_at: IsNull() },
      });

      if (existingCode) {
        throw new ConflictException('Department code already exists');
      }
    }

    // Empêcher qu'un département soit son propre parent
    if (updateDepartmentDto.parent_id === id) {
      throw new BadRequestException('A department cannot be its own parent');
    }

    // Vérifier que le nouveau parent existe
    if (updateDepartmentDto.parent_id) {
      await this.findOne(updateDepartmentDto.parent_id);

      // Vérifier qu'on ne crée pas de boucle dans la hiérarchie
      if (await this.wouldCreateCycle(id, updateDepartmentDto.parent_id)) {
        throw new BadRequestException('Cannot create circular reference in department hierarchy');
      }
    }

    Object.assign(department, updateDepartmentDto);

    try {
      return await this.departmentRepository.save(department);
    } catch (error) {
      throw new BadRequestException('Failed to update department');
    }
  }

  private async wouldCreateCycle(department_id: string, new_parent_id: string): Promise<boolean> {
    let current_id = new_parent_id;

    while (current_id) {
      if (current_id === department_id) {
        return true;
      }

      const parent = await this.departmentRepository.findOne({
        where: { id: current_id, deleted_at: IsNull() },
      });

      if (!parent || !parent.parent_id) {
        break;
      }

      current_id = parent.parent_id;
    }

    return false;
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // Vérifier s'il y a des sous-départements
    const childrenCount = await this.departmentRepository.count({
      where: { parent_id: id, deleted_at: IsNull() },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete department with active sub-departments');
    }

    department.deleted_at = new Date();
    await this.departmentRepository.save(department);
  }

  async hardDelete(id: string): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }

  async restore(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, deleted_at: Not(IsNull()) },
    });

    if (!department) {
      throw new NotFoundException(`Deleted department with ID ${id} not found`);
    }

    department.deleted_at = null;
    return await this.departmentRepository.save(department);
  }
}