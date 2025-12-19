import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Credential } from '../credentials/entities/credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Credential])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
