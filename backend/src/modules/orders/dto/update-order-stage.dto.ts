import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { CreateOrderStageDto } from './create-order-stage.dto';
import { OrderStageStatus } from '../entities/order-stage.entity';

export class UpdateOrderStageDto extends PartialType(CreateOrderStageDto) {
  @ApiProperty({ enum: OrderStageStatus, description: 'Статус этапа', required: false })
  @IsOptional()
  @IsEnum(OrderStageStatus)
  status?: OrderStageStatus;

  @ApiProperty({ description: 'Причина пропуска этапа', required: false })
  @IsOptional()
  @IsString()
  skipReason?: string;

  @ApiProperty({ description: 'Фактическая длительность в часах', required: false })
  @IsOptional()
  @IsNumber()
  actualDurationHours?: number;
}
