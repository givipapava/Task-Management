import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('PORT', 3001);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );

  app.use(compression());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('RESTful API for managing tasks with priorities, categories, and statuses')
    .setVersion('1.0')
    .addTag('tasks', 'Task CRUD operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 Application is running in ${nodeEnv} mode`);
  logger.log(`🌐 Server is running on http://localhost:${port}`);
  logger.log(`📋 API available at http://localhost:${port}/api/tasks`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`💚 Health check available at http://localhost:${port}/health`);
  logger.log(`🔗 CORS enabled for origin: ${corsOrigin}`);
  logger.log(`🛡️  Security headers enabled (Helmet)`);
  logger.log(`⚡ Response compression enabled`);
  logger.log(`🚦 Rate limiting: 100 requests/minute per IP`);
  logger.log(`📦 Request size limit: 10MB`);
}

bootstrap();
