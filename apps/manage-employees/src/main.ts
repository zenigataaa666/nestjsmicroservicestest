import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('ManageEmployees');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // ==================== SÉCURITÉ ====================
  app.use(helmet());
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // ==================== PERFORMANCE ====================
  app.use(compression());

  // ==================== CONFIGURATION MICROSERVICE GRPC ====================
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'manage_employees',
      protoPath: join(__dirname, '../../../proto/manage-employees.proto'),
      url: '0.0.0.0:50052',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
      },
    },
  });

  // ==================== VALIDATION ====================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==================== VERSIONING ====================
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // ==================== DOCUMENTATION SWAGGER ====================
  const config = new DocumentBuilder()
    .setTitle('Manage Employees Microservice')
    .setDescription('Microservice de gestion des employés et départements')
    .setVersion('1.0')
    .addTag('Employees', 'Gestion des employés')
    .addTag('Departments', 'Gestion des départements')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ==================== DÉMARRAGE ====================
  await app.startAllMicroservices();

  const grpcPort = configService.get('EMPLOYEES_GRPC_PORT', 50052);
  const httpPort = configService.get('EMPLOYEES_PORT', 3002);
  const host = configService.get('HOST', '0.0.0.0');

  await app.listen(httpPort, host);

  logger.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Manage Employees Service démarré !                  ║
  ║                                                           ║
  ║   📡 gRPC: 0.0.0.0:${grpcPort}                           ║
  ║   🌍 HTTP: http://${host}:${httpPort}                       ║
  ║   📚 Docs: http://${host}:${httpPort}/api/docs              ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('❌ Erreur critique au démarrage:', err);
  process.exit(1);
});