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
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { QueryCommentDto } from '../dto/query-comment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание комментария' })
  @ApiResponse({ status: 201, description: 'Комментарий успешно создан' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return await this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка комментариев' })
  @ApiResponse({ status: 200, description: 'Список комментариев' })
  async findAll(@Query() queryDto: QueryCommentDto) {
    return await this.commentsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение комментария по ID' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий найден' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление комментария' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий успешно обновлен' })
  @ApiResponse({ status: 403, description: 'Вы не можете редактировать чужой комментарий' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return await this.commentsService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление комментария' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 204, description: 'Комментарий успешно удален' })
  @ApiResponse({ status: 403, description: 'Вы не можете удалить чужой комментарий' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.commentsService.remove(id, req.user.id);
  }

  @Post(':id/toggle-pin')
  @ApiOperation({ summary: 'Закрепление/открепление комментария' })
  @ApiParam({ name: 'id', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Статус закрепления изменен' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async togglePin(@Param('id') id: string, @Request() req) {
    return await this.commentsService.togglePin(id, req.user.id);
  }
}
