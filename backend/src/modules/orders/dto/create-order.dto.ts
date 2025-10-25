import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { DeliveryMethod } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID заказчика' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'ID менеджера', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: 'Основной номер заявки (опционально)', required: false })
  @IsOptional()
  @IsString()
  mainNumber?: string;

  @ApiProperty({ description: 'ID типа двери', required: false })
  @IsOptional()
  @IsUUID()
  doorTypeId?: string;

  @ApiProperty({ description: 'Высота двери (мм)', example: 2000, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  heightMm?: number;

  @ApiProperty({ description: 'Ширина двери (мм)', example: 900, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  widthMm?: number;

  @ApiProperty({ description: 'ID цвета RAL', required: false })
  @IsOptional()
  @IsUUID()
  colorId?: string;

  @ApiProperty({ description: 'ID замка', required: false })
  @IsOptional()
  @IsUUID()
  lockId?: string;

  @ApiProperty({ description: 'ID порога', required: false })
  @IsOptional()
  @IsUUID()
  thresholdId?: string;

  @ApiProperty({ description: 'Номер щита (для противопожарных дверей)', required: false })
  @IsOptional()
  @IsString()
  shieldNumber?: string;

  @ApiProperty({ description: 'Комментарий менеджера', required: false })
  @IsOptional()
  @IsString()
  managerComment?: string;

  @ApiProperty({ description: 'Плановая дата завершения', required: false })
  @IsOptional()
  @IsDateString()
  plannedCompletionDate?: string;

  @ApiProperty({
    enum: DeliveryMethod,
    description: 'Метод доставки',
    example: DeliveryMethod.PICKUP,
    required: false
  })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod;

  @ApiProperty({ description: 'Общая сумма', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({ description: 'Оплаченная сумма', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiProperty({ description: 'Полностью оплачено', default: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
