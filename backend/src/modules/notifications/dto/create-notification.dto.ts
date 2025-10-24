import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { NotificationType, NotificationChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, description: 'Тип уведомления' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Заголовок' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Сообщение' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationChannel, description: 'Канал отправки', default: NotificationChannel.IN_APP })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiProperty({ description: 'ID заявки', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'ID получателя (пользователя)', required: false })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiProperty({ description: 'ID заказчика', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Приоритетное уведомление', default: false })
  @IsOptional()
  @IsBoolean()
  isPriority?: boolean;

  @ApiProperty({ description: 'Дополнительные данные', required: false })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ description: 'Данные шаблона', required: false })
  @IsOptional()
  templateData?: Record<string, any>;
}
