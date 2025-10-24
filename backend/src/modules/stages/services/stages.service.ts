import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Stage } from '../entities/stage.entity';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { QueryStageDto } from '../dto/query-stage.dto';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly stageRepository: Repository<Stage>,
  ) {}

  /**
   * Создание нового этапа
   */
  async create(createStageDto: CreateStageDto): Promise<Stage> {
    // Проверяем уникальность названия
    const existingStage = await this.stageRepository.findOne({
      where: { name: createStageDto.name },
    });
    if (existingStage) {
      throw new ConflictException('Этап с таким названием уже существует');
    }

    const stage = this.stageRepository.create(createStageDto);
    return await this.stageRepository.save(stage);
  }

  /**
   * Получение списка этапов с фильтрацией
   */
  async findAll(queryDto: QueryStageDto): Promise<Stage[]> {
    const { type, onlyActive, onlyDefault } = queryDto;

    const queryBuilder = this.stageRepository
      .createQueryBuilder('stage')
      .orderBy('stage.order', 'ASC');

    if (type) {
      queryBuilder.andWhere('stage.type = :type', { type });
    }

    if (onlyActive) {
      queryBuilder.andWhere('stage.isActive = :isActive', { isActive: true });
    }

    if (onlyDefault) {
      queryBuilder.andWhere('stage.isDefault = :isDefault', { isDefault: true });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получение этапа по ID
   */
  async findOne(id: string): Promise<Stage> {
    const stage = await this.stageRepository.findOne({ where: { id } });

    if (!stage) {
      throw new NotFoundException('Этап не найден');
    }

    return stage;
  }

  /**
   * Обновление этапа
   */
  async update(id: string, updateStageDto: UpdateStageDto): Promise<Stage> {
    const stage = await this.findOne(id);

    // Проверяем уникальность названия, если изменяется
    if (updateStageDto.name && updateStageDto.name !== stage.name) {
      const existingStage = await this.stageRepository.findOne({
        where: { name: updateStageDto.name },
      });
      if (existingStage && existingStage.id !== id) {
        throw new ConflictException('Этап с таким названием уже существует');
      }
    }

    Object.assign(stage, updateStageDto);
    return await this.stageRepository.save(stage);
  }

  /**
   * Удаление этапа
   */
  async remove(id: string): Promise<void> {
    const stage = await this.findOne(id);

    // Проверяем, используется ли этап в заявках
    const usageCount = await this.stageRepository
      .createQueryBuilder('stage')
      .leftJoin('stage.orderStages', 'orderStage')
      .where('stage.id = :id', { id })
      .getCount();

    if (usageCount > 0) {
      throw new BadRequestException('Нельзя удалить этап, используемый в заявках');
    }

    await this.stageRepository.remove(stage);
  }

  /**
   * Изменение порядка этапов
   */
  async reorder(stageIds: string[]): Promise<Stage[]> {
    const stages = await this.stageRepository.findBy({
      id: In(stageIds),
    });

    if (stages.length !== stageIds.length) {
      throw new BadRequestException('Некоторые этапы не найдены');
    }

    // Обновляем порядок
    const updates = stageIds.map((id, index) => {
      const stage = stages.find(s => s.id === id);
      if (stage) {
        stage.order = index;
        return this.stageRepository.save(stage);
      }
    });

    return await Promise.all(updates.filter(Boolean) as Promise<Stage>[]);
  }

  /**
   * Активация/деактивация этапа
   */
  async toggleActive(id: string): Promise<Stage> {
    const stage = await this.findOne(id);
    stage.isActive = !stage.isActive;
    return await this.stageRepository.save(stage);
  }
}
