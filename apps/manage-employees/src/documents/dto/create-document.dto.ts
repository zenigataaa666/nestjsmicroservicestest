import { IsString, IsOptional, IsUUID, MaxLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
    @IsString()
    @MaxLength(100)
    document_type: string;

    @IsString()
    @MaxLength(255)
    file_name: string;

    @IsString()
    @MaxLength(255)
    file_path: string;

    @IsOptional()
    @IsString()
    @MaxLength(64)
    file_hash?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    file_size: number;

    @IsString()
    @MaxLength(50)
    file_type: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @MaxLength(100)
    uploaded_by: string;

    @IsUUID()
    employee_id: string;
}
