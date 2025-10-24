import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AssignOrderStageDto {
  @ApiProperty({ description: 'ID назначенного исполнителя' })
  @IsUUID()
  assigneeId: string;

  @ApiProperty({ description: 'Комментарий к назначению', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
