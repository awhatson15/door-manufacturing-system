import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables from root .env file
const envPath = resolve(__dirname, '..', '..', '..', '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  // Fallback for when running from compiled dist
  config({ path: resolve(process.cwd(), '.env') });
}

const isProduction = process.env.NODE_ENV === 'production';

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'door_manufacturing';

// Build connection URL with sslmode parameter for non-production
const connectionUrl = isProduction
  ? `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`
  : `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?sslmode=disable`;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionUrl,
  entities: [
    join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
    join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
  ],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // Always false for migrations
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
