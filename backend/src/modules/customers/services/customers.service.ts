import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { PaginatedCustomerResponseDto } from '../dto/customer-response.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction, HistoryEntityType } from '../../history/entities/history.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly historyService: HistoryService,
  ) {}

  /**
   * Создание нового заказчика
   */
  async create(createCustomerDto: CreateCustomerDto, currentUserId?: string): Promise<Customer> {
    // Проверяем уникальность email, если указан
    if (createCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: createCustomerDto.email },
      });
      if (existingCustomer) {
        throw new ConflictException('Заказчик с таким email уже существует');
      }
    }

    // Проверяем уникальность ИНН для организаций, если указан
    if (createCustomerDto.companyInn) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { companyInn: createCustomerDto.companyInn },
      });
      if (existingCustomer) {
        throw new ConflictException('Организация с таким ИНН уже существует');
      }
    }

    // Создаем заказчика
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      status: CustomerStatus.ACTIVE,
      totalOrders: 0,
      totalAmount: 0,
      isEmailVerified: false,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.CREATE,
        HistoryEntityType.CUSTOMER,
        savedCustomer.id,
        null,
        {
          customerType: savedCustomer.customerType,
          displayName: savedCustomer.displayName,
        },
        `Создан заказчик ${savedCustomer.displayName}`,
      );
    }

    return savedCustomer;
  }

  /**
   * Получение списка заказчиков с фильтрацией и пагинацией
   */
  async findAll(queryDto: QueryCustomerDto): Promise<PaginatedCustomerResponseDto> {
    const {
      page = 1,
      limit = 10,
      customerType,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const skip = (page - 1) * limit;

    // Строим запрос
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .skip(skip)
      .take(limit);

    // Фильтрация
    if (customerType) {
      queryBuilder.andWhere('customer.customerType = :customerType', { customerType });
    }

    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(customer.companyName ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Сортировка
    queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);

    // Выполняем запрос
    const [customers, total] = await queryBuilder.getManyAndCount();

    return {
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получение заказчика по ID
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!customer) {
      throw new NotFoundException('Заказчик не найден');
    }

    return customer;
  }

  /**
   * Обновление заказчика
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto, currentUserId?: string): Promise<Customer> {
    const customer = await this.findOne(id);

    // Сохраняем старые значения для истории
    const oldValues = { ...customer };

    // Проверяем уникальность email, если изменяется
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Заказчик с таким email уже существует');
      }
    }

    // Проверяем уникальность ИНН, если изменяется
    if (updateCustomerDto.companyInn && updateCustomerDto.companyInn !== customer.companyInn) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { companyInn: updateCustomerDto.companyInn },
      });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Организация с таким ИНН уже существует');
      }
    }

    // Применяем изменения
    Object.assign(customer, updateCustomerDto);

    const updatedCustomer = await this.customerRepository.save(customer);

    // Записываем в историю
    if (currentUserId) {
      const changes = this.getChangedFields(oldValues, updatedCustomer);
      if (Object.keys(changes.old).length > 0) {
        await this.historyService.recordAction(
          currentUserId,
          HistoryAction.UPDATE,
          HistoryEntityType.CUSTOMER,
          updatedCustomer.id,
          changes.old,
          changes.new,
          `Обновлен заказчик ${updatedCustomer.displayName}`,
        );
      }
    }

    return updatedCustomer;
  }

  /**
   * Удаление заказчика
   */
  async remove(id: string, currentUserId?: string): Promise<void> {
    const customer = await this.findOne(id);

    // Проверяем, есть ли у заказчика заявки
    if (customer.totalOrders > 0) {
      throw new BadRequestException('Нельзя удалить заказчика с существующими заявками');
    }

    // Записываем в историю перед удалением
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.DELETE,
        HistoryEntityType.CUSTOMER,
        customer.id,
        {
          displayName: customer.displayName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
        },
        null,
        `Удален заказчик ${customer.displayName}`,
      );
    }

    await this.customerRepository.remove(customer);
  }

  /**
   * Изменение статуса заказчика
   */
  async changeStatus(id: string, status: CustomerStatus, currentUserId?: string): Promise<Customer> {
    const customer = await this.findOne(id);
    const oldStatus = customer.status;

    customer.status = status;
    const updatedCustomer = await this.customerRepository.save(customer);

    // Записываем в историю
    if (currentUserId) {
      await this.historyService.recordAction(
        currentUserId,
        HistoryAction.STATUS_CHANGE,
        HistoryEntityType.CUSTOMER,
        updatedCustomer.id,
        { status: oldStatus },
        { status },
        `Изменен статус заказчика ${updatedCustomer.displayName}: ${oldStatus} → ${status}`,
      );
    }

    return updatedCustomer;
  }

  /**
   * Получение статистики по заказчикам
   */
  async getStatistics(): Promise<any> {
    const [
      total,
      activeCount,
      inactiveCount,
      blacklistedCount,
      individualsCount,
      organizationsCount,
    ] = await Promise.all([
      this.customerRepository.count(),
      this.customerRepository.count({ where: { status: CustomerStatus.ACTIVE } }),
      this.customerRepository.count({ where: { status: CustomerStatus.INACTIVE } }),
      this.customerRepository.count({ where: { status: CustomerStatus.BLACKLISTED } }),
      this.customerRepository.count({ where: { customerType: CustomerType.INDIVIDUAL } }),
      this.customerRepository.count({ where: { customerType: CustomerType.ORGANIZATION } }),
    ]);

    // Топ заказчиков по количеству заявок
    const topByOrders = await this.customerRepository.find({
      order: { totalOrders: 'DESC' },
      take: 10,
    });

    // Топ заказчиков по сумме заявок
    const topByAmount = await this.customerRepository.find({
      order: { totalAmount: 'DESC' },
      take: 10,
    });

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      blacklisted: blacklistedCount,
      individuals: individualsCount,
      organizations: organizationsCount,
      topByOrders: topByOrders.map(c => ({
        id: c.id,
        displayName: c.displayName,
        totalOrders: c.totalOrders,
      })),
      topByAmount: topByAmount.map(c => ({
        id: c.id,
        displayName: c.displayName,
        totalAmount: c.totalAmount,
      })),
    };
  }

  /**
   * Вспомогательный метод для определения изменившихся полей
   */
  private getChangedFields(oldValues: any, newValues: any): { old: any; new: any } {
    const old: any = {};
    const newObj: any = {};
    const fieldsToTrack = [
      'customerType',
      'companyName',
      'companyInn',
      'companyKpp',
      'companyAddress',
      'firstName',
      'lastName',
      'middleName',
      'email',
      'phoneNumber',
      'additionalPhone',
      'address',
      'status',
      'notes',
    ];

    fieldsToTrack.forEach((field) => {
      if (oldValues[field] !== newValues[field]) {
        old[field] = oldValues[field];
        newObj[field] = newValues[field];
      }
    });

    return { old, new: newObj };
  }
}
