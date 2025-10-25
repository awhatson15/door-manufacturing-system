import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
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
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';
import { OrderResponseDto, PaginatedOrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderStageDto } from '../dto/create-order-stage.dto';
import { UpdateOrderStageDto } from '../dto/update-order-stage.dto';
import { UpdateOrderStageStatusDto } from '../dto/update-order-stage-status.dto';
import { AssignOrderStageDto } from '../dto/assign-order-stage.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой заявки' })
  @ApiResponse({
    status: 201,
    description: 'Заявка успешно создана',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 404, description: 'Заказчик или менеджер не найдены' })
  @ApiResponse({ status: 409, description: 'Заявка с таким номером уже существует' })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return await this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка заявок' })
  @ApiResponse({
    status: 200,
    description: 'Список заявок',
    type: PaginatedOrderResponseDto,
  })
  async findAll(@Query() queryDto: QueryOrderDto) {
    return await this.ordersService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получение статистики по заявкам' })
  @ApiResponse({ status: 200, description: 'Статистика заявок' })
  @ApiQuery({ name: 'managerId', required: false, description: 'ID менеджера для фильтрации' })
  async getStatistics(@Query('managerId') managerId?: string) {
    return await this.ordersService.getStatistics(managerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение заявки по ID' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка найдена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка успешно обновлена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @ApiResponse({ status: 409, description: 'Заявка с таким номером уже существует' })
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    return await this.ordersService.update(id, updateOrderDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 204, description: 'Заявка успешно удалена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.ordersService.remove(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Отмена заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка отменена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Заявка уже отменена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async cancel(@Param('id') id: string, @Body('cancelReasonId') cancelReasonId: string | null, @Request() req) {
    return await this.ordersService.cancel(id, cancelReasonId, req.user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Приостановка заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка приостановлена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Заявка уже приостановлена или отменена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async pause(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    return await this.ordersService.pause(id, reason, req.user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Возобновление заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка возобновлена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Заявка не приостановлена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async resume(@Param('id') id: string, @Request() req) {
    return await this.ordersService.resume(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Завершение заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({
    status: 200,
    description: 'Заявка завершена',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Заявка уже завершена или отменена' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async complete(@Param('id') id: string, @Request() req) {
    return await this.ordersService.complete(id, req.user.id);
  }

  // ==================== OrderStages Endpoints ====================

  @Get(':id/stages')
  @ApiOperation({ summary: 'Получение всех этапов заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Список этапов заявки' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async getOrderStages(@Param('id') id: string) {
    return await this.ordersService.getOrderStages(id);
  }

  @Get(':id/stages/:stageId')
  @ApiOperation({ summary: 'Получение конкретного этапа заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап найден' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async getOrderStage(@Param('id') id: string, @Param('stageId') stageId: string) {
    return await this.ordersService.getOrderStage(id, stageId);
  }

  @Post(':id/stages')
  @ApiOperation({ summary: 'Добавление этапа к заявке' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 201, description: 'Этап успешно добавлен' })
  @ApiResponse({ status: 404, description: 'Заявка или этап производства не найдены' })
  async addOrderStage(
    @Param('id') id: string,
    @Body() createOrderStageDto: CreateOrderStageDto,
    @Request() req,
  ) {
    return await this.ordersService.addOrderStage(id, createOrderStageDto, req.user.id);
  }

  @Patch(':id/stages/:stageId')
  @ApiOperation({ summary: 'Обновление этапа заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async updateOrderStage(
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() updateOrderStageDto: UpdateOrderStageDto,
    @Request() req,
  ) {
    return await this.ordersService.updateOrderStage(id, stageId, updateOrderStageDto, req.user.id);
  }

  @Delete(':id/stages/:stageId')
  @ApiOperation({ summary: 'Удаление этапа из заявки' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 204, description: 'Этап успешно удален' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOrderStage(@Param('id') id: string, @Param('stageId') stageId: string, @Request() req) {
    await this.ordersService.removeOrderStage(id, stageId, req.user.id);
  }

  @Post(':id/stages/:stageId/start')
  @ApiOperation({ summary: 'Начало работы над этапом' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап взят в работу' })
  @ApiResponse({ status: 400, description: 'Этап уже в работе или завершен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async startOrderStage(@Param('id') id: string, @Param('stageId') stageId: string, @Request() req) {
    return await this.ordersService.startOrderStage(id, stageId, req.user.id);
  }

  @Post(':id/stages/:stageId/complete')
  @ApiOperation({ summary: 'Завершение этапа' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап завершен' })
  @ApiResponse({ status: 400, description: 'Этап уже завершен или пропущен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async completeOrderStage(@Param('id') id: string, @Param('stageId') stageId: string, @Request() req) {
    return await this.ordersService.completeOrderStage(id, stageId, req.user.id);
  }

  @Post(':id/stages/:stageId/skip')
  @ApiOperation({ summary: 'Пропуск этапа' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап пропущен' })
  @ApiResponse({ status: 400, description: 'Этап уже пропущен или завершен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async skipOrderStage(
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return await this.ordersService.skipOrderStage(id, stageId, reason, req.user.id);
  }

  @Post(':id/stages/:stageId/assign')
  @ApiOperation({ summary: 'Назначение исполнителя на этап' })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiParam({ name: 'stageId', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Исполнитель назначен' })
  @ApiResponse({ status: 404, description: 'Этап или исполнитель не найдены' })
  async assignOrderStage(
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() assignDto: AssignOrderStageDto,
    @Request() req,
  ) {
    return await this.ordersService.assignOrderStage(id, stageId, assignDto, req.user.id);
  }
}
