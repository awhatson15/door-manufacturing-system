import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsUUID, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class QueryOrderDto {
  @ApiProperty({ description: 'Номер страницы', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Количество на странице', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ enum: OrderStatus, description: 'Фильтр по статусу', required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'ID заказчика', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'ID менеджера', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: 'ID типа двери', required: false })
  @IsOptional()
  @IsUUID()
  doorTypeId?: string;

  @ApiProperty({ description: 'Поиск по номеру заявки', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Фильтр по дате создания (от)', required: false })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({ description: 'Фильтр по дате создания (до)', required: false })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({ description: 'Только отмененные', required: false })
  @IsOptional()
  @Type(() => Boolean)
  onlyCancelled?: boolean;

  @ApiProperty({ description: 'Только приостановленные', required: false })
  @IsOptional()
  @Type(() => Boolean)
  onlyPaused?: boolean;

  @ApiProperty({ description: 'Только просроченные', required: false })
  @IsOptional()
  @Type(() => Boolean)
  onlyOverdue?: boolean;

  @ApiProperty({ description: 'Сортировка', enum: ['createdAt', 'updatedAt', 'plannedCompletionDate'], required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Порядок сортировки', enum: ['ASC', 'DESC'], required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
