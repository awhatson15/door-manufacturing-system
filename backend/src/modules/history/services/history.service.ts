import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History, HistoryAction, HistoryEntityType } from '../entities/history.entity';

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
}
