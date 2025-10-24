import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationChannel, NotificationStatus } from '../entities/notification.entity';

export class QueryNotificationDto {
  @ApiProperty({ description: 'Номер страницы', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Количество на странице', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ enum: NotificationType, description: 'Тип уведомления', required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ enum: NotificationChannel, description: 'Канал', required: false })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ enum: NotificationStatus, description: 'Статус', required: false })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({ description: 'ID получателя', required: false })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiProperty({ description: 'Только непрочитанные', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyUnread?: boolean;
}
