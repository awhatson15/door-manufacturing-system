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
import { DoorTypesService } from '../services/door-types.service';
import { CreateDoorTypeDto } from '../dto/door-type/create-door-type.dto';
import { UpdateDoorTypeDto } from '../dto/door-type/update-door-type.dto';
import { QueryDoorTypeDto } from '../dto/door-type/query-door-type.dto';
import { DoorType } from '../entities/door-type.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('references/door-types')
@Controller('references/door-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DoorTypesController {
  constructor(private readonly doorTypesService: DoorTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового типа двери' })
  @ApiResponse({
    status: 201,
    description: 'Тип двери успешно создан',
    type: DoorType,
  })
  @ApiResponse({ status: 409, description: 'Тип двери с таким названием уже существует' })
  async create(@Body() createDto: CreateDoorTypeDto): Promise<DoorType> {
    return await this.doorTypesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка типов дверей' })
  @ApiResponse({ status: 200, description: 'Список типов дверей' })
  async findAll(@Query() queryDto: QueryDoorTypeDto) {
    return await this.doorTypesService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получение всех активных типов дверей' })
  @ApiResponse({ status: 200, description: 'Список активных типов дверей' })
  async findAllActive(): Promise<DoorType[]> {
    return await this.doorTypesService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение типа двери по ID' })
  @ApiParam({ name: 'id', description: 'ID типа двери' })
  @ApiResponse({ status: 200, description: 'Тип двери найден', type: DoorType })
  @ApiResponse({ status: 404, description: 'Тип двери не найден' })
  async findOne(@Param('id') id: string): Promise<DoorType> {
    return await this.doorTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление типа двери' })
  @ApiParam({ name: 'id', description: 'ID типа двери' })
  @ApiResponse({
    status: 200,
    description: 'Тип двери успешно обновлен',
    type: DoorType,
  })
  @ApiResponse({ status: 404, description: 'Тип двери не найден' })
  @ApiResponse({ status: 409, description: 'Тип двери с таким названием уже существует' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDoorTypeDto,
  ): Promise<DoorType> {
    return await this.doorTypesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление типа двери (деактивация)' })
  @ApiParam({ name: 'id', description: 'ID типа двери' })
  @ApiResponse({ status: 200, description: 'Тип двери успешно деактивирован' })
  @ApiResponse({ status: 404, description: 'Тип двери не найден' })
  async remove(@Param('id') id: string): Promise<DoorType> {
    return await this.doorTypesService.softDelete(id);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация типа двери' })
  @ApiParam({ name: 'id', description: 'ID типа двери' })
  @ApiResponse({ status: 200, description: 'Статус типа двери изменен' })
  @ApiResponse({ status: 404, description: 'Тип двери не найден' })
  async toggleActive(@Param('id') id: string): Promise<DoorType> {
    return await this.doorTypesService.toggleActive(id);
  }
}
