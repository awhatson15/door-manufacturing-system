import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { CommentType, CommentStatus } from '../entities/comment.entity';

export class QueryCommentDto {
  @ApiProperty({ description: 'ID заявки', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'ID автора', required: false })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({ enum: CommentType, description: 'Тип комментария', required: false })
  @IsOptional()
  @IsEnum(CommentType)
  type?: CommentType;

  @ApiProperty({ enum: CommentStatus, description: 'Статус комментария', required: false })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}
