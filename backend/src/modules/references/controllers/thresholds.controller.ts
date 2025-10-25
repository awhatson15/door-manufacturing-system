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
import { ThresholdsService } from '../services/thresholds.service';
import { CreateThresholdDto } from '../dto/threshold/create-threshold.dto';
import { UpdateThresholdDto } from '../dto/threshold/update-threshold.dto';
import { QueryThresholdDto } from '../dto/threshold/query-threshold.dto';
import { Threshold } from '../entities/threshold.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('references/thresholds')
@Controller('references/thresholds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThresholdsController {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового порога' })
  @ApiResponse({
    status: 201,
    description: 'Порог успешно создан',
    type: Threshold,
  })
  async create(@Body() createDto: CreateThresholdDto): Promise<Threshold> {
    return await this.thresholdsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка порогов' })
  @ApiResponse({ status: 200, description: 'Список порогов' })
  async findAll(@Query() queryDto: QueryThresholdDto) {
    return await this.thresholdsService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получение всех активных порогов' })
  @ApiResponse({ status: 200, description: 'Список активных порогов' })
  async findAllActive(): Promise<Threshold[]> {
    return await this.thresholdsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение порога по ID' })
  @ApiParam({ name: 'id', description: 'ID порога' })
  @ApiResponse({ status: 200, description: 'Порог найден', type: Threshold })
  @ApiResponse({ status: 404, description: 'Порог не найден' })
  async findOne(@Param('id') id: string): Promise<Threshold> {
    return await this.thresholdsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление порога' })
  @ApiParam({ name: 'id', description: 'ID порога' })
  @ApiResponse({
    status: 200,
    description: 'Порог успешно обновлен',
    type: Threshold,
  })
  @ApiResponse({ status: 404, description: 'Порог не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateThresholdDto,
  ): Promise<Threshold> {
    return await this.thresholdsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление порога (деактивация)' })
  @ApiParam({ name: 'id', description: 'ID порога' })
  @ApiResponse({ status: 200, description: 'Порог успешно деактивирован' })
  @ApiResponse({ status: 404, description: 'Порог не найден' })
  async remove(@Param('id') id: string): Promise<Threshold> {
    return await this.thresholdsService.softDelete(id);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация порога' })
  @ApiParam({ name: 'id', description: 'ID порога' })
  @ApiResponse({ status: 200, description: 'Статус порога изменен' })
  @ApiResponse({ status: 404, description: 'Порог не найден' })
  async toggleActive(@Param('id') id: string): Promise<Threshold> {
    return await this.thresholdsService.toggleActive(id);
  }
}
