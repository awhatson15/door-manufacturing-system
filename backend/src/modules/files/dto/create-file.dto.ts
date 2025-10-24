import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { FileType, FileVisibility } from '../entities/file.entity';

export class CreateFileDto {
  @ApiProperty({ description: 'ID заявки' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: FileType, description: 'Тип файла', default: FileType.OTHER })
  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;

  @ApiProperty({ enum: FileVisibility, description: 'Видимость файла', default: FileVisibility.INTERNAL })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @ApiProperty({ description: 'Описание файла', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID комментария (если файл прикреплен к комментарию)', required: false })
  @IsOptional()
  @IsUUID()
  commentId?: string;
}
