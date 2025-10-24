import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { History } from '../../history/entities/history.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLISTED = 'blacklisted',
}

@Entity('customers')
@Index(['email'])
@Index(['phoneNumber'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_type', type: 'enum', enum: CustomerType, default: CustomerType.INDIVIDUAL })
  customerType: CustomerType;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ name: 'company_inn', nullable: true })
  companyInn?: string;

  @Column({ name: 'company_kpp', nullable: true })
  companyKpp?: string;

  @Column({ name: 'company_address', nullable: true })
  companyAddress?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'additional_phone', nullable: true })
  additionalPhone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires?: Date;

  @Column({ name: 'access_token', nullable: true })
  accessToken?: string;

  @Column({ name: 'access_token_expires', nullable: true })
  accessTokenExpires?: Date;

  @Column({ name: 'last_access_at', nullable: true })
  lastAccessAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'last_order_date', nullable: true })
  lastOrderDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Comment, (comment) => comment.customer)
  comments: Comment[];

  @OneToMany(() => History, (history) => history.customer)
  history: History[];

  // Virtual fields
  get fullName(): string {
    if (this.customerType === CustomerType.ORGANIZATION) {
      return this.companyName || '';
    }

    const parts = [this.lastName, this.firstName, this.middleName].filter(Boolean);
    return parts.join(' ');
  }

  get displayName(): string {
    return this.fullName || this.email || this.phoneNumber || 'Неизвестный заказчик';
  }

  get hasValidAccessToken(): boolean {
    return !!(this.accessToken && this.accessTokenExpires && this.accessTokenExpires > new Date());
  }

  get isIndividual(): boolean {
    return this.customerType === CustomerType.INDIVIDUAL;
  }

  get isOrganization(): boolean {
    return this.customerType === CustomerType.ORGANIZATION;
  }

  get isActive(): boolean {
    return this.status === CustomerStatus.ACTIVE;
  }
}
