import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Límites de payload (protección OWASP contra payloads excesivos)
  app.use(json({ limit: '50kb' }));
  app.use(urlencoded({ extended: true, limit: '50kb' }));

  // Cabeceras de seguridad HTTP (OWASP / Mozilla Observatory)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'deny' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
    }),
  );

  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: frontendUrl.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('QuickPay Checkout Store API')
    .setDescription(
      'REST API built with Hexagonal Architecture and Railway Oriented Programming',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(configService.get('PORT', 3000));
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://0.0.0.0:${port}/api`);
  console.log(`Swagger docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();