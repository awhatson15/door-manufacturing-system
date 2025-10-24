import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { QueryNotificationDto } from '../dto/query-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание уведомления' })
  @ApiResponse({ status: 201, description: 'Уведомление успешно создано' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка уведомлений' })
  @ApiResponse({ status: 200, description: 'Список уведомлений' })
  async findAll(@Query() queryDto: QueryNotificationDto) {
    return await this.notificationsService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получение статистики по уведомлениям' })
  @ApiResponse({ status: 200, description: 'Статистика уведомлений' })
  async getStatistics() {
    return await this.notificationsService.getStatistics();
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Получение количества непрочитанных уведомлений' })
  @ApiResponse({ status: 200, description: 'Количество непрочитанных' })
  async getUnreadCount(@Request() req) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.id),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение уведомления по ID' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: 200, description: 'Уведомление найдено' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  async findOne(@Param('id') id: string) {
    return await this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Пометка уведомления как прочитанного' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: 200, description: 'Уведомление помечено как прочитанное' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  async markAsRead(@Param('id') id: string) {
    return await this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Пометка всех уведомлений как прочитанных' })
  @ApiResponse({ status: 200, description: 'Все уведомления помечены как прочитанные' })
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'Все уведомления помечены как прочитанные' };
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Отправка уведомления' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: 200, description: 'Уведомление отправлено' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  async send(@Param('id') id: string) {
    return await this.notificationsService.send(id);
  }

  @Post('retry-failed')
  @ApiOperation({ summary: 'Повторная отправка неудачных уведомлений' })
  @ApiResponse({ status: 200, description: 'Повторная отправка запущена' })
  @HttpCode(HttpStatus.OK)
  async retryFailed() {
    await this.notificationsService.retryFailed();
    return { message: 'Повторная отправка запущена' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление уведомления' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: 204, description: 'Уведомление успешно удалено' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.notificationsService.remove(id);
  }
}
