import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { Stage } from '../../stages/entities/stage.entity';
import { User } from '../../users/entities/user.entity';

export enum OrderStageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('order_stages')
@Index(['order'])
@Index(['stage'])
@Index(['status'])
export class OrderStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderStages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Stage, { eager: true })
  @JoinColumn({ name: 'stage_id' })
  stage: Stage;

  @Column({
    type: 'enum',
    enum: OrderStageStatus,
    default: OrderStageStatus.PENDING,
  })
  status: OrderStageStatus;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'estimated_duration_hours', nullable: true })
  estimatedDurationHours?: number;

  @Column({ name: 'actual_duration_hours', nullable: true })
  actualDurationHours?: number;

  // Assignee information
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;

  @Column({ name: 'assignee_comment', type: 'text', nullable: true })
  assigneeComment?: string;

  // Additional information
  @Column({ name: 'is_critical_path', default: false })
  isCriticalPath: boolean;

  @Column({ name: 'skip_reason', nullable: true })
  skipReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get isCompleted(): boolean {
    return this.status === OrderStageStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === OrderStageStatus.PENDING;
  }

  get isInProgress(): boolean {
    return this.status === OrderStageStatus.IN_PROGRESS;
  }

  get isSkipped(): boolean {
    return this.status === OrderStageStatus.SKIPPED;
  }

  get duration(): number | null {
    if (!this.startedAt) return null;

    const endTime = this.completedAt || new Date();
    return Math.abs(endTime.getTime() - this.startedAt.getTime()) / (1000 * 60 * 60); // hours
  }

  get isOverdue(): boolean {
    if (!this.startedAt || !this.estimatedDurationHours || this.isCompleted) {
      return false;
    }

    const expectedEndTime = new Date(this.startedAt.getTime() + this.estimatedDurationHours * 60 * 60 * 1000);
    return new Date() > expectedEndTime;
  }

  get statusText(): string {
    switch (this.status) {
      case OrderStageStatus.PENDING: return 'Ожидает';
      case OrderStageStatus.IN_PROGRESS: return 'В работе';
      case OrderStageStatus.COMPLETED: return 'Завершён';
      case OrderStageStatus.SKIPPED: return 'Пропущен';
      default: return this.status;
    }
  }
}
