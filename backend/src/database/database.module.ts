import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';

        return {
          type: 'postgres' as const,
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USER') || 'postgres',
          password: configService.get('DB_PASSWORD') || 'postgres',
          database: configService.get('DB_NAME') || 'door_manufacturing',
          entities: [
            join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
            join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
          ],
          synchronize: !isProduction,
          logging: !isProduction,
          migrations: [
            join(__dirname, 'migrations', '*{.ts,.js}'),
          ],
          migrationsRun: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  constructor(private readonly configService: ConfigService) {}

  getTypeOrmOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      type: 'postgres' as const,
      host: this.configService.get('DB_HOST') || 'localhost',
      port: parseInt(this.configService.get('DB_PORT', '5432')),
      username: this.configService.get('DB_USER') || 'postgres',
      password: this.configService.get('DB_PASSWORD') || 'postgres',
      database: this.configService.get('DB_NAME') || 'door_manufacturing',
      entities: [
        join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
        join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
      ],
      synchronize: !isProduction,
      logging: !isProduction,
      migrations: [
        join(__dirname, 'migrations', '*{.ts,.js}'),
      ],
      migrationsRun: true,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };
  }
}
