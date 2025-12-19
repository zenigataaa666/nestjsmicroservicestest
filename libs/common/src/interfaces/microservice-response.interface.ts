export interface MicroserviceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MessagePatternPayload<T = any> {
    data: T;
    user?: UserPayload;
}

export interface UserPayload {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
}