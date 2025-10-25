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
import { LocksService } from '../services/locks.service';
import { CreateLockDto } from '../dto/lock/create-lock.dto';
import { UpdateLockDto } from '../dto/lock/update-lock.dto';
import { QueryLockDto } from '../dto/lock/query-lock.dto';
import { Lock } from '../entities/lock.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('references/locks')
@Controller('references/locks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocksController {
  constructor(private readonly locksService: LocksService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового замка' })
  @ApiResponse({
    status: 201,
    description: 'Замок успешно создан',
    type: Lock,
  })
  @ApiResponse({ status: 409, description: 'Замок с такой моделью уже существует' })
  async create(@Body() createDto: CreateLockDto): Promise<Lock> {
    return await this.locksService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка замков' })
  @ApiResponse({ status: 200, description: 'Список замков' })
  async findAll(@Query() queryDto: QueryLockDto) {
    return await this.locksService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Получение всех активных замков' })
  @ApiResponse({ status: 200, description: 'Список активных замков' })
  async findAllActive(): Promise<Lock[]> {
    return await this.locksService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение замка по ID' })
  @ApiParam({ name: 'id', description: 'ID замка' })
  @ApiResponse({ status: 200, description: 'Замок найден', type: Lock })
  @ApiResponse({ status: 404, description: 'Замок не найден' })
  async findOne(@Param('id') id: string): Promise<Lock> {
    return await this.locksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление замка' })
  @ApiParam({ name: 'id', description: 'ID замка' })
  @ApiResponse({
    status: 200,
    description: 'Замок успешно обновлен',
    type: Lock,
  })
  @ApiResponse({ status: 404, description: 'Замок не найден' })
  @ApiResponse({ status: 409, description: 'Замок с такой моделью уже существует' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLockDto,
  ): Promise<Lock> {
    return await this.locksService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Мягкое удаление замка (деактивация)' })
  @ApiParam({ name: 'id', description: 'ID замка' })
  @ApiResponse({ status: 200, description: 'Замок успешно деактивирован' })
  @ApiResponse({ status: 404, description: 'Замок не найден' })
  async remove(@Param('id') id: string): Promise<Lock> {
    return await this.locksService.softDelete(id);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Активация/деактивация замка' })
  @ApiParam({ name: 'id', description: 'ID замка' })
  @ApiResponse({ status: 200, description: 'Статус замка изменен' })
  @ApiResponse({ status: 404, description: 'Замок не найден' })
  async toggleActive(@Param('id') id: string): Promise<Lock> {
    return await this.locksService.toggleActive(id);
  }
}
