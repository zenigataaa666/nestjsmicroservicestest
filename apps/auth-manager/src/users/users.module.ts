import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { Credential } from '../auth/entities/credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Credential])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
