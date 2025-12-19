import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DashboardGatewayController } from './dashboard-gateway.controller';
import { DashboardGatewayService } from './dashboard-gateway.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        ClientsModule.register([
            {
                name: 'AUTH_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    package: 'auth',
                    protoPath: join(__dirname, '../../../proto/auth.proto'),
                    url: 'localhost:50051', // Auth Manager URL
                },
            },
        ]),
    ],
    controllers: [DashboardGatewayController],
    providers: [DashboardGatewayService],
})
export class DashboardGatewayModule { }
