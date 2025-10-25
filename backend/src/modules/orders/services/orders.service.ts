import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like, In, EntityManager } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderStage, OrderStageStatus } from '../entities/order-stage.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { Stage } from '../../stages/entities/stage.entity';
import { DoorType } from '../../references/entities/door-type.entity';
import { RalColor } from '../../references/entities/ral-color.entity';
import { Lock } from '../../references/entities/lock.entity';
import { Threshold } from '../../references/entities/threshold.entity';
import { CancelReason } from '../../references/entities/cancel-reason.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';
import { PaginatedOrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderStageDto } from '../dto/create-order-stage.dto';
import { UpdateOrderStageDto } from '../dto/update-order-stage.dto';
import { UpdateOrderStageStatusDto } from '../dto/update-order-stage-status.dto';
import { AssignOrderStageDto } from '../dto/assign-order-stage.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction, HistoryEntityType } from '../../history/entities/history.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStage)
    private readonly orderStageRepository: Repository<OrderStage>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Stage)
    private readonly stageRepository: Repository<Stage>,
    private readonly historyService: HistoryService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Создание новой заявки
   */
  async create(createOrderDto: CreateOrderDto, currentUserId?: string): Promise<Order> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      const {
        customerId,
        managerId,
        doorTypeId,
        colorId,
        lockId,
        thresholdId,
        ...orderData
      } = createOrderDto;

      // Проверяем существование заказчика
      const customer = await transactionalEntityManager.findOne(Customer, { where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Заказчик не найден');
      }

      // Определяем менеджера (из DTO или текущий пользователь)
      let manager: User;
      if (managerId) {
        manager = await transactionalEntityManager.findOne(User, { where: { id: managerId } });
        if (!manager) {
          throw new NotFoundException('Менеджер не найден');
        }
      } else if (currentUserId) {
        manager = await transactionalEntityManager.findOne(User, { where: { id: currentUserId } });
        if (!manager) {
          throw new NotFoundException('Текущий пользователь не найден');
        }
      } else {
        throw new BadRequestException('Необходимо указать менеджера');
      }

      // Загружаем справочники, если указаны
      let doorType: DoorType | undefined;
      if (doorTypeId) {
        doorType = await transactionalEntityManager.findOne(DoorType, { where: { id: doorTypeId } });
        if (!doorType) {
          throw new NotFoundException('Тип двери не найден');
        }
      }

      let color: RalColor | undefined;
      if (colorId) {
        color = await transactionalEntityManager.findOne(RalColor, { where: { id: colorId } });
        if (!color) {
          throw new NotFoundException('Цвет RAL не найден');
        }
      }

      let lock: Lock | undefined;
      if (lockId) {
        lock = await transactionalEntityManager.findOne(Lock, { where: { id: lockId } });
        if (!lock) {
          throw new NotFoundException('Замок не найден');
        }
      }

      let threshold: Threshold | undefined;
      if (thresholdId) {
        threshold = await transactionalEntityManager.findOne(Threshold, { where: { id: thresholdId } });
        if (!threshold) {
          throw new NotFoundException('Порог не найден');
        }
      }

      // Проверяем уникальность mainNumber, если указан
      if (orderData.mainNumber) {
        const existingOrder = await transactionalEntityManager.findOne(Order, {
          where: { mainNumber: orderData.mainNumber },
        });
        if (existingOrder) {
          throw new ConflictException('Заявка с таким основным номером уже существует');
        }
      }

      // Генерируем внутренний номер
      const internalNumber = await this.generateInternalNumber(transactionalEntityManager);

      // Создаем заявку
      const order = transactionalEntityManager.create(Order, {
        ...orderData,
        internalNumber,
        customer,
        manager,
        doorType,
        color,
        lock,
        threshold,
        status: OrderStatus.NEW,
        paidAmount: orderData.paidAmount || 0,
        isPaid: orderData.isPaid || false,
        isCancelled: false,
        isPaused: false,
        commentsCount: 0,
        filesCount: 0,
        stagesCount: 0,
        completedStagesCount: 0,
      });

      const savedOrder = await transactionalEntityManager.save(order);

      // Записываем в историю
      if (currentUserId) {
        await this.historyService.recordAction(
          currentUserId,
          HistoryAction.CREATE,
          HistoryEntityType.ORDER,
          savedOrder.id,
          null,
          {
            internalNumber: savedOrder.internalNumber,
            mainNumber: savedOrder.mainNumber,
            status: savedOrder.status,
            doorType: savedOrder.doorType,
          },
          `Создана заявка ${savedOrder.displayName}`,
        );
      }

      return savedOrder;
    });
  }

  /**
   * Получение списка заявок с фильтрацией и пагинацией
   */
  async findAll(queryDto: QueryOrderDto): Promise<PaginatedOrderResponseDto> {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      managerId,
      doorType,
      search,
      createdFrom,
      createdTo,
      onlyCancelled,
      onlyPaused,
      onlyOverdue,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const skip = (page - 1) * limit;

    // Whitelist of allowed sort fields
    const allowedSortByFields = ['createdAt', 'internalNumber', 'mainNumber', 'status', 'doorType', 'plannedCompletionDate', 'totalAmount'];
    const safeSortBy = allowedSortByFields.includes(sortBy) ? sortBy : 'createdAt';

    // Строим запрос
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.manager', 'manager')
      .leftJoinAndSelect('order.doorType', 'doorType')
      .leftJoinAndSelect('order.color', 'color')
      .leftJoinAndSelect('order.lock', 'lock')
      .leftJoinAndSelect('order.threshold', 'threshold')
      .leftJoinAndSelect('order.cancelReason', 'cancelReason')
      .skip(skip)
      .take(limit);

    // Фильтрация
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customer.id = :customerId', { customerId });
    }

    if (managerId) {
      queryBuilder.andWhere('order.manager.id = :managerId', { managerId });
    }

    if (doorType) {
      queryBuilder.andWhere('order.doorType = :doorType', { doorType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.internalNumber ILIKE :search OR order.mainNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (createdFrom) {
      queryBuilder.andWhere('order.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      queryBuilder.andWhere('order.createdAt <= :createdTo', { createdTo });
    }

    if (onlyCancelled) {
      queryBuilder.andWhere('order.isCancelled = :isCancelled', { isCancelled: true });
    }

    if (onlyPaused) {
      queryBuilder.andWhere('order.isPaused = :isPaused', { isPaused: true });
    }

    if (onlyOverdue) {
      queryBuilder.andWhere('order.plannedCompletionDate < :now', { now: new Date() });
      queryBuilder.andWhere('order.isCancelled = :isCancelled', { isCancelled: false });
      queryBuilder.andWhere('order.isPaused = :isPaused', { isPaused: false });
    }

    // Сортировка
    queryBuilder.orderBy(`order.${safeSortBy}`, sortOrder);

    // Выполняем запрос
    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получение заявки по ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'manager',
        'orderStages',
        'orderStages.stage',
        'doorType',
        'color',
        'lock',
        'threshold',
        'cancelReason',
      ],
    });

    if (!order) {
      throw new NotFoundException('Заявка не найдена');
    }

    return order;
  }

  /**
   * Обновление заявки
   */
  async update(id: string, updateOrderDto: UpdateOrderDto, currentUserId?: string): Promise<Order> {
    const order = await this.findOne(id);
    const {
      customerId,
      managerId,
      doorTypeId,
      colorId,
      lockId,
      thresholdId,
      cancelReasonId,
      ...updateData
    } = updateOrderDto;

    // Сохраняем старые значения для истории
    const oldValues = { ...order };

    // Обновляем заказчика, если указан
    if (customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Заказчик не найден');
      }
      order.customer = customer;
    }

    // Обновляем менеджера, если указан
    if (managerId) {
      const manager = await this.userRepository.findOne({ where: { id: managerId } });
      if (!manager) {
        throw new NotFoundException('Менеджер не найден');
      }
      order.manager = manager;
    }

    // Обновляем тип двери, если указан
    if (doorTypeId !== undefined) {
      if (doorTypeId === null) {
        order.doorType = null;
      } else {
        const doorType = await this.entityManager.findOne(DoorType, { where: { id: doorTypeId } });
        if (!doorType) {
          throw new NotFoundException('Тип двери не найден');
        }
        order.doorType = doorType;
      }
    }

    // Обновляем цвет, если указан
    if (colorId !== undefined) {
      if (colorId === null) {
        order.color = null;
      } else {
        const color = await this.entityManager.findOne(RalColor, { where: { id: colorId } });
        if (!color) {
          throw new NotFoundException('Цвет RAL не найден');
        }
        order.color = color;
      }
    }

    // Обновляем замок, если указан
    if (lockId !== undefined) {
      if (lockId === null) {
        order.lock = null;
      } else {
        const lock = await this.entityManager.findOne(Lock, { where: { id: lockId } });
        if (!lock) {
          throw new NotFoundException('Замок не найден');
        }
        order.lock = lock;
      }
    }

    // Обновляем порог, если указан
    if (thresholdId !== undefined) {
      if (thresholdId === null) {
        order.threshold = null;
      } else {
        const threshold = await this.entityManager.findOne(Threshold, { where: { id: thresholdId } });
        if (!threshold) {
          throw new NotFoundException('Порог не найден');
        }
        order.threshold = threshold;
      }
    }

    // Обновляем причину отмены, если указана
    if (cancelReasonId !== undefined) {
      if (cancelReasonId === null) {
        order.cancelReason = null;
      } else {
        const cancelReason = await this.entityManager.findOne(CancelReason, { where: { id: cancelReasonId } });
        if (!cancelReason) {
          throw new NotFoundException('Причина отмены не найдена');
        }
        order.cancelReason = cancelReason;
      }
    }

    // Проверяем уникальность mainNumber, если изменяется
    if (updateData.mainNumber && updateData.mainNumber !== order.mainNumber) {
      const existingOrder = await this.orderRepository.findOne({
        where: { mainNumber: updateData.mainNumber },
      });
      if (existingOrder && existingOrder.id !== id) {
        throw new ConflictException('Заявка с таким основным номером уже существует');
      }
    }

    // Применяем изменения
    Object.assign(order, updateData);

    const updatedOrder = await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      const changes = this.getChangedFields(oldValues, updatedOrder);
      if (Object.keys(changes).length > 0) {
        await this.historyService.recordAction(
          currentUserId,
          HistoryAction.UPDATE,
          HistoryEntityType.ORDER,
          updatedOrder.id,
          changes.old,
          changes.new,
          `Обновлена заявка ${updatedOrder.displayName}`,
        );
      }
    }

    return updatedOrder;
  }

  /**
   * Вспомогательный метод для определения изменившихся полей
   */
  private getChangedFields(oldValues: any, newValues: any): { old: any; new: any } {
    const old: any = {};
    const newObj: any = {};
    const fieldsToTrack = [
      'mainNumber',
      'status',
      'doorType',
      'dimensions',
      'colorCoating',
      'shieldNumber',
      'managerComment',
      'plannedCompletionDate',
      'deliveryType',
      'totalAmount',
      'paidAmount',
      'isPaid',
    ];

    fieldsToTrack.forEach((field) => {
      if (oldValues[field] !== newValues[field]) {
        old[field] = oldValues[field];
        newObj[field] = newValues[field];
      }
    });

    return { old, new: newObj };
  }

  /**
   * Удаление заявки
   */
  async remove(id: string, currentUserId?: string): Promise<void> {
    const order = await this.findOne(id);

    // Записываем в историю перед удалением
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.DELETE,
        HistoryEntityType.ORDER,
        order.id,
        {
          internalNumber: order.internalNumber,
          mainNumber: order.mainNumber,
          status: order.status,
        },
        null,
        `Удалена заявка ${order.displayName}`,
      );
    }

    await this.orderRepository.remove(order);
  }

  /**
   * Отмена заявки
   */
  async cancel(id: string, reason: string, currentUserId?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.isCancelled) {
      throw new BadRequestException('Заявка уже отменена');
    }

    order.isCancelled = true;
    order.cancelReason = reason;
    order.status = OrderStatus.CANCELLED;

    const savedOrder = await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STATUS_CHANGE,
        HistoryEntityType.ORDER,
        savedOrder.id,
        { status: OrderStatus.IN_PROGRESS, isCancelled: false },
        { status: OrderStatus.CANCELLED, isCancelled: true, cancelReason: reason },
        `Отменена заявка ${savedOrder.displayName}: ${reason}`,
      );
    }

    return savedOrder;
  }

  /**
   * Приостановка заявки
   */
  async pause(id: string, reason: string, currentUserId?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.isPaused) {
      throw new BadRequestException('Заявка уже приостановлена');
    }

    if (order.isCancelled) {
      throw new BadRequestException('Нельзя приостановить отмененную заявку');
    }

    const oldStatus = order.status;
    order.isPaused = true;
    order.pauseReason = reason;
    order.status = OrderStatus.PAUSED;

    const savedOrder = await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.UPDATE,
        HistoryEntityType.ORDER,
        savedOrder.id,
        { status: oldStatus, isPaused: false },
        { status: OrderStatus.PAUSED, isPaused: true, pauseReason: reason },
        `Приостановлена заявка ${savedOrder.displayName}: ${reason}`,
      );
    }

    return savedOrder;
  }

  /**
   * Возобновление заявки
   */
  async resume(id: string, currentUserId?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (!order.isPaused) {
      throw new BadRequestException('Заявка не приостановлена');
    }

    order.isPaused = false;
    order.pauseReason = null;
    order.status = OrderStatus.IN_PROGRESS;

    const savedOrder = await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.UPDATE,
        HistoryEntityType.ORDER,
        savedOrder.id,
        { status: OrderStatus.PAUSED, isPaused: true },
        { status: OrderStatus.IN_PROGRESS, isPaused: false },
        `Возобновлена заявка ${savedOrder.displayName}`,
      );
    }

    return savedOrder;
  }

  /**
   * Завершение заявки
   */
  async complete(id: string, currentUserId?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.isCancelled) {
      throw new BadRequestException('Нельзя завершить отмененную заявку');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Заявка уже завершена');
    }

    const oldStatus = order.status;
    order.status = OrderStatus.COMPLETED;
    order.completionDate = new Date();

    const savedOrder = await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STATUS_CHANGE,
        HistoryEntityType.ORDER,
        savedOrder.id,
        { status: oldStatus },
        { status: OrderStatus.COMPLETED, completionDate: savedOrder.completionDate },
        `Завершена заявка ${savedOrder.displayName}`,
      );
    }

    return savedOrder;
  }

  /**
   * Получение статистики по заявкам
   */
  async getStatistics(managerId?: string): Promise<any> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (managerId) {
      queryBuilder.where('order.manager.id = :managerId', { managerId });
    }

    const [
      total,
      newCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      pausedCount,
      overdueCount,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.NEW }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.IN_PROGRESS }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('order.isCancelled = :isCancelled', { isCancelled: true }).getCount(),
      queryBuilder.clone().andWhere('order.isPaused = :isPaused', { isPaused: true }).getCount(),
      queryBuilder.clone()
        .andWhere('order.plannedCompletionDate < :now', { now: new Date() })
        .andWhere('order.isCancelled = :isCancelled', { isCancelled: false })
        .andWhere('order.status != :status', { status: OrderStatus.COMPLETED })
        .getCount(),
    ]);

    return {
      total,
      new: newCount,
      inProgress: inProgressCount,
      completed: completedCount,
      cancelled: cancelledCount,
      paused: pausedCount,
      overdue: overdueCount,
    };
  }

  /**
   * Генерация внутреннего номера заявки
   */
  private async generateInternalNumber(entityManager: EntityManager): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${year}-`;

    // Находим последний номер за текущий год с блокировкой
    const lastOrder = await entityManager
      .createQueryBuilder(Order, 'order')
      .setLock('pessimistic_write')
      .where('order.internalNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.internalNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastOrder) {
      // Извлекаем номер из формата YYYY-XXXX
      const parts = lastOrder.internalNumber.split('-');
      if (parts.length === 2) {
        const lastNumber = parseInt(parts[1]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  // ==================== OrderStages Management ====================

  /**
   * Получение всех этапов заказа
   */
  async getOrderStages(orderId: string): Promise<OrderStage[]> {
    await this.findOne(orderId); // Проверка существования заказа

    return await this.orderStageRepository.find({
      where: { order: { id: orderId } },
      relations: ['stage', 'assignee'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Получение конкретного этапа заказа
   */
  async getOrderStage(orderId: string, stageId: string): Promise<OrderStage> {
    const orderStage = await this.orderStageRepository.findOne({
      where: { id: stageId, order: { id: orderId } },
      relations: ['stage', 'assignee', 'order'],
    });

    if (!orderStage) {
      throw new NotFoundException('Этап заказа не найден');
    }

    return orderStage;
  }

  /**
   * Добавление этапа к заказу
   */
  async addOrderStage(
    orderId: string,
    createOrderStageDto: CreateOrderStageDto,
    currentUserId?: string,
  ): Promise<OrderStage> {
    const order = await this.findOne(orderId);
    const { stageId, assigneeId, ...stageData } = createOrderStageDto;

    // Проверяем существование этапа производства
    const stage = await this.stageRepository.findOne({ where: { id: stageId } });
    if (!stage) {
      throw new NotFoundException('Этап производства не найден');
    }

    // Проверяем назначенного исполнителя, если указан
    let assignee: User | undefined;
    if (assigneeId) {
      assignee = await this.userRepository.findOne({ where: { id: assigneeId } });
      if (!assignee) {
        throw new NotFoundException('Исполнитель не найден');
      }
    }

    // Создаем этап заказа
    const orderStage = this.orderStageRepository.create({
      ...stageData,
      order,
      stage,
      assignee,
      status: OrderStageStatus.PENDING,
    });

    const savedOrderStage = await this.orderStageRepository.save(orderStage);

    // Обновляем счетчик этапов в заказе
    order.stagesCount += 1;
    await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        order.id,
        null,
        { stageAdded: stage.name },
        `Добавлен этап "${stage.name}" к заявке ${order.displayName}`,
      );
    }

    return savedOrderStage;
  }

  /**
   * Обновление этапа заказа
   */
  async updateOrderStage(
    orderId: string,
    stageId: string,
    updateOrderStageDto: UpdateOrderStageDto,
    currentUserId?: string,
  ): Promise<OrderStage> {
    const orderStage = await this.getOrderStage(orderId, stageId);
    const { assigneeId, ...updateData } = updateOrderStageDto;

    // Обновляем исполнителя, если указан
    if (assigneeId) {
      const assignee = await this.userRepository.findOne({ where: { id: assigneeId } });
      if (!assignee) {
        throw new NotFoundException('Исполнитель не найден');
      }
      orderStage.assignee = assignee;
    }

    // Применяем изменения
    Object.assign(orderStage, updateData);

    const updatedOrderStage = await this.orderStageRepository.save(orderStage);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        null,
        { stageUpdated: orderStage.stage.name },
        `Обновлен этап "${orderStage.stage.name}" в заявке ${orderStage.order.displayName}`,
      );
    }

    return updatedOrderStage;
  }

  /**
   * Удаление этапа из заказа
   */
  async removeOrderStage(orderId: string, stageId: string, currentUserId?: string): Promise<void> {
    const orderStage = await this.getOrderStage(orderId, stageId);
    const order = orderStage.order;
    const stageName = orderStage.stage.name;

    // Записываем в историю перед удалением
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        { stageRemoved: stageName },
        null,
        `Удален этап "${stageName}" из заявки ${order.displayName}`,
      );
    }

    await this.orderStageRepository.remove(orderStage);

    // Обновляем счетчик этапов в заказе
    if (order.stagesCount > 0) {
      order.stagesCount -= 1;
      if (orderStage.status === OrderStageStatus.COMPLETED && order.completedStagesCount > 0) {
        order.completedStagesCount -= 1;
      }
      await this.orderRepository.save(order);
    }
  }

  /**
   * Начало работы над этапом
   */
  async startOrderStage(orderId: string, stageId: string, currentUserId?: string): Promise<OrderStage> {
    const orderStage = await this.getOrderStage(orderId, stageId);

    if (orderStage.status === OrderStageStatus.IN_PROGRESS) {
      throw new BadRequestException('Этап уже в работе');
    }

    if (orderStage.status === OrderStageStatus.COMPLETED) {
      throw new BadRequestException('Этап уже завершен');
    }

    orderStage.status = OrderStageStatus.IN_PROGRESS;
    orderStage.startedAt = new Date();

    const updatedOrderStage = await this.orderStageRepository.save(orderStage);

    // Обновляем статус заказа, если нужно
    const order = orderStage.order;
    if (order.status === OrderStatus.NEW) {
      order.status = OrderStatus.IN_PROGRESS;
      await this.orderRepository.save(order);
    }

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        { stageStatus: OrderStageStatus.PENDING },
        { stageStatus: OrderStageStatus.IN_PROGRESS },
        `Начата работа над этапом "${orderStage.stage.name}" в заявке ${order.displayName}`,
      );
    }

    return updatedOrderStage;
  }

  /**
   * Завершение этапа
   */
  async completeOrderStage(orderId: string, stageId: string, currentUserId?: string): Promise<OrderStage> {
    const orderStage = await this.getOrderStage(orderId, stageId);

    if (orderStage.status === OrderStageStatus.COMPLETED) {
      throw new BadRequestException('Этап уже завершен');
    }

    if (orderStage.status === OrderStageStatus.SKIPPED) {
      throw new BadRequestException('Нельзя завершить пропущенный этап');
    }

    const wasInProgress = orderStage.status === OrderStageStatus.IN_PROGRESS;
    orderStage.status = OrderStageStatus.COMPLETED;
    orderStage.completedAt = new Date();

    // Рассчитываем фактическую длительность, если был startedAt
    if (orderStage.startedAt) {
      const duration = (orderStage.completedAt.getTime() - orderStage.startedAt.getTime()) / (1000 * 60 * 60);
      orderStage.actualDurationHours = duration;
    }

    const updatedOrderStage = await this.orderStageRepository.save(orderStage);

    // Обновляем счетчик завершенных этапов в заказе
    const order = orderStage.order;
    order.completedStagesCount += 1;

    // Если все этапы завершены, обновляем статус заказа
    if (order.completedStagesCount >= order.stagesCount && order.status !== OrderStatus.COMPLETED) {
      order.status = OrderStatus.COMPLETED;
      order.completionDate = new Date();
    }

    await this.orderRepository.save(order);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        { stageStatus: wasInProgress ? OrderStageStatus.IN_PROGRESS : OrderStageStatus.PENDING },
        { stageStatus: OrderStageStatus.COMPLETED },
        `Завершен этап "${orderStage.stage.name}" в заявке ${order.displayName}`,
      );
    }

    return updatedOrderStage;
  }

  /**
   * Пропуск этапа
   */
  async skipOrderStage(
    orderId: string,
    stageId: string,
    reason: string,
    currentUserId?: string,
  ): Promise<OrderStage> {
    const orderStage = await this.getOrderStage(orderId, stageId);

    if (orderStage.status === OrderStageStatus.COMPLETED) {
      throw new BadRequestException('Нельзя пропустить завершенный этап');
    }

    if (orderStage.status === OrderStageStatus.SKIPPED) {
      throw new BadRequestException('Этап уже пропущен');
    }

    orderStage.status = OrderStageStatus.SKIPPED;
    orderStage.skipReason = reason;

    const updatedOrderStage = await this.orderStageRepository.save(orderStage);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        { stageStatus: orderStage.status },
        { stageStatus: OrderStageStatus.SKIPPED, skipReason: reason },
        `Пропущен этап "${orderStage.stage.name}" в заявке ${orderStage.order.displayName}: ${reason}`,
      );
    }

    return updatedOrderStage;
  }

  /**
   * Назначение исполнителя на этап
   */
  async assignOrderStage(
    orderId: string,
    stageId: string,
    assignDto: AssignOrderStageDto,
    currentUserId?: string,
  ): Promise<OrderStage> {
    const orderStage = await this.getOrderStage(orderId, stageId);

    const assignee = await this.userRepository.findOne({ where: { id: assignDto.assigneeId } });
    if (!assignee) {
      throw new NotFoundException('Исполнитель не найден');
    }

    orderStage.assignee = assignee;
    if (assignDto.comment) {
      orderStage.assigneeComment = assignDto.comment;
    }

    const updatedOrderStage = await this.orderStageRepository.save(orderStage);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STAGE_CHANGE,
        HistoryEntityType.ORDER,
        orderId,
        null,
        { assignee: assignee.email },
        `Назначен исполнитель ${assignee.email} на этап "${orderStage.stage.name}" в заявке ${orderStage.order.displayName}`,
      );
    }

    return updatedOrderStage;
  }
}
