import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLockDto {
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

  @ApiProperty({ description: 'Поиск по модели', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Только активные записи', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'С задвижкой', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasBolt?: boolean;

  @ApiProperty({ description: 'С цилиндром', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasCylinder?: boolean;

  @ApiProperty({ description: 'Сортировка', enum: ['model', 'count', 'createdAt', 'updatedAt'], required: false, default: 'model' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'model';

  @ApiProperty({ description: 'Порядок сортировки', enum: ['ASC', 'DESC'], required: false, default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
