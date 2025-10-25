import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any;
}

@Injectable()
export class ReferencesService<T extends { id: string; active?: boolean }> {
  constructor(
    private readonly repository: Repository<T>,
    private readonly entityName: string,
    private readonly searchFields: string[] = ['name'],
  ) {}

  /**
   * Получение списка записей с пагинацией и фильтрацией
   */
  async findAll(queryOptions: QueryOptions): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 10,
      search,
      active,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = queryOptions;

    const queryBuilder = this.repository.createQueryBuilder('entity');

    // Фильтр по активности
    if (active !== undefined) {
      queryBuilder.andWhere('entity.active = :active', { active });
    }

    // Поиск по указанным полям
    if (search && this.searchFields.length > 0) {
      const searchConditions = this.searchFields
        .map((field) => `entity.${field} ILIKE :search`)
        .join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${search}%` });
    }

    // Дополнительные фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    });

    // Сортировка
    const orderColumn = `entity.${sortBy}`;
    queryBuilder.orderBy(orderColumn, sortOrder);

    // Пагинация
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

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
   * Получение одной записи по ID
   */
  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as FindOptionsWhere<T> });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} не найден`);
    }

    return entity;
  }

  /**
   * Создание новой записи
   */
  async create(createDto: Partial<T>): Promise<T> {
    const entity = this.repository.create(createDto as any);
    return await this.repository.save(entity) as unknown as T;
  }

  /**
   * Обновление записи
   */
  async update(id: string, updateDto: Partial<T>): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return await this.repository.save(entity) as unknown as T;
  }

  /**
   * Мягкое удаление записи (установка active = false)
   */
  async softDelete(id: string): Promise<T> {
    const entity = await this.findOne(id);

    if ('active' in entity) {
      (entity as any).active = false;
      return await this.repository.save(entity) as unknown as T;
    }

    throw new Error(`${this.entityName} не поддерживает мягкое удаление`);
  }

  /**
   * Полное удаление записи
   */
  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  /**
   * Проверка уникальности поля
   */
  async checkUniqueness(
    field: string,
    value: string,
    excludeId?: string,
  ): Promise<void> {
    const where: any = { [field]: value };
    const existing = await this.repository.findOne({ where });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `${this.entityName} с таким значением поля "${field}" уже существует`,
      );
    }
  }

  /**
   * Активация/деактивация записи
   */
  async toggleActive(id: string): Promise<T> {
    const entity = await this.findOne(id);

    if ('active' in entity) {
      (entity as any).active = !(entity as any).active;
      return await this.repository.save(entity) as unknown as T;
    }

    throw new Error(`${this.entityName} не поддерживает переключение активности`);
  }

  /**
   * Получение всех активных записей
   */
  async findAllActive(): Promise<T[]> {
    return await this.repository.find({
      where: { active: true } as FindOptionsWhere<T>,
    });
  }
}
