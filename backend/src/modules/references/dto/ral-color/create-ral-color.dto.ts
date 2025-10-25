import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';

export class CreateRalColorDto {
  @ApiProperty({ description: 'Код RAL', example: '8017' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty({
    description: 'Название цвета',
    example: 'Шоколадно-коричневый',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'HEX код цвета',
    example: '#45322E',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'HEX код должен быть в формате #RRGGBB',
  })
  hex?: string;

  @ApiProperty({
    description: 'URL превью изображения',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiProperty({
    description: 'Дополнительные параметры покраски',
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
