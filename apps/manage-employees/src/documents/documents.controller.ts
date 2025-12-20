import { Controller, Logger, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
    private readonly logger = new Logger(DocumentsController.name);

    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        this.logger.log(`Upload file: ${file.originalname}`);
        return this.documentsService.createFromUpload(file, body);
    }

    @GrpcMethod('DocumentsService', 'CreateDocument')
    async createDocument(data: CreateDocumentDto) {
        try {
            this.logger.log(`Création d'un document pour l'employé ${data.employee_id} par ${data.uploaded_by}`);
            const document = await this.documentsService.create(data);
            return document;
        } catch (error) {
            this.logger.error(`Erreur create_document: ${error.message}`);
            throw new RpcException({
                code: 3, // INVALID_ARGUMENT
                message: error.message || 'Erreur lors de la création du document',
            });
        }
    }

    @GrpcMethod('DocumentsService', 'GetDocumentsByEmployee')
    async getDocumentsByEmployee(data: { employee_id: string }) {
        try {
            this.logger.debug(`Récupération des documents pour l'employé ${data.employee_id}`);
            const documents = await this.documentsService.findAllByEmployee(data.employee_id);
            return {
                data: documents,
            };
        } catch (error) {
            this.logger.error(`Erreur get_documents_by_employee: ${error.message}`);
            throw new RpcException({
                code: 13, // INTERNAL
                message: 'Erreur lors de la récupération des documents',
            });
        }
    }

    @GrpcMethod('DocumentsService', 'GetDocument')
    async getDocument(data: { id: string }) {
        try {
            this.logger.debug(`Récupération du document ${data.id}`);
            const document = await this.documentsService.findOne(data.id);
            return document;
        } catch (error) {
            this.logger.error(`Erreur get_document: ${error.message}`);
            throw new RpcException({
                code: 5, // NOT_FOUND
                message: error.message || 'Document non trouvé',
            });
        }
    }

    @GrpcMethod('DocumentsService', 'UpdateDocument')
    async updateDocument(data: { id: string } & UpdateDocumentDto) {
        try {
            const { id, ...updateData } = data;
            this.logger.log(`Modification du document ${id}`);
            const document = await this.documentsService.update(id, updateData);
            return document;
        } catch (error) {
            this.logger.error(`Erreur update_document: ${error.message}`);
            throw new RpcException({
                code: 13, // INTERNAL or INVALID_ARGUMENT
                message: error.message || 'Erreur lors de la modification du document',
            });
        }
    }

    @GrpcMethod('DocumentsService', 'DeleteDocument')
    async deleteDocument(data: { id: string }) {
        try {
            this.logger.warn(`Suppression du document ${data.id}`);
            await this.documentsService.remove(data.id);
            return {
                success: true,
                message: 'Document supprimé avec succès',
                code: 0,
            };
        } catch (error) {
            this.logger.error(`Erreur delete_document: ${error.message}`);
            throw new RpcException({
                code: 13, // INTERNAL
                message: error.message || 'Erreur lors de la suppression du document',
            });
        }
    }
}
