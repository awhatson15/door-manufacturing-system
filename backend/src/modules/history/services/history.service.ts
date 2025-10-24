import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { History, HistoryAction, HistoryEntityType } from '../entities/history.entity';
import { QueryHistoryDto } from '../dto/query-history.dto';
import { PaginatedHistoryResponseDto, HistoryStatsDto } from '../dto/history-response.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>
  ) {}

  async create(historyData: Partial<History>): Promise<History> {
    const history = this.historyRepository.create(historyData);
    return this.historyRepository.save(history);
  }

  async findAll(entityType?: HistoryEntityType, entityId?: string): Promise<History[]> {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .orderBy('history.createdAt', 'DESC');

    if (entityType) {
      query.andWhere('history.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('history.entityId = :entityId', { entityId });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<History> {
    return this.historyRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByEntity(entityType: HistoryEntityType, entityId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<History[]> {
    return this.historyRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.historyRepository.delete(id);
  }

  async recordAction(
    userId: string,
    action: HistoryAction,
    entityType: HistoryEntityType,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    description?: string
  ): Promise<History> {
    const history = this.historyRepository.create({
      user: { id: userId },
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      description,
    });

    return await this.historyRepository.save(history);
  }

  /**
   * Получение истории с пагинацией и фильтрацией
   */
  async findAllPaginated(queryDto: QueryHistoryDto): Promise<PaginatedHistoryResponseDto> {
    const {
      page = 1,
      limit = 20,
      action,
      entityType,
      entityId,
      userId,
      customerId,
      orderId,
      dateFrom,
      dateTo,
      onlySystem,
      onlyUser,
      sortOrder = 'DESC',
    } = queryDto;

    const skip = (page - 1) * limit;

    // Строим запрос
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .leftJoinAndSelect('history.order', 'order')
      .leftJoinAndSelect('history.customer', 'customer')
      .skip(skip)
      .take(limit);

    // Фильтрация
    if (action) {
      queryBuilder.andWhere('history.action = :action', { action });
    }

    if (entityType) {
      queryBuilder.andWhere('history.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('history.entityId = :entityId', { entityId });
    }

    if (userId) {
      queryBuilder.andWhere('history.user.id = :userId', { userId });
    }

    if (customerId) {
      queryBuilder.andWhere('history.customer.id = :customerId', { customerId });
    }

    if (orderId) {
      queryBuilder.andWhere('history.order.id = :orderId', { orderId });
    }

    if (dateFrom) {
      queryBuilder.andWhere('history.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('history.createdAt <= :dateTo', { dateTo });
    }

    if (onlySystem) {
      queryBuilder.andWhere('history.isSystem = :isSystem', { isSystem: true });
    }

    if (onlyUser) {
      queryBuilder.andWhere('history.isSystem = :isSystem', { isSystem: false });
    }

    // Сортировка
    queryBuilder.orderBy('history.createdAt', sortOrder);

    // Выполняем запрос
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получение статистики по истории
   */
  async getStatistics(userId?: string, dateFrom?: Date, dateTo?: Date): Promise<HistoryStatsDto> {
    const queryBuilder = this.historyRepository.createQueryBuilder('history');

    if (userId) {
      queryBuilder.where('history.user.id = :userId', { userId });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('history.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    }

    const total = await queryBuilder.getCount();

    // Статистика по действиям
    const byActionRaw = await this.historyRepository
      .createQueryBuilder('history')
      .select('history.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.action')
      .getRawMany();

    const byAction: Record<string, number> = {};
    byActionRaw.forEach((item) => {
      byAction[item.action] = parseInt(item.count);
    });

    // Статистика по типам сущностей
    const byEntityTypeRaw = await this.historyRepository
      .createQueryBuilder('history')
      .select('history.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.entityType')
      .getRawMany();

    const byEntityType: Record<string, number> = {};
    byEntityTypeRaw.forEach((item) => {
      byEntityType[item.entityType] = parseInt(item.count);
    });

    // Статистика по периодам
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.createdAt >= :todayStart', { todayStart })
      .getCount();

    const weekCount = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.createdAt >= :weekStart', { weekStart })
      .getCount();

    const monthCount = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.createdAt >= :monthStart', { monthStart })
      .getCount();

    return {
      total,
      byAction,
      byEntityType,
      todayCount,
      weekCount,
      monthCount,
    };
  }

  /**
   * Очистка старой истории
   */
  async cleanOldHistory(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.historyRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
