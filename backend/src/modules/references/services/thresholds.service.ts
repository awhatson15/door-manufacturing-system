import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Threshold } from '../entities/threshold.entity';
import { ReferencesService } from './references.service';
import { CreateThresholdDto } from '../dto/threshold/create-threshold.dto';
import { UpdateThresholdDto } from '../dto/threshold/update-threshold.dto';
import { QueryThresholdDto } from '../dto/threshold/query-threshold.dto';

@Injectable()
export class ThresholdsService extends ReferencesService<Threshold> {
  constructor(
    @InjectRepository(Threshold)
    private readonly thresholdRepository: Repository<Threshold>,
  ) {
    super(thresholdRepository, 'Порог', ['material', 'description']);
  }

  /**
   * Создание нового порога
   */
  async create(createDto: CreateThresholdDto): Promise<Threshold> {
    return await super.create(createDto);
  }

  /**
   * Обновление порога
   */
  async update(id: string, updateDto: UpdateThresholdDto): Promise<Threshold> {
    return await super.update(id, updateDto);
  }

  /**
   * Получение списка порогов с фильтрацией
   */
  async findAll(queryDto: QueryThresholdDto) {
    return await super.findAll(queryDto);
  }
}
