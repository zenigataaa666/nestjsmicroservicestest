import { MicroserviceResponse, PaginatedResponse } from '../interfaces/microservice-response.interface';

export class ResponseUtil {
    static success<T>(data: T, message?: string): MicroserviceResponse<T> {
        return {
            success: true,
            data,
            message,
        };
    }

    static error(error: string): MicroserviceResponse {
        return {
            success: false,
            error,
        };
    }

    static paginated<T>(
        data: T[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedResponse<T> {
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}