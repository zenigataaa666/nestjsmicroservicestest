import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    host: process.env.EMPLOYEES_DB_HOST || 'localhost',
    port: parseInt(process.env.EMPLOYEES_DB_PORT || '3306', 10) || 3306,
    username: process.env.EMPLOYEES_DB_USERNAME || 'root',
    password: process.env.EMPLOYEES_DB_PASSWORD || '',
    database: process.env.EMPLOYEES_DB_DATABASE || 'manage_employees',
    synchronize: process.env.EMPLOYEES_DB_SYNCHRONIZE === 'true',
    logging: process.env.EMPLOYEES_DB_LOGGING === 'true',
}));