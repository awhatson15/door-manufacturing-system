import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

@Injectable()
export class HealthCheckService {
  private redisClient: Redis.RedisClientType;

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    // Initialize Redis client
    this.redisClient = Redis.createClient({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get('REDIS_PORT') || '6379'),
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('Redis сервер недоступен');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Лимит времени повторных попыток превышен');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });
  }

  async checkDatabaseHealth(): Promise<{ status: string; responseTime?: number; error?: string }> {
    const startTime = Date.now();

    try {
      await this.connection.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка базы данных',
      };
    }
  }

  async checkRedisHealth(): Promise<{ status: string; responseTime?: number; error?: string }> {
    const startTime = Date.now();

    try {
      await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка Redis',
      };
    }
  }

  async checkSystemHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    services: {
      database: { status: string; responseTime?: number; error?: string };
      redis: { status: string; responseTime?: number; error?: string };
    };
  }> {
    const [dbHealth, redisHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
    ]);

    const isHealthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
    };
  }
}

// Simple health check for Docker health check
if (require.main === module) {
  const { ConfigService } = require('@nestjs/config');
  const { TypeOrmModule } = require('@nestjs/typeorm');

  const configService = new ConfigService();
  const healthService = new HealthCheckService(null, configService);

  healthService.checkSystemHealth()
    .then(result => {
      if (result.status === 'healthy') {
        console.log('Health check passed');
        process.exit(0);
      } else {
        console.error('Health check failed:', result);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Health check error:', error);
      process.exit(1);
    });
}
