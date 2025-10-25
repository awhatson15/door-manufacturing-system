import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancelReason } from '../entities/cancel-reason.entity';
import { ReferencesService } from './references.service';
import { CreateCancelReasonDto } from '../dto/cancel-reason/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from '../dto/cancel-reason/update-cancel-reason.dto';
import { QueryCancelReasonDto } from '../dto/cancel-reason/query-cancel-reason.dto';

@Injectable()
export class CancelReasonsService extends ReferencesService<CancelReason> {
  constructor(
    @InjectRepository(CancelReason)
    private readonly cancelReasonRepository: Repository<CancelReason>,
  ) {
    super(cancelReasonRepository, 'Причина отмены', ['name', 'description']);
  }

  /**
   * Создание новой причины отмены с проверкой уникальности названия
   */
  async create(createDto: CreateCancelReasonDto): Promise<CancelReason> {
    await this.checkUniqueness('name', createDto.name);
    return await super.create(createDto);
  }

  /**
   * Обновление причины отмены с проверкой уникальности названия
   */
  async update(id: string, updateDto: UpdateCancelReasonDto): Promise<CancelReason> {
    if (updateDto.name) {
      await this.checkUniqueness('name', updateDto.name, id);
    }
    return await super.update(id, updateDto);
  }

  /**
   * Получение списка причин отмены с фильтрацией
   */
  async findAll(queryDto: QueryCancelReasonDto) {
    return await super.findAll(queryDto);
  }
}
