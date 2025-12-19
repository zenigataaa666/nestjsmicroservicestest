import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    host: process.env.MANAGE_EMPLOYEES_DB_HOST || 'localhost',
    port: parseInt(process.env.MANAGE_EMPLOYEES_DB_PORT || '3306', 10) || 3306,
    username: process.env.MANAGE_EMPLOYEES_DB_USERNAME || 'root',
    password: process.env.MANAGE_EMPLOYEES_DB_PASSWORD || '',
    database: process.env.MANAGE_EMPLOYEES_DB_DATABASE || 'manage_employees',
    synchronize: process.env.MANAGE_EMPLOYEES_DB_SYNCHRONIZE === 'true',
    logging: process.env.MANAGE_EMPLOYEES_DB_LOGGING === 'true',
}));