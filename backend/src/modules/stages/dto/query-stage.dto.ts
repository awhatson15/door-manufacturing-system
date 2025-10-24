import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { StageType } from '../entities/stage.entity';

export class QueryStageDto {
  @ApiProperty({ enum: StageType, description: 'Фильтр по типу этапа', required: false })
  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;

  @ApiProperty({ description: 'Только активные', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyActive?: boolean;

  @ApiProperty({ description: 'Только этапы по умолчанию', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyDefault?: boolean;
}
