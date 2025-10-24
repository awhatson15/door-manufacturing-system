import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { HistoryAction, HistoryEntityType } from '../entities/history.entity';

export class QueryHistoryDto {
  @ApiProperty({ description: 'Номер страницы', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Количество на странице', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ enum: HistoryAction, description: 'Фильтр по действию', required: false })
  @IsOptional()
  @IsEnum(HistoryAction)
  action?: HistoryAction;

  @ApiProperty({ enum: HistoryEntityType, description: 'Фильтр по типу сущности', required: false })
  @IsOptional()
  @IsEnum(HistoryEntityType)
  entityType?: HistoryEntityType;

  @ApiProperty({ description: 'ID сущности', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'ID пользователя', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'ID заказчика', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'ID заявки', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'Фильтр по дате (от)', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Фильтр по дате (до)', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Только системные действия', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlySystem?: boolean;

  @ApiProperty({ description: 'Только пользовательские действия', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyUser?: boolean;

  @ApiProperty({ description: 'Порядок сортировки', enum: ['ASC', 'DESC'], default: 'DESC', required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
