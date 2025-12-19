import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: true,
  });

  const configService = app.get(ConfigService);

  // ==================== SÉCURITÉ ====================

  // Helmet pour sécuriser les headers HTTP
  app.use(helmet({
    contentSecurityPolicy: configService.get('NODE_ENV') === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuré
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ==================== PERFORMANCE ====================

  // Compression des réponses
  app.use(compression());

  // ==================== VALIDATION ====================

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme automatiquement les types
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production', // Masque les détails en prod
    }),
  );

  // ==================== VERSIONING ====================

  // Versioning de l'API
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // ==================== PREFIX GLOBAL ====================

  // Préfixe global (facultatif si vous utilisez déjà /api/v1 dans les routes)
  // app.setGlobalPrefix('api');

  // ==================== DOCUMENTATION SWAGGER ====================

  const config = new DocumentBuilder()
    .setTitle('Microservices API Gateway')
    .setDescription(`
      API Gateway centralisée pour l'architecture microservices.
      
      ## Authentification
      Utilisez l'endpoint /api/v1/auth/login pour obtenir un token JWT.
      Ensuite, incluez le token dans le header Authorization: Bearer <token>
      
      ## Services disponibles
      - **Auth**: Authentification et gestion des utilisateurs
      - **Employees**: Gestion des employés et départements
      - **Events**: Gestion des événements (à venir)
      - **Catalog**: Gestion du patrimoine (à venir)
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints d\'authentification et gestion de session')
    .addTag('Employees Management', 'Gestion des employés')
    .addTag('Departments', 'Gestion des départements')
    .addTag('Health Check', 'Vérification de l\'état du service')
    .addServer('http://localhost:3000', 'Serveur de développement')
    .addServer('https://api.votre-domaine.com', 'Serveur de production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Gateway Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // ==================== DÉMARRAGE ====================

  const port = configService.get('PORT', 3000);
  const host = configService.get('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 API Gateway démarrée avec succès !                  ║
  ║                                                           ║
  ║   🌍 URL: http://${host}:${port}                         ║
  ║   📚 Documentation: http://${host}:${port}/api/docs       ║
  ║   🏥 Health Check: http://${host}:${port}/api/v1/health          ║
  ║                                                           ║
  ║   Environment: ${configService.get('NODE_ENV', 'development').toUpperCase().padEnd(20)}║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('❌ Erreur critique au démarrage:', err);
  process.exit(1);
});