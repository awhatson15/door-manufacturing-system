import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USER') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_NAME') || 'door_manufacturing',
        entities: [
          join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
          join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
        ],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        migrations: [
          join(__dirname, 'migrations', '*{.ts,.js}'),
        ],
        migrationsRun: true,
        cli: {
          migrationsDir: 'src/database/migrations',
        },
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  constructor(private readonly configService: ConfigService) {}

  getTypeOrmOptions() {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST') || 'localhost',
      port: parseInt(this.configService.get('DB_PORT', '5432')),
      username: this.configService.get('DB_USER') || 'postgres',
      password: this.configService.get('DB_PASSWORD') || 'postgres',
      database: this.configService.get('DB_NAME') || 'door_manufacturing',
      entities: [
        join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
        join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
      ],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      migrations: [
        join(__dirname, 'migrations', '*{.ts,.js}'),
      ],
      migrationsRun: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
}
