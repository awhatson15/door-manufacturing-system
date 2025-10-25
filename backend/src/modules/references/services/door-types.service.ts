import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoorType } from '../entities/door-type.entity';
import { ReferencesService } from './references.service';
import { CreateDoorTypeDto } from '../dto/door-type/create-door-type.dto';
import { UpdateDoorTypeDto } from '../dto/door-type/update-door-type.dto';
import { QueryDoorTypeDto } from '../dto/door-type/query-door-type.dto';

@Injectable()
export class DoorTypesService extends ReferencesService<DoorType> {
  constructor(
    @InjectRepository(DoorType)
    private readonly doorTypeRepository: Repository<DoorType>,
  ) {
    super(doorTypeRepository, 'Тип двери', ['name', 'description']);
  }

  /**
   * Создание нового типа двери с проверкой уникальности названия
   */
  async create(createDto: CreateDoorTypeDto): Promise<DoorType> {
    await this.checkUniqueness('name', createDto.name);
    return await super.create(createDto);
  }

  /**
   * Обновление типа двери с проверкой уникальности названия
   */
  async update(id: string, updateDto: UpdateDoorTypeDto): Promise<DoorType> {
    if (updateDto.name) {
      await this.checkUniqueness('name', updateDto.name, id);
    }
    return await super.update(id, updateDto);
  }

  /**
   * Получение списка типов дверей с фильтрацией
   */
  async findAll(queryDto: QueryDoorTypeDto) {
    return await super.findAll(queryDto);
  }
}
