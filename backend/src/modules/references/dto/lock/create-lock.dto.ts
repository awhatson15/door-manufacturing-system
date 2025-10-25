import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateLockDto {
  @ApiProperty({ description: 'Модель замка', example: 'Гардиан 30.01' })
  @IsString()
  @MaxLength(255)
  model: string;

  @ApiProperty({
    description: 'Количество замков',
    example: 2,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiProperty({
    description: 'Наличие задвижки',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBolt?: boolean;

  @ApiProperty({
    description: 'Наличие цилиндра',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasCylinder?: boolean;

  @ApiProperty({
    description: 'Наличие броненакладки',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBronenakladka?: boolean;

  @ApiProperty({
    description: 'Комментарий о замке',
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
