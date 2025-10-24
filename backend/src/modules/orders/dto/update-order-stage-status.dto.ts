import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStageStatus } from '../entities/order-stage.entity';

export class UpdateOrderStageStatusDto {
  @ApiProperty({ enum: OrderStageStatus, description: 'Новый статус этапа' })
  @IsEnum(OrderStageStatus)
  status: OrderStageStatus;

  @ApiProperty({ description: 'Причина изменения статуса (для пропуска)', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
