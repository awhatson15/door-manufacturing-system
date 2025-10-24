const express = require('express');
const { ConfigService } = require('@nestjs/config');
const { NestFactory } = require('@nestjs/core');

async function bootstrap() {
  // Создаем простое Express приложение
  const app = express();

  // Базовая конфигурация
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // API префикс
  app.setGlobalPrefix('api');

  // Простой health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Простой API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Door Manufacturing System API',
      version: '1.0.0',
      description: 'API для системы учёта заявок на производство металлических дверей',
      endpoints: {
        health: '/api/health',
        docs: '/api/docs (в development режиме)',
      },
    });
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`📚 API info: http://localhost:${port}/api`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
