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
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from '../services/files.service';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { QueryFileDto } from '../dto/query-file.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { createReadStream } from 'fs';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузка файла' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        orderId: { type: 'string' },
        type: { type: 'string' },
        visibility: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Файл успешно загружен' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @Request() req,
  ) {
    return await this.filesService.upload(file, createFileDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка файлов' })
  @ApiResponse({ status: 200, description: 'Список файлов' })
  async findAll(@Query() queryDto: QueryFileDto) {
    return await this.filesService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получение статистики по файлам' })
  @ApiResponse({ status: 200, description: 'Статистика файлов' })
  async getStatistics(@Query('orderId') orderId?: string) {
    return await this.filesService.getStatistics(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение информации о файле' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 200, description: 'Файл найден' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async findOne(@Param('id') id: string) {
    return await this.filesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Скачивание файла' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 200, description: 'Файл скачан' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const file = await this.filesService.trackDownload(id);

    if (!fs.existsSync(file.filePath)) {
      throw new Error('Физический файл не найден');
    }

    const fileStream = createReadStream(file.filePath);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    });

    return new StreamableFile(fileStream);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление метаданных файла' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 200, description: 'Файл успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    return await this.filesService.update(id, updateFileDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление файла' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 204, description: 'Файл успешно удален' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.filesService.remove(id, req.user.id);
  }
}
