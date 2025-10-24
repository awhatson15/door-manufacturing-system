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
import { StagesService } from '../services/stages.service';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { QueryStageDto } from '../dto/query-stage.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('stages')
@Controller('stages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового этапа производства' })
  @ApiResponse({ status: 201, description: 'Этап успешно создан' })
  @ApiResponse({ status: 409, description: 'Этап с таким названием уже существует' })
  async create(@Body() createStageDto: CreateStageDto) {
    return await this.stagesService.create(createStageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка этапов производства' })
  @ApiResponse({ status: 200, description: 'Список этапов' })
  async findAll(@Query() queryDto: QueryStageDto) {
    return await this.stagesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение этапа по ID' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап найден' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async findOne(@Param('id') id: string) {
    return await this.stagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление этапа' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Этап успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  @ApiResponse({ status: 409, description: 'Этап с таким названием уже существует' })
  async update(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
    return await this.stagesService.update(id, updateStageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление этапа' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 204, description: 'Этап успешно удален' })
  @ApiResponse({ status: 400, description: 'Нельзя удалить этап, используемый в заявках' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.stagesService.remove(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Изменение порядка этапов' })
  @ApiResponse({ status: 200, description: 'Порядок успешно изменен' })
  async reorder(@Body('stageIds') stageIds: string[]) {
    return await this.stagesService.reorder(stageIds);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация этапа' })
  @ApiParam({ name: 'id', description: 'ID этапа' })
  @ApiResponse({ status: 200, description: 'Статус этапа изменен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  async toggleActive(@Param('id') id: string) {
    return await this.stagesService.toggleActive(id);
  }
}
