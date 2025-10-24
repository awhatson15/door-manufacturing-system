import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, IsString, Min, IsBoolean } from 'class-validator';

export class CreateOrderStageDto {
  @ApiProperty({ description: 'ID этапа производства' })
  @IsUUID()
  stageId: string;

  @ApiProperty({ description: 'ID назначенного исполнителя', required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ description: 'Оценочная длительность в часах', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiProperty({ description: 'Комментарий исполнителя', required: false })
  @IsOptional()
  @IsString()
  assigneeComment?: string;

  @ApiProperty({ description: 'Этап на критическом пути', default: false })
  @IsOptional()
  @IsBoolean()
  isCriticalPath?: boolean;

  @ApiProperty({ description: 'Дополнительные метаданные', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
