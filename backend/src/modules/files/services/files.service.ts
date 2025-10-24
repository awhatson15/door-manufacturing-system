import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { QueryFileDto } from '../dto/query-file.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction, HistoryEntityType } from '../../history/entities/history.entity';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly historyService: HistoryService,
  ) {}

  /**
   * Загрузка файла
   */
  async upload(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
    currentUserId: string,
  ): Promise<File> {
    const { orderId, type, visibility, description, commentId } = createFileDto;

    // Проверяем существование заявки
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Заявка не найдена');
    }

    // Получаем пользователя
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Создаем запись файла
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileUrl: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      type: type || (this.detectFileType(file.mimetype) as any),
      visibility: visibility || ('internal' as any),
      description,
      order,
      uploadedBy: user,
      isPublic: visibility === 'public',
      downloadCount: 0,
    } as any);

    const savedFile = await this.fileRepository.save(fileEntity) as unknown as File;

    // Обновляем счетчик файлов в заказе
    order.filesCount += 1;
    await this.orderRepository.save(order);

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.FILE_UPLOAD,
      HistoryEntityType.ORDER,
      order.id,
      null,
      {
        fileName: savedFile.originalName,
        fileType: savedFile.type,
        fileSize: savedFile.fileSizeMB,
      },
      `Загружен файл "${savedFile.originalName}" (${savedFile.fileSizeMB} МБ)`,
    );

    return savedFile;
  }

  /**
   * Получение списка файлов с фильтрацией
   */
  async findAll(queryDto: QueryFileDto): Promise<File[]> {
    const { orderId, uploadedBy, type, visibility } = queryDto;

    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.order', 'order')
      .leftJoinAndSelect('file.uploadedBy', 'uploadedBy')
      .orderBy('file.createdAt', 'DESC');

    if (orderId) {
      queryBuilder.andWhere('file.order.id = :orderId', { orderId });
    }

    if (uploadedBy) {
      queryBuilder.andWhere('file.uploadedBy.id = :uploadedBy', { uploadedBy });
    }

    if (type) {
      queryBuilder.andWhere('file.type = :type', { type });
    }

    if (visibility) {
      queryBuilder.andWhere('file.visibility = :visibility', { visibility });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получение файла по ID
   */
  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['order', 'uploadedBy'],
    });

    if (!file) {
      throw new NotFoundException('Файл не найден');
    }

    return file;
  }

  /**
   * Обновление метаданных файла
   */
  async update(id: string, updateFileDto: UpdateFileDto, currentUserId: string): Promise<File> {
    const file = await this.findOne(id);

    Object.assign(file, updateFileDto);
    const updatedFile = await this.fileRepository.save(file);

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.UPDATE,
      HistoryEntityType.FILE,
      file.id,
      null,
      updateFileDto,
      `Обновлены метаданные файла "${file.originalName}"`,
    );

    return updatedFile;
  }

  /**
   * Удаление файла
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    const file = await this.findOne(id);

    // Записываем в историю перед удалением
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.FILE_DELETE,
      HistoryEntityType.ORDER,
      file.order.id,
      {
        fileName: file.originalName,
        fileType: file.type,
      },
      null,
      `Удален файл "${file.originalName}"`,
    );

    // Удаляем физический файл
    try {
      if (fs.existsSync(file.filePath)) {
        await unlinkAsync(file.filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    // Обновляем счетчик файлов в заказе
    const order = file.order;
    if (order.filesCount > 0) {
      order.filesCount -= 1;
      await this.orderRepository.save(order);
    }

    await this.fileRepository.remove(file);
  }

  /**
   * Отслеживание загрузки файла
   */
  async trackDownload(id: string): Promise<File> {
    const file = await this.findOne(id);

    file.downloadCount += 1;
    file.lastDownloadedAt = new Date();

    return await this.fileRepository.save(file);
  }

  /**
   * Определение типа файла по MIME type
   */
  private detectFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'photo';
    }

    if (mimeType === 'application/pdf') {
      return 'document';
    }

    const drawingTypes = [
      'application/x-autocad',
      'application/acad',
      'application/dwg',
      'image/vnd.dwg',
    ];
    if (drawingTypes.includes(mimeType)) {
      return 'drawing';
    }

    return 'other';
  }

  /**
   * Получение статистики по файлам
   */
  async getStatistics(orderId?: string): Promise<any> {
    const queryBuilder = this.fileRepository.createQueryBuilder('file');

    if (orderId) {
      queryBuilder.where('file.order.id = :orderId', { orderId });
    }

    const [
      total,
      totalSize,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.select('SUM(file.fileSize)', 'totalSize').getRawOne(),
    ]);

    // Статистика по типам файлов
    const byTypeRaw = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('file.type')
      .getRawMany();

    const byType: Record<string, number> = {};
    byTypeRaw.forEach((item) => {
      byType[item.type] = parseInt(item.count);
    });

    return {
      total,
      totalSizeMB: Math.round((totalSize?.totalSize || 0) / (1024 * 1024) * 100) / 100,
      byType,
    };
  }
}
