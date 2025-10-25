import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RalColor } from '../entities/ral-color.entity';
import { ReferencesService } from './references.service';
import { CreateRalColorDto } from '../dto/ral-color/create-ral-color.dto';
import { UpdateRalColorDto } from '../dto/ral-color/update-ral-color.dto';
import { QueryRalColorDto } from '../dto/ral-color/query-ral-color.dto';

@Injectable()
export class RalColorsService extends ReferencesService<RalColor> {
  constructor(
    @InjectRepository(RalColor)
    private readonly ralColorRepository: Repository<RalColor>,
  ) {
    super(ralColorRepository, 'Цвет RAL', ['code', 'name', 'description']);
  }

  /**
   * Создание нового цвета с проверкой уникальности кода
   */
  async create(createDto: CreateRalColorDto): Promise<RalColor> {
    await this.checkUniqueness('code', createDto.code);
    return await super.create(createDto);
  }

  /**
   * Обновление цвета с проверкой уникальности кода
   */
  async update(id: string, updateDto: UpdateRalColorDto): Promise<RalColor> {
    if (updateDto.code) {
      await this.checkUniqueness('code', updateDto.code, id);
    }
    return await super.update(id, updateDto);
  }

  /**
   * Получение списка цветов с фильтрацией
   */
  async findAll(queryDto: QueryRalColorDto) {
    return await super.findAll(queryDto);
  }
}
