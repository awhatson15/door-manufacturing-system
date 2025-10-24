import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Содержание комментария' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ description: 'Причина редактирования', required: false })
  @IsOptional()
  @IsString()
  editReason?: string;

  @ApiProperty({ description: 'Закрепить комментарий', required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
