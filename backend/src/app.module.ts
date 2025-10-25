import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StagesModule } from './modules/stages/stages.module';
import { FilesModule } from './modules/files/files.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HistoryModule } from './modules/history/history.module';
import { ReferencesModule } from './modules/references/references.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CustomersModule,
    OrdersModule,
    StagesModule,
    FilesModule,
    CommentsModule,
    NotificationsModule,
    HistoryModule,
    ReferencesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
