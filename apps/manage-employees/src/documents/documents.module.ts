import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Document]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                // Parse limit string (e.g. "10MB") to bytes
                const limitStr = configService.get<string>('MANAGE_EMPLOYEES_UPLOAD_LIMIT', '10MB');
                const limitMatch = limitStr.match(/^(\d+)(MB|KB|B)?$/);
                let fileSize = 10 * 1024 * 1024; // Default 10MB

                if (limitMatch) {
                    const value = parseInt(limitMatch[1], 10);
                    const unit = limitMatch[2];
                    if (unit === 'MB') fileSize = value * 1024 * 1024;
                    else if (unit === 'KB') fileSize = value * 1024;
                    else fileSize = value;
                }

                return {
                    storage: diskStorage({
                        destination: configService.get<string>('MANAGE_EMPLOYEES_UPLOAD_FOLDER') || './uploads',
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                        },
                    }),
                    limits: {
                        fileSize: fileSize,
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
