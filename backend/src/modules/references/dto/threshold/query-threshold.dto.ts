import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ThresholdType } from '../../entities/threshold.entity';

export class QueryThresholdDto {
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

  @ApiProperty({ description: 'Поиск по материалу или описанию', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Только активные записи', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'Фильтр по типу порога', enum: ThresholdType, required: false })
  @IsOptional()
  @IsEnum(ThresholdType)
  type?: ThresholdType;

  @ApiProperty({ description: 'Сортировка', enum: ['type', 'heightMm', 'createdAt', 'updatedAt'], required: false, default: 'type' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'type';

  @ApiProperty({ description: 'Порядок сортировки', enum: ['ASC', 'DESC'], required: false, default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
