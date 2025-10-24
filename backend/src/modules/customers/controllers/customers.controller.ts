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
} from '@nestjs/swagger';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { CustomerResponseDto, PaginatedCustomerResponseDto } from '../dto/customer-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CustomerStatus } from '../entities/customer.entity';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового заказчика' })
  @ApiResponse({
    status: 201,
    description: 'Заказчик успешно создан',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 409, description: 'Заказчик с таким email или ИНН уже существует' })
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return await this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка заказчиков' })
  @ApiResponse({
    status: 200,
    description: 'Список заказчиков',
    type: PaginatedCustomerResponseDto,
  })
  async findAll(@Query() queryDto: QueryCustomerDto) {
    return await this.customersService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получение статистики по заказчикам' })
  @ApiResponse({ status: 200, description: 'Статистика заказчиков' })
  async getStatistics() {
    return await this.customersService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение заказчика по ID' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({
    status: 200,
    description: 'Заказчик найден',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  async findOne(@Param('id') id: string) {
    return await this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление заказчика' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({
    status: 200,
    description: 'Заказчик успешно обновлен',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  @ApiResponse({ status: 409, description: 'Заказчик с таким email или ИНН уже существует' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    return await this.customersService.update(id, updateCustomerDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление заказчика' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({ status: 204, description: 'Заказчик успешно удален' })
  @ApiResponse({ status: 400, description: 'Нельзя удалить заказчика с существующими заявками' })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.customersService.remove(id, req.user.id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Активация заказчика' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({
    status: 200,
    description: 'Заказчик активирован',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  async activate(@Param('id') id: string, @Request() req) {
    return await this.customersService.changeStatus(id, CustomerStatus.ACTIVE, req.user.id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Деактивация заказчика' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({
    status: 200,
    description: 'Заказчик деактивирован',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  async deactivate(@Param('id') id: string, @Request() req) {
    return await this.customersService.changeStatus(id, CustomerStatus.INACTIVE, req.user.id);
  }

  @Post(':id/blacklist')
  @ApiOperation({ summary: 'Добавление заказчика в черный список' })
  @ApiParam({ name: 'id', description: 'ID заказчика' })
  @ApiResponse({
    status: 200,
    description: 'Заказчик добавлен в черный список',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Заказчик не найден' })
  async blacklist(@Param('id') id: string, @Request() req) {
    return await this.customersService.changeStatus(id, CustomerStatus.BLACKLISTED, req.user.id);
  }
}
