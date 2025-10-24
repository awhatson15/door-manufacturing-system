import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, MinLength } from 'class-validator';
import { CommentType } from '../entities/comment.entity';

export class CreateCommentDto {
  @ApiProperty({ description: 'ID заявки' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Содержание комментария' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ enum: CommentType, description: 'Тип комментария', default: CommentType.INTERNAL })
  @IsOptional()
  @IsEnum(CommentType)
  type?: CommentType;

  @ApiProperty({ description: 'ID родительского комментария (для ответов)', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
