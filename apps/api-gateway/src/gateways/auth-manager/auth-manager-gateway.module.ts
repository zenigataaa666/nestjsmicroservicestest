import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UsersGatewayController } from './users-gateway.controller';
import { RolesGatewayController } from './roles-gateway.controller';
import { PermissionsGatewayController } from './permissions-gateway.controller';
import { UsersGatewayService } from './users-gateway.service'; // We might need a service wrapper or use clients directly in controllers, but better to use a service.
import { AuthDashboardService } from './auth-dashboard.service';
import { AuthDashboardController } from './auth-dashboard.controller';
import { PermissionsGatewayService } from './permissions-gateway.service';
import { RolesGatewayService } from './roles-gateway.service';
// Actually, let's keep it simple and inject clients directly into controllers or create a dedicated service. 
// Given the previous pattern used AuthService, let's create a UsersGatewayService to wrap gRPC calls.

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_MANAGER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth_manager',
            protoPath: join(__dirname, '../../../proto/auth-manager.proto'),
            url: configService.get('AUTH_GRPC_URL', '0.0.0.0:50051'),
            loader: { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    UsersGatewayController,
    RolesGatewayController,
    AuthDashboardController,
    PermissionsGatewayController
  ],
  providers: [UsersGatewayService, AuthDashboardService, PermissionsGatewayService, RolesGatewayService],
  exports: [UsersGatewayService, AuthDashboardService, PermissionsGatewayService, RolesGatewayService],
})
export class AuthManagerGatewayModule { }
