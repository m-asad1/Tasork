import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);

  // --- Security hardening (docs/14_Security.md) ---------------------------
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());
  app.enableCors({
    origin: config.get<string>('appUrl'),
    credentials: true,
  });

  // --- Global validation ---------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not defined in the DTO
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('', { exclude: ['/health'] });

  // --- Swagger / OpenAPI (Deliverable 48) -----------------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tasork API')
    .setDescription('REST + WebSocket API for the Tasork platform. See /docs/13_API_Planning.md for the full endpoint plan.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Registration, login, tokens, and password/email flows')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Tasork API running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
