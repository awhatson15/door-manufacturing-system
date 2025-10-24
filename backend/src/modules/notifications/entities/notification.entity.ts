import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_OVERDUE = 'order_overdue',
  STAGE_STARTED = 'stage_started',
  STAGE_COMPLETED = 'stage_completed',
  STAGE_OVERDUE = 'stage_overdue',
  COMMENT_ADDED = 'comment_added',
  FILE_UPLOADED = 'file_uploaded',
  CUSTOMER_ACCESS_GRANTED = 'customer_access_granted',
  CUSTOMER_ACCESS_REVOKED = 'customer_access_revoked',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  TELEGRAM = 'telegram',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('notifications')
@Index(['order'])
@Index(['recipient'])
@Index(['customer'])
@Index(['type'])
@Index(['status'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true })
  readAt?: Date;

  @Column({ name: 'sent_at', nullable: true })
  sentAt?: Date;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  @Column({ name: 'next_retry_at', nullable: true })
  nextRetryAt?: Date;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @Column({ name: 'external_id', nullable: true })
  externalId?: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData: Record<string, any>;

  @Column({ name: 'is_priority', default: false })
  isPriority: boolean;

  // Relations
  @ManyToOne(() => Order, (order) => order.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient?: User;

  @ManyToOne(() => Customer, (customer) => customer.id, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  get isSent(): boolean {
    return this.status === NotificationStatus.SENT;
  }

  get isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === NotificationStatus.CANCELLED;
  }

  get canRetry(): boolean {
    return this.isFailed && this.retryCount < this.maxRetries;
  }

  get shouldRetry(): boolean {
    return this.canRetry && (!this.nextRetryAt || this.nextRetryAt <= new Date());
  }

  get recipientName(): string {
    if (this.recipient) {
      return this.recipient.fullName;
    }
    if (this.customer) {
      return this.customer.displayName;
    }
    return 'Неизвестный получатель';
  }

  get typeText(): string {
    switch (this.type) {
      case NotificationType.ORDER_CREATED: return 'Заявка создана';
      case NotificationType.ORDER_UPDATED: return 'Заявка обновлена';
      case NotificationType.ORDER_STATUS_CHANGED: return 'Статус заявки изменён';
      case NotificationType.ORDER_COMPLETED: return 'Заявка завершена';
      case NotificationType.ORDER_CANCELLED: return 'Заявка отменена';
      case NotificationType.ORDER_OVERDUE: return 'Заявка просрочена';
      case NotificationType.STAGE_STARTED: return 'Этап начат';
      case NotificationType.STAGE_COMPLETED: return 'Этап завершён';
      case NotificationType.STAGE_OVERDUE: return 'Этап просрочен';
      case NotificationType.COMMENT_ADDED: return 'Добавлен комментарий';
      case NotificationType.FILE_UPLOADED: return 'Загружен файл';
      case NotificationType.CUSTOMER_ACCESS_GRANTED: return 'Доступ заказчика предоставлен';
      case NotificationType.CUSTOMER_ACCESS_REVOKED: return 'Доступ заказчика отозван';
      case NotificationType.SYSTEM_ALERT: return 'Системное уведомление';
      default: return this.type;
    }
  }

  get channelText(): string {
    switch (this.channel) {
      case NotificationChannel.EMAIL: return 'Email';
      case NotificationChannel.SMS: return 'SMS';
      case NotificationChannel.TELEGRAM: return 'Telegram';
      case NotificationChannel.IN_APP: return 'В приложении';
      default: return this.channel;
    }
  }

  get statusText(): string {
    switch (this.status) {
      case NotificationStatus.PENDING: return 'Ожидает отправки';
      case NotificationStatus.SENT: return 'Отправлено';
      case NotificationStatus.FAILED: return 'Ошибка отправки';
      case NotificationStatus.CANCELLED: return 'Отменено';
      default: return this.status;
    }
  }
}
