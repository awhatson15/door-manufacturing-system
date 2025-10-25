import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Middleware для логирования всех запросов (в самом начале)
  app.use((req, res, next) => {
    console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
    console.log(`- Full URL: ${req.protocol}://${req.get('host')}${req.url}`);
    console.log(`- Origin: ${req.headers.origin}`);
    console.log(`- Referer: ${req.headers.referer}`);
    console.log(`- User-Agent: ${req.headers['user-agent']}`);
    console.log(`- IP: ${req.ip}`);
    console.log(`- X-Forwarded-For: ${req.headers['x-forwarded-for']}`);
    console.log(`- Host: ${req.headers.host}`);
    next();
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  
  // Логирование информации о CORS для диагностики
  console.log('🔍 CORS Configuration:');
  console.log(`- NODE_ENV: ${configService.get('NODE_ENV')}`);
  console.log(`- FRONTEND_URL: ${configService.get('FRONTEND_URL')}`);
  console.log(`- isDevelopment: ${isDevelopment}`);
  
  const corsOptions = {
    origin: isDevelopment ? true : [
      configService.get('FRONTEND_URL') || 'http://localhost:3001',
      'http://localhost:3001',
      'http://localhost:3000',
      'http://backend:3000',
      'http://127.0.0.1:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  console.log('- CORS Options:', JSON.stringify(corsOptions, null, 2));
  
  app.enableCors(corsOptions);

  // API prefix
  app.setGlobalPrefix('api');


  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Door Manufacturing System API')
      .setDescription('API для системы учёта заявок на производство металлических дверей')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth')
      .addTag('users')
      .addTag('customers')
      .addTag('orders')
      .addTag('stages')
      .addTag('files')
      .addTag('comments')
      .addTag('notifications')
      .addTag('history')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
