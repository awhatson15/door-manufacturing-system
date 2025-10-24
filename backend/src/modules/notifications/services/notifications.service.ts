import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../entities/notification.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { QueryNotificationDto } from '../dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * Создание уведомления
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { orderId, recipientId, customerId, ...notificationData } = createNotificationDto;

    let order: Order | undefined;
    let recipient: User | undefined;
    let customer: Customer | undefined;

    if (orderId) {
      order = await this.orderRepository.findOne({ where: { id: orderId } });
    }

    if (recipientId) {
      recipient = await this.userRepository.findOne({ where: { id: recipientId } });
    }

    if (customerId) {
      customer = await this.customerRepository.findOne({ where: { id: customerId } });
    }

    const notification = this.notificationRepository.create({
      ...notificationData,
      order,
      recipient,
      customer,
      status: NotificationStatus.PENDING,
      isRead: false,
      retryCount: 0,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Получение списка уведомлений с фильтрацией и пагинацией
   */
  async findAll(queryDto: QueryNotificationDto): Promise<any> {
    const {
      page = 1,
      limit = 20,
      type,
      channel,
      status,
      recipientId,
      onlyUnread,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.order', 'order')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .leftJoinAndSelect('notification.customer', 'customer')
      .skip(skip)
      .take(limit)
      .orderBy('notification.isPriority', 'DESC')
      .addOrderBy('notification.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (channel) {
      queryBuilder.andWhere('notification.channel = :channel', { channel });
    }

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    if (recipientId) {
      queryBuilder.andWhere('notification.recipient.id = :recipientId', { recipientId });
    }

    if (onlyUnread) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

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
   * Получение уведомления по ID
   */
  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['order', 'recipient', 'customer'],
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return notification;
  }

  /**
   * Пометка уведомления как прочитанного
   */
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  /**
   * Пометка всех уведомлений пользователя как прочитанных
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  /**
   * Удаление уведомления
   */
  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  /**
   * Отправка уведомления
   * TODO: Реализовать интеграцию с Email, SMS, Telegram
   */
  async send(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    try {
      // Здесь должна быть логика отправки через соответствующий канал
      switch (notification.channel) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'telegram':
          await this.sendTelegram(notification);
          break;
        case 'in_app':
          // Для in-app уведомлений просто помечаем как отправленные
          break;
      }

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      notification.retryCount += 1;

      if (notification.canRetry) {
        // Планируем повторную попытку через 5 минут
        notification.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000);
      }
    }

    return await this.notificationRepository.save(notification);
  }

  /**
   * Повторная отправка неудачных уведомлений
   */
  async retryFailed(): Promise<void> {
    const failedNotifications = await this.notificationRepository.find({
      where: { status: NotificationStatus.FAILED },
    });

    for (const notification of failedNotifications) {
      if (notification.shouldRetry) {
        await this.send(notification.id);
      }
    }
  }

  /**
   * Получение количества непрочитанных уведомлений
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        recipient: { id: userId },
        isRead: false,
      },
    });
  }

  /**
   * Получение статистики по уведомлениям
   */
  async getStatistics(): Promise<any> {
    const [
      total,
      sent,
      pending,
      failed,
    ] = await Promise.all([
      this.notificationRepository.count(),
      this.notificationRepository.count({ where: { status: NotificationStatus.SENT } }),
      this.notificationRepository.count({ where: { status: NotificationStatus.PENDING } }),
      this.notificationRepository.count({ where: { status: NotificationStatus.FAILED } }),
    ]);

    return {
      total,
      sent,
      pending,
      failed,
    };
  }

  // Заглушки для интеграций (требуют настройки и установки библиотек)
  private async sendEmail(notification: Notification): Promise<void> {
    // TODO: Реализовать отправку через SMTP (nodemailer)
    console.log('Sending email:', notification.title);
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // TODO: Реализовать отправку через SMS провайдера (Twilio, etc.)
    console.log('Sending SMS:', notification.title);
  }

  private async sendTelegram(notification: Notification): Promise<void> {
    // TODO: Реализовать отправку через Telegram Bot API
    console.log('Sending Telegram:', notification.title);
  }
}
