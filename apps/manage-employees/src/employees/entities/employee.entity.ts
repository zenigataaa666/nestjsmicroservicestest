import { Department } from '../../departments/entities/department.entity';
import { Document } from '../../documents/entities/document.entity';
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

@Entity('employees')
@Index(['email'], { unique: true })
@Index(['employee_code'], { unique: true })
@Index(['department_id'])
@Index(['status'])
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'varchar', length: 255, nullable: true })
    @Index()
    user_id: string | null;

    @Column({ name: 'employee_code', type: 'varchar', length: 50, unique: true })
    employee_code: string;

    @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
    first_name: string | null;

    @Column({ name: 'last_name', type: 'varchar', length: 100 })
    last_name: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    email: string | null;

    @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
    phone_number: string | null;

    @Column({ name: 'hire_date', type: 'date' })
    hire_date: Date;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birth_date: Date | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    position: string | null;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, nullable: true })
    salary: number | null;

    @Column({ name: 'department_id', type: 'uuid', nullable: true })
    department_id: string | null;

    @ManyToOne(() => Department, (department) => department.employees, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({
        type: 'enum',
        enum: ['active', 'on_leave', 'suspended', 'terminated'],
        default: 'active',
    })
    status: string;

    @Column({ type: 'text', nullable: true })
    address: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string | null;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @Index()
    deleted_at: Date | null;
}