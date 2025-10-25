import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateDoorTypeDto {
  @ApiProperty({ description: 'Название типа двери', example: 'Техническая' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Признак противопожарной двери',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  fireproof?: boolean;

  @ApiProperty({
    description: 'Требует ли номер шильды',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresShieldNumber?: boolean;

  @ApiProperty({
    description: 'Толщина металла снаружи (мм)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  thicknessOuter?: number;

  @ApiProperty({
    description: 'Толщина металла внутри (мм)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  thicknessInner?: number;

  @ApiProperty({
    description: 'Описание типа двери',
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
