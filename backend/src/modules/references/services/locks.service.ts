import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lock } from '../entities/lock.entity';
import { ReferencesService } from './references.service';
import { CreateLockDto } from '../dto/lock/create-lock.dto';
import { UpdateLockDto } from '../dto/lock/update-lock.dto';
import { QueryLockDto } from '../dto/lock/query-lock.dto';

@Injectable()
export class LocksService extends ReferencesService<Lock> {
  constructor(
    @InjectRepository(Lock)
    private readonly lockRepository: Repository<Lock>,
  ) {
    super(lockRepository, 'Замок', ['model', 'description']);
  }

  /**
   * Создание нового замка с проверкой уникальности модели
   */
  async create(createDto: CreateLockDto): Promise<Lock> {
    await this.checkUniqueness('model', createDto.model);
    return await super.create(createDto);
  }

  /**
   * Обновление замка с проверкой уникальности модели
   */
  async update(id: string, updateDto: UpdateLockDto): Promise<Lock> {
    if (updateDto.model) {
      await this.checkUniqueness('model', updateDto.model, id);
    }
    return await super.update(id, updateDto);
  }

  /**
   * Получение списка замков с фильтрацией
   */
  async findAll(queryDto: QueryLockDto) {
    return await super.findAll(queryDto);
  }
}
