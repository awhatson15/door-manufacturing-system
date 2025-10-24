import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { OrderStage } from '../../orders/entities/order-stage.entity';

export enum StageType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
}

@Entity('stages')
@Index(['order'])
@Index(['is_active'])
export class Stage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'order', default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: StageType,
    default: StageType.SEQUENTIAL,
  })
  type: StageType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'estimated_duration_hours', nullable: true })
  estimatedDurationHours?: number;

  @Column({ name: 'color_code', nullable: true })
  colorCode?: string;

  @Column({ name: 'icon_name', nullable: true })
  iconName?: string;

  @Column({ type: 'jsonb', nullable: true })
  requirements: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => OrderStage, (orderStage) => orderStage.stage)
  orderStages: OrderStage[];

  // Virtual fields
  get isActiveAndSequential(): boolean {
    return this.isActive && this.type === StageType.SEQUENTIAL;
  }

  get isActiveAndParallel(): boolean {
    return this.isActive && this.type === StageType.PARALLEL;
  }

  get hasRequirements(): boolean {
    return !!(this.requirements && Object.keys(this.requirements).length > 0);
  }
}
