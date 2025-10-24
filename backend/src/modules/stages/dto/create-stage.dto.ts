import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { StageType } from '../entities/stage.entity';

export class CreateStageDto {
  @ApiProperty({ description: 'Название этапа' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание этапа', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ enum: StageType, description: 'Тип этапа', default: StageType.SEQUENTIAL })
  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;

  @ApiProperty({ description: 'Этап активен', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Использовать по умолчанию', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Оценочная длительность в часах', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiProperty({ description: 'Код цвета (HEX)', required: false, example: '#3B82F6' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ description: 'Название иконки', required: false })
  @IsOptional()
  @IsString()
  iconName?: string;

  @ApiProperty({ description: 'Требования к этапу', required: false })
  @IsOptional()
  requirements?: Record<string, any>;

  @ApiProperty({ description: 'Дополнительные метаданные', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
