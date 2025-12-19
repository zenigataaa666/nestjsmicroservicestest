J'ai compris votre demande. Vous souhaitez centraliser et simplifier votre processus de *seeding* pour n'initialiser que les permissions de gestion, le rôle **`admin`**, et le premier utilisateur **`admin`** en vous basant sur les identifiants sémantiques (les champs `name`).

Voici le code pour tous les fichiers de *seeding* mis à jour :

-----

## 1\. Création et Mise à Jour des Seeders

Nous allons créer `permissions.seeder.ts`, `roles.seeder.ts`, `users.seeder.ts` et vérifier `credentials.seeder.ts`.

### `src/database/seeders/permissions.seeder.ts`

Ce seeder insère uniquement les permissions de gestion. Nous utilisons le champ `name` pour l'unicité et la recherche.

```typescript
import { DataSource } from 'typeorm';
import { Permission } from '../../auth/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

// Permissions de gestion simplifiées
const initialPermissions = [
    { name: 'employees.manage', resource: 'employees', action: 'manage', description: 'Gestion complète des employés' },
    { name: 'departments.manage', resource: 'departments', action: 'manage', description: 'Gestion complète des départements' },
    { name: 'events.manage', resource: 'events', action: 'manage', description: 'Gestion complète des événements' },
    { name: 'assets.manage', resource: 'assets', action: 'manage', description: 'Gestion complète du catalogue' },
    { name: 'users.manage', resource: 'users', action: 'manage', description: 'Gestion complète des utilisateurs (Auth)' },
    { name: 'system.admin', resource: 'system', action: 'admin', description: 'Administration système complète' },
];

@Injectable()
export class PermissionsSeeder {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async run(): Promise<void> {
        console.log('--- Démarrage de l\'amorçage des permissions ---');

        const permissionRepository = this.dataSource.getRepository(Permission);

        for (const permData of initialPermissions) {
            const existingPerm = await permissionRepository.findOne({ where: { name: permData.name } });

            if (!existingPerm) {
                // L'ID est généré automatiquement (UUID)
                await permissionRepository.save(permissionRepository.create(permData));
                console.log(`✅ Permission créée : ${permData.name}`);
            } else {
                console.log(`➡️ Permission ignorée (existe déjà) : ${permData.name}`);
            }
        }

        console.log('--- Amorçage des permissions terminé ---');
    }
}
```

### `src/database/seeders/roles.seeder.ts`

Ce seeder crée le rôle **`admin`** et l'associe à toutes les permissions créées précédemment.

```typescript
import { DataSource } from 'typeorm';
import { Role } from '../../auth/entities/role.entity';
import { Permission } from '../../auth/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

const initialRoles = [
    {
        name: 'admin',
        description: 'Administrateur système - Accès complet aux ressources de gestion',
        permissionsNames: [
            'employees.manage',
            'departments.manage',
            'events.manage',
            'assets.manage',
            'users.manage',
            'system.admin',
        ]
    }
];

@Injectable()
export class RolesSeeder {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async run(): Promise<void> {
        console.log('--- Démarrage de l\'amorçage des rôles ---');

        const roleRepository = this.dataSource.getRepository(Role);
        const permissionRepository = this.dataSource.getRepository(Permission);

        for (const roleData of initialRoles) {
            let existingRole = await roleRepository.findOne({ where: { name: roleData.name } });

            if (!existingRole) {
                // 1. Récupérer toutes les entités Permission basées sur leur nom
                const permissions = await permissionRepository.find({
                    where: roleData.permissionsNames.map(name => ({ name })),
                });

                // 2. Créer le rôle et lui assigner les permissions
                const newRole = roleRepository.create({
                    name: roleData.name,
                    description: roleData.description,
                    permissions: permissions, // Association ManyToMany
                });

                await roleRepository.save(newRole);
                console.log(`✅ Rôle créé : ${roleData.name} avec ${permissions.length} permissions`);
            } else {
                console.log(`➡️ Rôle ignoré (existe déjà) : ${roleData.name}`);
            }
        }

        console.log('--- Amorçage des rôles terminé ---');
    }
}
```

### `src/database/seeders/credentials.seeder.ts`

Ce seeder est conservé pour créer l'identifiant **`admin`** avec le mot de passe hashé.

```typescript
// Le contenu reste inchangé par rapport à la version que vous avez fournie
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Credential } from '../../auth/entities/credential.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

// Définir la structure des données à insérer
const initialCredentials = [
    {
        username: 'admin',
        password: 'Password123!'
    },
];

// Rendre le seeder injectable pour pouvoir utiliser l'injection de dépendances
@Injectable()
export class CredentialsSeeder {
    // Injecter le Repository de Credential
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,

    ) { }

    public async run(): Promise<void> {
        // ... (Logique de création du credential admin)
        console.log('--- Démarrage de l\'amorçage des identifiants ---'); //

        const credentialRepository = this.dataSource.getRepository(Credential);

        for (const credentialData of initialCredentials) {
            // 1. Vérifier si l'utilisateur existe déjà
            const existingCredential = await credentialRepository.findOne({
                where: { username: credentialData.username }
            });

            if (!existingCredential) {
                // 2. Hacher le mot de passe avant l'insertion
                const salt = await bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(credentialData.password, salt);

                // 3. Créer et sauvegarder l'entité
                const newCredential = credentialRepository.create({
                    username: credentialData.username,
                    password: passwordHash,
                });

                await credentialRepository.save(newCredential);
                console.log(`✅ Identifiant créé : ${credentialData.username}`);
            } else {
                console.log(`➡️ Identifiant ignoré (existe déjà) : ${credentialData.username}`);
            }
        }

        console.log('--- Amorçage des identifiants terminé ---');
    }
}
```

### `src/database/seeders/users.seeder.ts`

Ce seeder crée l'utilisateur **`admin`** et établit la liaison entre le `User`, le `Credential` et le `Role`.

```typescript
import { DataSource } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Role } from '../../auth/entities/role.entity';
import { Credential } from '../../auth/entities/credential.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

const initialUsers = [
    {
        username: 'admin',
        first_name: 'System', 
        last_name: 'Administrator', 
        email: 'admin@localhost.local',
        roleName: 'admin',
    },
];

@Injectable()
export class UsersSeeder {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async run(): Promise<void> {
        console.log('--- Démarrage de l\'amorçage des utilisateurs ---');

        const userRepository = this.dataSource.getRepository(User);
        const roleRepository = this.dataSource.getRepository(Role);
        const credentialRepository = this.dataSource.getRepository(Credential);

        for (const userData of initialUsers) {
            let existingUser = await userRepository.findOne({ where: { username: userData.username } });

            if (!existingUser) {
                // 1. Trouver le Credential ('admin')
                const credential = await credentialRepository.findOne({
                    where: { username: userData.username }
                });
                if (!credential) {
                    console.error(`❌ ERREUR: Credential '${userData.username}' introuvable.`);
                    continue;
                }

                // 2. Trouver le Rôle 'admin'
                const role = await roleRepository.findOne({
                    where: { name: userData.roleName },
                });
                if (!role) {
                    console.error(`❌ ERREUR: Rôle '${userData.roleName}' introuvable.`);
                    continue;
                }

                // 3. Créer l'entité User (lie au Credential et au Rôle)
                const newUser = userRepository.create({
                    username: userData.username,
                    first_name: userData.first_name, 
                    last_name: userData.last_name,
                    email: userData.email,
                    credential_id: credential.id, // Lien direct ManyToOne
                    roles: [role], // Lien ManyToMany
                });

                const savedUser = await userRepository.save(newUser);

                // 4. Mettre à jour le Credential pour lier l'utilisateur (lien inverse OneToMany)
                credential.user_id = savedUser.id; 
                await credentialRepository.save(credential);

                console.log(`✅ Utilisateur créé : ${userData.username} et lié à son Credential/Rôle`);
            } else {
                console.log(`➡️ Utilisateur ignoré (existe déjà) : ${userData.username}`);
            }
        }

        console.log('--- Amorçage des utilisateurs terminé ---');
    }
}
```

-----

## 2\. Mise à Jour de l'Orchestration

### `src/app.module.ts`

Ajout des nouveaux seeders à la liste des `providers`.

```typescript
// src/app.module.ts

// ... (imports existants)
import { CredentialsSeeder } from './database/seeders/credentials.seeder';
import { PermissionsSeeder } from './database/seeders/permissions.seeder'; // NOUVEAU
import { RolesSeeder } from './database/seeders/roles.seeder'; // NOUVEAU
import { UsersSeeder } from './database/seeders/users.seeder'; // NOUVEAU
// ... (reste des imports)

@Module({
    imports: [
        // ... (ConfigModule)
        // ... (TypeOrmModule)
        // ... (AuthModule)
    ],
    controllers: [HealthController],
    providers: [
        CredentialsSeeder, // Existant
        PermissionsSeeder, // NOUVEAU
        RolesSeeder,       // NOUVEAU
        UsersSeeder,       // NOUVEAU
    ],
})
export class AppModule { }
```

### `src/database/seeders/run-seeders.ts`

Mise à jour pour importer et exécuter les quatre seeders dans l'ordre de dépendance : **Permissions** ➡️ **Rôles** ➡️ **Credentials** ➡️ **Users**.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

// Importer tous les seeders
import { PermissionsSeeder } from './permissions.seeder'; 
import { RolesSeeder } from './roles.seeder';           
import { CredentialsSeeder } from './credentials.seeder'; 
import { UsersSeeder } from './users.seeder';           

async function bootstrap() {
    // Créer un application context pour avoir accès à l'injection de dépendances
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        console.log('--- Démarrage de l\'orchestration des seeders ---');

        // Récupérer les seeders via le conteneur d'injection de dépendances
        const permissionsSeeder = app.get(PermissionsSeeder);
        const rolesSeeder = app.get(RolesSeeder);
        const credentialsSeeder = app.get(CredentialsSeeder);
        const usersSeeder = app.get(UsersSeeder);

        // Exécuter dans l'ordre de dépendance:
        // 1. Permissions (doivent exister avant les Rôles)
        await permissionsSeeder.run();
        // 2. Rôles (doivent exister avant l'Utilisateur)
        await rolesSeeder.run();
        // 3. Credentials (doivent exister avant l'Utilisateur)
        await credentialsSeeder.run();
        // 4. Users (lie tout ensemble)
        await usersSeeder.run();

        console.log('🎉 Tous les seeders se sont exécutés avec succès !');

    } catch (error) {
        console.error('❌ Échec de l\'exécution des seeders', error);
        process.exit(1);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
```