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
} from 'class-validator';
import { DoorType, DeliveryType } from '../entities/order.entity';

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

  @ApiProperty({ enum: DoorType, description: 'Тип двери', default: DoorType.STANDARD })
  @IsEnum(DoorType)
  doorType: DoorType;

  @ApiProperty({ description: 'Размеры (Высота × ширина)', example: '2000×900' })
  @IsString()
  dimensions: string;

  @ApiProperty({ description: 'Цвет и покрытие', required: false })
  @IsOptional()
  @IsString()
  colorCoating?: string;

  @ApiProperty({ description: 'Номер щита (для пожарных дверей)', required: false })
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

  @ApiProperty({ enum: DeliveryType, description: 'Тип доставки', required: false })
  @IsOptional()
  @IsEnum(DeliveryType)
  deliveryType?: DeliveryType;

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
