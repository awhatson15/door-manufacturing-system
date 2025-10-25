import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { Order } from './entities/order.entity';
import { OrderStage } from './entities/order-stage.entity';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Stage } from '../stages/entities/stage.entity';
import { HistoryModule } from '../history/history.module';
import { ReferencesModule } from '../references/references.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderStage, Customer, User, Stage]),
    HistoryModule,
    ReferencesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
