import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
