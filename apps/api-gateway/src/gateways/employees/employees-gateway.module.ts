import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmployeesGatewayController } from './employees-gateway.controller';
import { DepartmentsGatewayController } from './departments-gateway.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        ClientsModule.registerAsync([
            {
                name: 'EMPLOYEES_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'employees',
                        protoPath: join(__dirname, '../../../proto/employees.proto'),
                        url: configService.get('EMPLOYEES_GRPC_URL', 'localhost:50052'),
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
})
export class EmployeesGatewayModule { }