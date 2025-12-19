import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ManageEmployeesGatewayModule } from './gateways/manage-employees/manage-employees-gateway.module';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HealthController } from './health/health.controller';
import { AuthManagerGatewayModule } from './gateways/auth-manager/auth-manager-gateway.module';

@Module({
    imports: [
        // Configuration globale
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            cache: true,
        }),

        // Rate limiting (protection DDoS)
        ThrottlerModule.forRoot([{
            ttl: 60000, // 60 secondes
            limit: 100, // 100 requêtes max par minute
        }]),

        // Modules métier
        AuthModule,

        // Ajouter ici les autres modules gateway au fur et à mesure
        AuthManagerGatewayModule,
        ManageEmployeesGatewayModule,
        // EventsGatewayModule,
        // CatalogGatewayModule,
    ],
    controllers: [HealthController],
    providers: [
        // Rate limiting global
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        // Logging global
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        // Gestion globale des exceptions
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule { }