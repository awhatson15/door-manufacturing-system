import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsOptional, IsBoolean, MaxLength, Min } from 'class-validator';
import { ThresholdType } from '../../entities/threshold.entity';

export class CreateThresholdDto {
  @ApiProperty({
    description: 'Тип порога',
    enum: ThresholdType,
    example: ThresholdType.WITH_QUARTER,
  })
  @IsEnum(ThresholdType)
  type: ThresholdType;

  @ApiProperty({
    description: 'Высота порога (мм)',
    example: 40,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  heightMm?: number;

  @ApiProperty({
    description: 'Материал исполнения',
    example: 'Сталь',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  material?: string;

  @ApiProperty({
    description: 'Примечания',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Активность справочника', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
