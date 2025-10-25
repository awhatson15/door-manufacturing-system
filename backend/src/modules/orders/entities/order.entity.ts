import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderStage } from './order-stage.entity';
import { File } from '../../files/entities/file.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { History } from '../../history/entities/history.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { DoorType } from '../../references/entities/door-type.entity';
import { RalColor } from '../../references/entities/ral-color.entity';
import { Lock } from '../../references/entities/lock.entity';
import { Threshold } from '../../references/entities/threshold.entity';
import { CancelReason } from '../../references/entities/cancel-reason.entity';

export enum OrderStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum DeliveryMethod {
  PICKUP = 'самовывоз',
  DELIVERY = 'доставка',
  DELIVERY_WITH_INSTALLATION = 'доставка+монтаж',
}

@Entity('orders')
@Index(['internalNumber'])
@Index(['mainNumber'])
@Index(['customer'])
@Index(['manager'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internal_number', unique: true })
  internalNumber: string;

  @Column({ name: 'main_number', nullable: true })
  mainNumber?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Customer information
  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Manager information
  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  // Order details - References
  @ManyToOne(() => DoorType, { nullable: true })
  @JoinColumn({ name: 'door_type_id' })
  doorType?: DoorType;

  @Column({ name: 'height_mm', type: 'int', nullable: true })
  heightMm?: number;

  @Column({ name: 'width_mm', type: 'int', nullable: true })
  widthMm?: number;

  @ManyToOne(() => RalColor, { nullable: true })
  @JoinColumn({ name: 'color_id' })
  color?: RalColor;

  @ManyToOne(() => Lock, { nullable: true })
  @JoinColumn({ name: 'lock_id' })
  lock?: Lock;

  @ManyToOne(() => Threshold, { nullable: true })
  @JoinColumn({ name: 'threshold_id' })
  threshold?: Threshold;

  @Column({ name: 'shield_number', nullable: true })
  shieldNumber?: string; // For fireproof doors

  @Column({ name: 'manager_comment', type: 'text', nullable: true })
  managerComment?: string;

  @Column({ name: 'planned_completion_date', type: 'date', nullable: true })
  plannedCompletionDate?: Date;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    nullable: true,
  })
  deliveryMethod?: DeliveryMethod;

  // Order status
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({ name: 'is_cancelled', default: false })
  isCancelled: boolean;

  @ManyToOne(() => CancelReason, { nullable: true })
  @JoinColumn({ name: 'cancel_reason_id' })
  cancelReason?: CancelReason;

  @Column({ name: 'is_paused', default: false })
  isPaused: boolean;

  @Column({ name: 'pause_reason', nullable: true })
  pauseReason?: string;

  // Additional information
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalAmount?: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({ name: 'completion_date', nullable: true })
  completionDate?: Date;

  @Column({ name: 'actual_delivery_date', nullable: true })
  actualDeliveryDate?: Date;

  // Counters for UI
  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @Column({ name: 'files_count', default: 0 })
  filesCount: number;

  @Column({ name: 'stages_count', default: 0 })
  stagesCount: number;

  @Column({ name: 'completed_stages_count', default: 0 })
  completedStagesCount: number;

  // Relations
  @OneToMany(() => OrderStage, (orderStage) => orderStage.order, { cascade: true })
  orderStages: OrderStage[];

  @OneToMany(() => File, (file) => file.order, { cascade: true })
  files: File[];

  @OneToMany(() => Comment, (comment) => comment.order, { cascade: true })
  comments: Comment[];

  @OneToMany(() => History, (history) => history.order, { cascade: true })
  history: History[];

  @OneToMany(() => Notification, (notification) => notification.order)
  notifications: Notification[];

  // Virtual fields
  get isOverdue(): boolean {
    if (!this.plannedCompletionDate || this.isCancelled || this.isPaused) {
      return false;
    }
    return new Date() > this.plannedCompletionDate;
  }

  get completionPercentage(): number {
    if (this.stagesCount === 0) return 0;
    return Math.round((this.completedStagesCount / this.stagesCount) * 100);
  }

  get isCompleted(): boolean {
    return this.status === OrderStatus.COMPLETED || this.completionPercentage === 100;
  }

  get displayName(): string {
    return this.mainNumber || this.internalNumber;
  }

  get statusText(): string {
    if (this.isCancelled) return 'Отменена';
    if (this.isPaused) return 'Приостановлена';
    if (this.isCompleted) return 'Завершена';

    switch (this.status) {
      case OrderStatus.NEW: return 'Новая';
      case OrderStatus.IN_PROGRESS: return 'В работе';
      case OrderStatus.COMPLETED: return 'Завершена';
      default: return this.status;
    }
  }

  get doorTypeText(): string {
    return this.doorType?.name || '';
  }

  get dimensionsText(): string {
    if (!this.heightMm && !this.widthMm) return '';
    return `${this.heightMm || '?'} × ${this.widthMm || '?'} мм`;
  }

  get deliveryMethodText(): string {
    return this.deliveryMethod || '';
  }
}
