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
import { CancelReasonsService } from '../services/cancel-reasons.service';
import { CreateCancelReasonDto } from '../dto/cancel-reason/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from '../dto/cancel-reason/update-cancel-reason.dto';
import { QueryCancelReasonDto } from '../dto/cancel-reason/query-cancel-reason.dto';
import { CancelReason } from '../entities/cancel-reason.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('references/cancel-reasons')
@Controller('references/cancel-reasons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CancelReasonsController {
  constructor(private readonly cancelReasonsService: CancelReasonsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой причины отмены' })
  @ApiResponse({
    status: 201,
    description: 'Причина отмены успешно создана',
    type: CancelReason,
  })
  @ApiResponse({ status: 409, description: 'Причина отмены с таким названием уже существует' })
  async create(@Body() createDto: CreateCancelReasonDto): Promise<CancelReason> {
    return await this.cancelReasonsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка причин отмены' })
  @ApiResponse({ status: 200, description: 'Список причин отмены' })
  async findAll(@Query() queryDto: QueryCancelReasonDto) {
    return await this.cancelReasonsService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получение всех активных причин отмены' })
  @ApiResponse({ status: 200, description: 'Список активных причин отмены' })
  async findAllActive(): Promise<CancelReason[]> {
    return await this.cancelReasonsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение причины отмены по ID' })
  @ApiParam({ name: 'id', description: 'ID причины отмены' })
  @ApiResponse({ status: 200, description: 'Причина отмены найдена', type: CancelReason })
  @ApiResponse({ status: 404, description: 'Причина отмены не найдена' })
  async findOne(@Param('id') id: string): Promise<CancelReason> {
    return await this.cancelReasonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление причины отмены' })
  @ApiParam({ name: 'id', description: 'ID причины отмены' })
  @ApiResponse({
    status: 200,
    description: 'Причина отмены успешно обновлена',
    type: CancelReason,
  })
  @ApiResponse({ status: 404, description: 'Причина отмены не найдена' })
  @ApiResponse({ status: 409, description: 'Причина отмены с таким названием уже существует' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCancelReasonDto,
  ): Promise<CancelReason> {
    return await this.cancelReasonsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление причины отмены (деактивация)' })
  @ApiParam({ name: 'id', description: 'ID причины отмены' })
  @ApiResponse({ status: 200, description: 'Причина отмены успешно деактивирована' })
  @ApiResponse({ status: 404, description: 'Причина отмены не найдена' })
  async remove(@Param('id') id: string): Promise<CancelReason> {
    return await this.cancelReasonsService.softDelete(id);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация причины отмены' })
  @ApiParam({ name: 'id', description: 'ID причины отмены' })
  @ApiResponse({ status: 200, description: 'Статус причины отмены изменен' })
  @ApiResponse({ status: 404, description: 'Причина отмены не найдена' })
  async toggleActive(@Param('id') id: string): Promise<CancelReason> {
    return await this.cancelReasonsService.toggleActive(id);
  }
}
