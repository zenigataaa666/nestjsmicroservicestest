import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Une erreur interne est survenue';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                error = (exceptionResponse as any).error || error;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Erreur non gérée: ${exception.message}`, exception.stack);
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error,
            message: Array.isArray(message) ? message : [message],
        };

        // Log les erreurs serveur
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} ${status}`,
                JSON.stringify(errorResponse),
            );
        } else if (status >= 400) {
            this.logger.warn(
                `${request.method} ${request.url} ${status} - ${message}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
