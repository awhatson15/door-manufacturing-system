import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HistoryService } from '../services/history.service';
import { QueryHistoryDto } from '../dto/query-history.dto';
import { HistoryResponseDto, PaginatedHistoryResponseDto, HistoryStatsDto } from '../dto/history-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HistoryEntityType } from '../entities/history.entity';

@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Получение списка записей истории' })
  @ApiResponse({
    status: 200,
    description: 'Список записей истории',
    type: PaginatedHistoryResponseDto,
  })
  async findAll(@Query() queryDto: QueryHistoryDto) {
    return await this.historyService.findAllPaginated(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получение статистики по истории' })
  @ApiResponse({
    status: 200,
    description: 'Статистика истории',
    type: HistoryStatsDto,
  })
  @ApiQuery({ name: 'userId', required: false, description: 'ID пользователя для фильтрации' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Дата начала периода' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Дата окончания периода' })
  async getStatistics(
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const dateFromObj = dateFrom ? new Date(dateFrom) : undefined;
    const dateToObj = dateTo ? new Date(dateTo) : undefined;
    return await this.historyService.getStatistics(userId, dateFromObj, dateToObj);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Получение истории конкретной сущности' })
  @ApiParam({ name: 'entityType', enum: HistoryEntityType, description: 'Тип сущности' })
  @ApiParam({ name: 'entityId', description: 'ID сущности' })
  @ApiResponse({
    status: 200,
    description: 'История сущности',
    type: [HistoryResponseDto],
  })
  async findByEntity(
    @Param('entityType') entityType: HistoryEntityType,
    @Param('entityId') entityId: string,
  ) {
    return await this.historyService.findByEntity(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получение истории действий пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'История действий пользователя',
    type: [HistoryResponseDto],
  })
  async findByUser(@Param('userId') userId: string) {
    return await this.historyService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение записи истории по ID' })
  @ApiParam({ name: 'id', description: 'ID записи истории' })
  @ApiResponse({
    status: 200,
    description: 'Запись истории найдена',
    type: HistoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Запись истории не найдена' })
  async findOne(@Param('id') id: string) {
    return await this.historyService.findById(id);
  }

  @Delete('cleanup/:days')
  @ApiOperation({ summary: 'Очистка старых записей истории' })
  @ApiParam({ name: 'days', description: 'Количество дней для хранения (удаляются записи старше указанного периода)' })
  @ApiResponse({ status: 200, description: 'Очистка выполнена успешно' })
  @HttpCode(HttpStatus.OK)
  async cleanupOldHistory(@Param('days') days: string) {
    const daysToKeep = parseInt(days, 10) || 365;
    const deletedCount = await this.historyService.cleanOldHistory(daysToKeep);
    return {
      message: `Удалено ${deletedCount} записей старше ${daysToKeep} дней`,
      deletedCount,
      daysToKeep,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление записи истории' })
  @ApiParam({ name: 'id', description: 'ID записи истории' })
  @ApiResponse({ status: 204, description: 'Запись истории удалена' })
  @ApiResponse({ status: 404, description: 'Запись истории не найдена' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.historyService.delete(id);
  }
}
