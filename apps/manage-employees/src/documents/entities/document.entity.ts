import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    document_type: string;

    @Column({ type: 'varchar', length: 255 })
    file_name: string;

    @Column({ type: 'varchar', length: 255 })
    file_path: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    file_hash: string | null;

    @Column({ type: 'bigint' })
    file_size: number;

    @Column({ type: 'varchar', length: 50 })
    file_type: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', length: 100 })
    uploaded_by: string;

    @Column({ name: 'employee_id', type: 'uuid' })
    employee_id: string;

    @ManyToOne(() => Employee, (employee: any) => employee.documents, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    })
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
