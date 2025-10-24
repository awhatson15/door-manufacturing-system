import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from root .env file
config({ path: join(__dirname, '..', '..', '..', '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'door_manufacturing',
  entities: [
    join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
    join(__dirname, '..', 'modules', '**', '**', '*.entity{.ts,.js}'),
  ],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
