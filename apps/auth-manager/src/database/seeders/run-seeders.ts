import { NestFactory } from '@nestjs/core';
import { CredentialsSeeder } from './credentials.seeder';
import { SeederModule } from './seeder.module';
import { RolesSeeder } from './roles.seeder';

async function bootstrap() {
    // Créer un application context pour avoir accès à l'injection de dépendances
    const app = await NestFactory.createApplicationContext(SeederModule);

    try {
        // Récupérer les seeders via le conteneur d'injection de dépendances
        const rolesSeeder = app.get(RolesSeeder);
        const credentialsSeeder = app.get(CredentialsSeeder);

        // Exécuter les Seeders (ORDRE IMPORTANT)
        await rolesSeeder.run();
        await credentialsSeeder.run();

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