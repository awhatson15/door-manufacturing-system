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

        const dbHost = configService.get('DB_HOST') || 'localhost';
        const dbPort = parseInt(configService.get('DB_PORT', '5432'));
        const dbUser = configService.get('DB_USER') || 'postgres';
        const dbPass = configService.get('DB_PASSWORD') || 'postgres';
        const dbName = configService.get('DB_NAME') || 'door_manufacturing';

        // Determine if we're connecting to a local/Docker database
        const isLocalDb = ['localhost', '127.0.0.1', 'postgres'].includes(dbHost);

        // Build connection URL - disable SSL for local databases
        const connectionUrl = !isLocalDb
          ? `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`
          : `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?sslmode=disable`;

        return {
          type: 'postgres' as const,
          url: connectionUrl,
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
          // Only use SSL for remote production databases
          ...(!isLocalDb && isProduction && { ssl: { rejectUnauthorized: false } }),
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

    const dbHost = this.configService.get('DB_HOST') || 'localhost';
    const dbPort = parseInt(this.configService.get('DB_PORT', '5432'));
    const dbUser = this.configService.get('DB_USER') || 'postgres';
    const dbPass = this.configService.get('DB_PASSWORD') || 'postgres';
    const dbName = this.configService.get('DB_NAME') || 'door_manufacturing';

    // Determine if we're connecting to a local/Docker database
    const isLocalDb = ['localhost', '127.0.0.1', 'postgres'].includes(dbHost);

    // Build connection URL - disable SSL for local databases
    const connectionUrl = !isLocalDb
      ? `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`
      : `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?sslmode=disable`;

    return {
      type: 'postgres' as const,
      url: connectionUrl,
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
      // Only use SSL for remote production databases
      ...(!isLocalDb && isProduction && { ssl: { rejectUnauthorized: false } }),
    };
  }
}
