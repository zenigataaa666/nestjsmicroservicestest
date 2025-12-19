import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential, CredentialType } from './entities/credential.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
    constructor(
        @InjectRepository(Credential)
        private readonly credentialRepository: Repository<Credential>,
    ) { }

    /**
     * Crée un nouveau credential pour un utilisateur
     */
    async create(data: {
        user_id: string;
        identifier: string;
        password?: string;
        type: CredentialType;
    }) {
        let passwordHash: string | null = null;

        if (data.type === CredentialType.PASSWORD) {
            if (!data.password) throw new Error('Password required for PASSWORD credential type');
            passwordHash = await bcrypt.hash(data.password, 10);
        } else if (data.type === CredentialType.API_KEY) {
            // Logic for API Key generation if needed
            // const apiKey = crypto.randomBytes(32).toString('hex');
            // passwordHash = apiKey; // Or hash it
        }

        const credential = this.credentialRepository.create({
            user_id: data.user_id,
            identifier: data.identifier,
            type: data.type,
            password: passwordHash,
            is_active: true
        });

        return this.credentialRepository.save(credential);
    }

    /**
     * Vérifie un credential (mot de passe)
     */
    async verifyPassword(identifier: string, password: string): Promise<Credential | null> {
        const credential = await this.credentialRepository.findOne({
            where: { identifier, type: CredentialType.PASSWORD },
            select: ['id', 'user_id', 'password', 'is_active', 'type', 'identifier', 'last_login_at'] // Password is hidden by default
        });

        if (!credential || !credential.is_active || !credential.password) {
            return null;
        }

        const isMatch = await bcrypt.compare(password, credential.password);
        if (!isMatch) return null;

        return credential;
    }

    async updateLastLogin(id: string) {
        await this.credentialRepository.update(id, { last_login_at: new Date() });
    }

    async findByUserId(userId: string) {
        return this.credentialRepository.find({ where: { user_id: userId } });
    }
}
