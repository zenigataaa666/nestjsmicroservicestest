import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { DocumentsModule } from './documents/documents.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MANAGE_EMPLOYEES_DB_HOST'),
        port: configService.get('MANAGE_EMPLOYEES_DB_PORT'),
        username: configService.get('MANAGE_EMPLOYEES_DB_USERNAME'),
        password: configService.get('MANAGE_EMPLOYEES_DB_PASSWORD'),
        database: configService.get('MANAGE_EMPLOYEES_DB_DATABASE'),


        // Auto-chargement des entités
        autoLoadEntities: true,
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],

        // CRITIQUE: false en production pour éviter la perte de données
        synchronize: true, // IMPORTANT: false en production

        // Logs SQL en développement uniquement
        logging: configService.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],

        // // Options de pool de connexions
        // extra: {
        //     connectionLimit: 10,        // Max 10 connexions simultanées
        //     connectTimeout: 60000,      // Timeout connexion: 60s
        //     acquireTimeout: 60000,      // Timeout acquisition: 60s
        //     timeout: 60000,             // Timeout requête: 60s
        // },

        // // Retry automatique en cas d'erreur de connexion
        // retryAttempts: 3,
        // retryDelay: 3000,

        // // Charset UTF-8 pour support caractères internationaux
        // charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    DepartmentsModule,
    EmployeesModule,
    DocumentsModule,
  ],
})
export class AppModule { }