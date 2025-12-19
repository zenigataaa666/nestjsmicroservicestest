import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('EMPLOYEES_DB_HOST'),
        port: configService.get('EMPLOYEES_DB_PORT'),
        username: configService.get('EMPLOYEES_DB_USERNAME'),
        password: configService.get('EMPLOYEES_DB_PASSWORD'),
        database: configService.get('EMPLOYEES_DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('EMPLOYEES_DB_SYNCHRONIZE'),
        logging: configService.get('EMPLOYEES_DB_LOGGING'),
        timezone: '+01:00',
        charset: 'utf8mb4',
        extra: {
          connectionLimit: 10,
        },
      }),
      inject: [ConfigService],
    }),
    EmployeesModule,
    DepartmentsModule,
  ],
})
export class AppModule { }