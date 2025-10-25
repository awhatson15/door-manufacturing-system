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
import { RalColorsService } from '../services/ral-colors.service';
import { CreateRalColorDto } from '../dto/ral-color/create-ral-color.dto';
import { UpdateRalColorDto } from '../dto/ral-color/update-ral-color.dto';
import { QueryRalColorDto } from '../dto/ral-color/query-ral-color.dto';
import { RalColor } from '../entities/ral-color.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('references/ral-colors')
@Controller('references/ral-colors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RalColorsController {
  constructor(private readonly ralColorsService: RalColorsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового цвета RAL' })
  @ApiResponse({
    status: 201,
    description: 'Цвет RAL успешно создан',
    type: RalColor,
  })
  @ApiResponse({ status: 409, description: 'Цвет с таким кодом уже существует' })
  async create(@Body() createDto: CreateRalColorDto): Promise<RalColor> {
    return await this.ralColorsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка цветов RAL' })
  @ApiResponse({ status: 200, description: 'Список цветов RAL' })
  async findAll(@Query() queryDto: QueryRalColorDto) {
    return await this.ralColorsService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получение всех активных цветов RAL' })
  @ApiResponse({ status: 200, description: 'Список активных цветов RAL' })
  async findAllActive(): Promise<RalColor[]> {
    return await this.ralColorsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение цвета RAL по ID' })
  @ApiParam({ name: 'id', description: 'ID цвета RAL' })
  @ApiResponse({ status: 200, description: 'Цвет RAL найден', type: RalColor })
  @ApiResponse({ status: 404, description: 'Цвет RAL не найден' })
  async findOne(@Param('id') id: string): Promise<RalColor> {
    return await this.ralColorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление цвета RAL' })
  @ApiParam({ name: 'id', description: 'ID цвета RAL' })
  @ApiResponse({
    status: 200,
    description: 'Цвет RAL успешно обновлен',
    type: RalColor,
  })
  @ApiResponse({ status: 404, description: 'Цвет RAL не найден' })
  @ApiResponse({ status: 409, description: 'Цвет с таким кодом уже существует' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRalColorDto,
  ): Promise<RalColor> {
    return await this.ralColorsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление цвета RAL (деактивация)' })
  @ApiParam({ name: 'id', description: 'ID цвета RAL' })
  @ApiResponse({ status: 200, description: 'Цвет RAL успешно деактивирован' })
  @ApiResponse({ status: 404, description: 'Цвет RAL не найден' })
  async remove(@Param('id') id: string): Promise<RalColor> {
    return await this.ralColorsService.softDelete(id);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация цвета RAL' })
  @ApiParam({ name: 'id', description: 'ID цвета RAL' })
  @ApiResponse({ status: 200, description: 'Статус цвета RAL изменен' })
  @ApiResponse({ status: 404, description: 'Цвет RAL не найден' })
  async toggleActive(@Param('id') id: string): Promise<RalColor> {
    return await this.ralColorsService.toggleActive(id);
  }
}
