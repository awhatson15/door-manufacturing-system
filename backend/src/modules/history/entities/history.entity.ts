import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum HistoryAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  STAGE_CHANGE = 'stage_change',
  FILE_UPLOAD = 'file_upload',
  FILE_DELETE = 'file_delete',
  COMMENT_ADD = 'comment_add',
  COMMENT_EDIT = 'comment_edit',
  COMMENT_DELETE = 'comment_delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_FAILED = 'notification_failed',
}

export enum HistoryEntityType {
  ORDER = 'order',
  CUSTOMER = 'customer',
  USER = 'user',
  STAGE = 'stage',
  FILE = 'file',
  COMMENT = 'comment',
  NOTIFICATION = 'notification',
  ROLE = 'role',
  PERMISSION = 'permission',
}

@Entity('history')
@Index(['entityType', 'entityId'])
@Index(['user'])
@Index(['customer'])
@Index(['action'])
@Index(['createdAt'])
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: HistoryAction,
  })
  action: HistoryAction;

  @Column({
    type: 'enum',
    enum: HistoryEntityType,
  })
  entityType: HistoryEntityType;

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ name: 'entity_name', nullable: true })
  entityName?: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields?: string[];

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  // Relations
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Virtual fields
  get isCreate(): boolean {
    return this.action === HistoryAction.CREATE;
  }

  get isUpdate(): boolean {
    return this.action === HistoryAction.UPDATE;
  }

  get isDelete(): boolean {
    return this.action === HistoryAction.DELETE;
  }

  get isStatusChange(): boolean {
    return this.action === HistoryAction.STATUS_CHANGE;
  }

  get isStageChange(): boolean {
    return this.action === HistoryAction.STAGE_CHANGE;
  }

  get hasChanges(): boolean {
    return !!(this.oldValues || this.newValues || this.changedFields);
  }

  get actorName(): string {
    if (this.isSystem) {
      return 'Система';
    }
    if (this.user) {
      return this.user.fullName;
    }
    if (this.customer) {
      return this.customer.displayName;
    }
    return 'Неизвестный пользователь';
  }

  get actionText(): string {
    switch (this.action) {
      case HistoryAction.CREATE: return 'Создание';
      case HistoryAction.UPDATE: return 'Изменение';
      case HistoryAction.DELETE: return 'Удаление';
      case HistoryAction.STATUS_CHANGE: return 'Изменение статуса';
      case HistoryAction.STAGE_CHANGE: return 'Изменение этапа';
      case HistoryAction.FILE_UPLOAD: return 'Загрузка файла';
      case HistoryAction.FILE_DELETE: return 'Удаление файла';
      case HistoryAction.COMMENT_ADD: return 'Добавление комментария';
      case HistoryAction.COMMENT_EDIT: return 'Редактирование комментария';
      case HistoryAction.COMMENT_DELETE: return 'Удаление комментария';
      case HistoryAction.LOGIN: return 'Вход в систему';
      case HistoryAction.LOGOUT: return 'Выход из системы';
      case HistoryAction.ACCESS_GRANTED: return 'Предоставление доступа';
      case HistoryAction.ACCESS_REVOKED: return 'Отзыв доступа';
      case HistoryAction.NOTIFICATION_SENT: return 'Отправка уведомления';
      case HistoryAction.NOTIFICATION_FAILED: return 'Ошибка отправки уведомления';
      default: return this.action;
    }
  }

  get entityTypeText(): string {
    switch (this.entityType) {
      case HistoryEntityType.ORDER: return 'Заявка';
      case HistoryEntityType.CUSTOMER: return 'Заказчик';
      case HistoryEntityType.USER: return 'Пользователь';
      case HistoryEntityType.STAGE: return 'Этап';
      case HistoryEntityType.FILE: return 'Файл';
      case HistoryEntityType.COMMENT: return 'Комментарий';
      case HistoryEntityType.NOTIFICATION: return 'Уведомление';
      case HistoryEntityType.ROLE: return 'Роль';
      case HistoryEntityType.PERMISSION: return 'Разрешение';
      default: return this.entityType;
    }
  }

  get fullDescription(): string {
    const parts = [this.actionText];

    if (this.entityTypeText) {
      parts.push(this.entityTypeText);
    }

    if (this.entityName) {
      parts.push(`"${this.entityName}"`);
    }

    if (this.description) {
      parts.push(`- ${this.description}`);
    }

    return parts.join(' ');
  }
}
