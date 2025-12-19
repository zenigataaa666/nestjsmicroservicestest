import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('AuthManager-gRPC');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    const configService = app.get(ConfigService);

    // Chemin absolu vers le fichier proto
    const protoPath = join(__dirname, '../../../proto/auth.proto'); // pour dist on revient une fois
    logger.log(`📄 Chemin proto: ${protoPath}`);

    // Configuration gRPC
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: protoPath,
        url: `${configService.get('AUTH_GRPC_URL', '0.0.0.0:50051')}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: configService.get('NODE_ENV') === 'production',
      }),
    );

    await app.startAllMicroservices();
    logger.log(`🔐 AuthManager gRPC démarré sur le port ${configService.get('AUTH_GRPC_PORT', 50051)}`);

    // ==================== DÉMARRAGE ====================

    const port = configService.get('AUTH_PORT', 3001);
    const host = configService.get('AUTH_HOST', '0.0.0.0');

    await app.listen(port, host);

    logger.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔐 AuthManager démarré avec succès !                   ║
║                                                           ║
║   📡 gRPC: 0.0.0.0:${configService.get('AUTH_GRPC_PORT', 50051).toString().padEnd(20)}           ║
║   🏥 Health Check: http://${host}:${port}/health         ║
║   🌍 Environment: ${configService.get('NODE_ENV', 'development').toUpperCase().padEnd(20)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    logger.error('❌ Erreur critique au démarrage:', error);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap();