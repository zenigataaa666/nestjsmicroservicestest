import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { Credential, CredentialType } from '../auth/entities/credential.entity';

@Injectable()
export class UsersService {
    private readonly BCRYPT_ROUNDS = 10;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
    ) { }

    async create(data: {
        username: string;
        password?: string;
        first_name?: string;
        last_name: string;
        email?: string;
        phone?: string;
        role_ids?: string[];
        credential_type?: CredentialType;
    }) {
        const {
            username,
            password,
            first_name,
            last_name,
            email,
            phone,
            role_ids,
            credential_type = CredentialType.PASSWORD,
        } = data;

        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) throw new ConflictException(`Le nom d'utilisateur "${username}" existe déjà`);

        if (email) {
            const existingUserByEmail = await this.userRepository.findOne({ where: { email } });
            if (existingUserByEmail) throw new ConflictException(`L'email "${email}" est déjà utilisé`);
        }

        const user = this.userRepository.create({
            username,
            first_name: first_name || null,
            last_name,
            email: email || null,
            phone: phone || null,
            is_active: true,
        });

        if (role_ids && role_ids.length > 0) {
            user.roles = await this.roleRepository.findBy({ id: In(role_ids) });
        } else {
            const defaultRole = await this.roleRepository.findOne({ where: { name: 'user' } });
            if (defaultRole) user.roles = [defaultRole];
        }

        const savedUser = await this.userRepository.save(user);

        if (credential_type === CredentialType.PASSWORD) {
            if (!password) throw new Error('Le mot de passe est requis pour le type PASSWORD');
            const hashedPassword = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
            const credential = this.credentialRepository.create({
                user_id: savedUser.id,
                type: CredentialType.PASSWORD,
                identifier: username,
                password: hashedPassword,
                is_active: true,
            });
            await this.credentialRepository.save(credential);
        } else if (credential_type === CredentialType.LDAP) {
            const credential = this.credentialRepository.create({
                user_id: savedUser.id,
                type: CredentialType.LDAP,
                identifier: username,
                password: null,
                is_active: true,
            });
            await this.credentialRepository.save(credential);
        }

        return this.findOne(savedUser.id);
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) throw new NotFoundException(`Utilisateur #${id} non trouvé`);

        return user;
    }

    async findAll(pagination: { page: number; limit: number; search?: string; sort_by?: string; sort_order?: string }) {
        const { page = 1, limit = 10, search } = pagination;
        const sort_by = pagination.sort_by || 'created_at';
        const sort_order = pagination.sort_order || 'DESC';
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'roles')
            .leftJoinAndSelect('roles.permissions', 'permissions')
            .skip(skip)
            .take(limit)
            .orderBy(`user.${sort_by}`, (sort_order || 'DESC').toUpperCase() as 'ASC' | 'DESC');

        if (search) {
            queryBuilder.where('user.username LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
        }

        const [users, total] = await queryBuilder.getManyAndCount();

        return {
            users,
            meta: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit)
            }
        };
    }

    async updateRoles(userId: string, roleIds: string[]) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`Utilisateur #${userId} non trouvé`);

        user.roles = await this.roleRepository.findBy({ id: In(roleIds) });
        await this.userRepository.save(user);

        return this.findOne(userId);
    }

    async getPermissions(userId: string) {
        const user = await this.findOne(userId);
        return user.getPermissions();
    }
}
