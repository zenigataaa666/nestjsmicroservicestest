import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(TypeOrmExceptionFilter.name);

    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Database error occurred';

        // Gérer les erreurs MySQL spécifiques
        const error = exception as any;

        switch (error.code) {
            case 'ER_DUP_ENTRY':
                status = HttpStatus.CONFLICT;
                message = 'Duplicate entry. Record already exists.';
                break;
            case 'ER_NO_REFERENCED_ROW':
            case 'ER_NO_REFERENCED_ROW_2':
                status = HttpStatus.BAD_REQUEST;
                message = 'Referenced record does not exist.';
                break;
            case 'ER_ROW_IS_REFERENCED':
            case 'ER_ROW_IS_REFERENCED_2':
                status = HttpStatus.CONFLICT;
                message = 'Cannot delete record. It is referenced by other records.';
                break;
            case 'ER_DATA_TOO_LONG':
                status = HttpStatus.BAD_REQUEST;
                message = 'Data too long for column.';
                break;
            default:
                this.logger.error(
                    `Unhandled database error: ${error.code}`,
                    exception.stack,
                );
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}