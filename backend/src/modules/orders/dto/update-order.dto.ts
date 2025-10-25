import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ enum: OrderStatus, description: 'Статус заявки', required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'Заявка отменена', required: false })
  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @ApiProperty({ description: 'ID причины отмены', required: false })
  @IsOptional()
  @IsUUID()
  cancelReasonId?: string;

  @ApiProperty({ description: 'Заявка приостановлена', required: false })
  @IsOptional()
  @IsBoolean()
  isPaused?: boolean;

  @ApiProperty({ description: 'Причина приостановки', required: false })
  @IsOptional()
  @IsString()
  pauseReason?: string;

  @ApiProperty({ description: 'Дата завершения', required: false })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiProperty({ description: 'Фактическая дата доставки', required: false })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;
}
