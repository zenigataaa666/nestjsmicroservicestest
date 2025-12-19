import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credential, CredentialType } from '../../auth/entities/credential.entity';
import { User } from '../../auth/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Role } from '../../auth/entities/role.entity';

const initialUsers = [
    {
        user: {
            username: 'admin',
            first_name: 'Admin',
            last_name: 'System',
            email: 'admin@system.local',
        },
        credentials: [
            {
                type: CredentialType.PASSWORD,
                identifier: 'admin',
                password: '12345!',
            },
        ],
    },
    // {
    //     user: {
    //         username: 'jdoe',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         email: 'jdoe@example.com',
    //     },
    //     credentials: [
    //         {
    //             type: CredentialType.PASSWORD,
    //             identifier: 'jdoe',
    //             password: 'password123',
    //         },
    //     ],
    // },
];

@Injectable()
export class CredentialsSeeder {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async run(): Promise<void> {
        console.log('--- Démarrage de l\'amorçage des identifiants (v2) ---');

        const userRepository = this.dataSource.getRepository(User);
        const credentialRepository = this.dataSource.getRepository(Credential);
        const roleRepository = this.dataSource.getRepository(Role);

        // Récupération du rôle admin
        const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            console.warn('⚠️ Rôle ADMIN non trouvé ! L\'utilisateur admin n\'aura pas de droits.');
        }

        for (const data of initialUsers) {
            // 1. Gestion de l'utilisateur
            let user = await userRepository.findOne({
                where: { username: data.user.username },
                relations: ['roles']
            });

            if (!user) {
                console.log(`👤 Création de l'utilisateur : ${data.user.username}`);
                const newUser = userRepository.create(data.user);

                // Assignation du rôle admin uniquement pour l'admin
                if (data.user.username === 'admin' && adminRole) {
                    newUser.roles = [adminRole];
                    console.log('👑 Rôle ADMIN assigné à l\'utilisateur');
                }

                user = await userRepository.save(newUser);
            } else {
                console.log(`➡️ Utilisateur existant : ${data.user.username}`);

                // Mise à jour si nécessaire pour s'assurer que l'admin a bien le rôle
                if (data.user.username === 'admin' && adminRole) {
                    const hasRole = user.roles.some(r => r.name === 'admin');
                    if (!hasRole) {
                        user.roles.push(adminRole);
                        await userRepository.save(user);
                        console.log('👑 Rôle ADMIN ajouté à l\'utilisateur existant');
                    }
                }
            }
            // ... (rest of the loop remains similar)

            // 2. Gestion des credentials pour cet utilisateur
            for (const credData of data.credentials) {
                const existingCred = await credentialRepository.findOne({
                    where: {
                        user_id: user.id,
                        type: credData.type,
                        identifier: credData.identifier,
                    },
                });

                if (!existingCred) {
                    console.log(`🔑 Création du credential [${credData.type}] pour : ${user.username}`);

                    const newCred = credentialRepository.create({
                        user: user,
                        type: credData.type,
                        identifier: credData.identifier,
                    });

                    if (credData.password) {
                        const salt = await bcrypt.genSalt();
                        newCred.password = await bcrypt.hash(credData.password, salt);
                    }

                    await credentialRepository.save(newCred);
                    console.log(`✅ Credential créé.`);
                } else {
                    console.log(`➡️ Credential existant [${credData.type}] pour : ${user.username}`);
                }
            }
        }

        console.log('--- Amorçage des identifiants terminé ---');
    }
}