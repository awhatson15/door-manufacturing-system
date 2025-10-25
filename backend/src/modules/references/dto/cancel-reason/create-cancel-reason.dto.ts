import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCancelReasonDto {
  @ApiProperty({
    description: 'Название причины',
    example: 'Отказ клиента',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Подробное описание',
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
