import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { FileType, FileVisibility } from '../entities/file.entity';

export class QueryFileDto {
  @ApiProperty({ description: 'ID заявки', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'ID пользователя', required: false })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @ApiProperty({ enum: FileType, description: 'Тип файла', required: false })
  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;

  @ApiProperty({ enum: FileVisibility, description: 'Видимость файла', required: false })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;
}
