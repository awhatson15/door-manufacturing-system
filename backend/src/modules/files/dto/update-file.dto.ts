import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { FileType, FileVisibility } from '../entities/file.entity';

export class UpdateFileDto {
  @ApiProperty({ enum: FileType, description: 'Тип файла', required: false })
  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;

  @ApiProperty({ enum: FileVisibility, description: 'Видимость файла', required: false })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @ApiProperty({ description: 'Описание файла', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
