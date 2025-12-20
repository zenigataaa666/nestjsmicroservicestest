import { Employee } from '../../employees/entities/employee.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';

@Entity('departments')
@Index(['code'], { unique: true })
@Index(['parent_id'])
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'parent_id', type: 'uuid', nullable: true })
    parent_id: string | null;

    @ManyToOne(() => Department, (department) => department.children, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'parent_id' })
    parent: Department;

    @OneToMany(() => Department, (department) => department.parent)
    children: Department[];

    @OneToMany(() => Employee, (employee) => employee.department)
    employees: Employee[];

    @Column({ name: 'manager_id', type: 'uuid', nullable: true })
    @Index()
    manager_id: string | null;

    @ManyToOne(() => Employee, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'manager_id' })
    manager: Employee;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @Index()
    deleted_at: Date | null;
}