import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmployeesGatewayController } from './employees-gateway.controller';
import { DepartmentsGatewayController } from './departments-gateway.controller';
import { EmployeesGatewayService } from './employees-gateway.service';
import { DepartmentsGatewayService } from './departments-gateway.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        ClientsModule.registerAsync([
            {
                name: 'MANAGER_EMPLOYEES_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'manage_employees',
                        protoPath: join(__dirname, '../../../proto/manage-employees.proto'),
                        url: configService.get('MANAGE_EMPLOYEES_GRPC_URL', 'localhost:50052'),
                        loader: {
                            keepCase: true,
                            longs: String,
                            enums: String,
                            defaults: true,
                            oneofs: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [EmployeesGatewayController, DepartmentsGatewayController],
    providers: [EmployeesGatewayService, DepartmentsGatewayService],
    exports: [EmployeesGatewayService, DepartmentsGatewayService],
})
export class ManageEmployeesGatewayModule { }