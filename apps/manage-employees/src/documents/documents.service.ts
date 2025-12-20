import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
    ) { }

    async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
        const document = this.documentRepository.create(createDocumentDto);
        return await this.documentRepository.save(document);
    }

    async findAllByEmployee(employeeId: string): Promise<Document[]> {
        return await this.documentRepository.find({
            where: { employee_id: employeeId },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Document> {
        const document = await this.documentRepository.findOne({ where: { id } });
        if (!document) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }
        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
        const document = await this.findOne(id);
        Object.assign(document, updateDocumentDto);
        return await this.documentRepository.save(document);
    }

    async remove(id: string): Promise<void> {
        const document = await this.findOne(id);
        await this.documentRepository.remove(document);
    }

    async createFromUpload(file: Express.Multer.File, body: any): Promise<Document> {
        const fileHash = await this.calculateFileHash(file.path);

        const createDocumentDto: CreateDocumentDto = {
            document_type: body.document_type || 'other',
            file_name: file.originalname,
            file_path: file.path,
            file_hash: fileHash,
            file_size: file.size,
            file_type: file.mimetype,
            description: body.description,
            uploaded_by: body.uploaded_by || 'system',
            employee_id: body.employee_id,
        };

        return this.create(createDocumentDto);
    }

    private async calculateFileHash(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            stream.on('error', (err) => reject(err));
            stream.on('data', (chunk) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }
}
