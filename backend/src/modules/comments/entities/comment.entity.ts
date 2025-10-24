import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { File } from '../../files/entities/file.entity';

export enum CommentType {
  INTERNAL = 'internal',
  PUBLIC = 'public',
  SYSTEM = 'system',
}

export enum CommentStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  HIDDEN = 'hidden',
}

@Entity('comments')
@Index(['order'])
@Index(['author'])
@Index(['customer'])
@Index(['type'])
@Index(['status'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentType,
    default: CommentType.INTERNAL,
  })
  type: CommentType;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.ACTIVE,
  })
  status: CommentStatus;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', nullable: true })
  editedAt?: Date;

  @Column({ name: 'edit_reason', nullable: true })
  editReason?: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @Column({ name: 'reply_count', default: 0 })
  replyCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Order, (order) => order.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Customer, (customer) => customer.comments, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @OneToMany(() => File, (file) => file.comment, { cascade: true })
  files: File[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get isInternal(): boolean {
    return this.type === CommentType.INTERNAL;
  }

  get isPublic(): boolean {
    return this.type === CommentType.PUBLIC;
  }

  get isSystem(): boolean {
    return this.type === CommentType.SYSTEM;
  }

  get isActive(): boolean {
    return this.status === CommentStatus.ACTIVE;
  }

  get isDeleted(): boolean {
    return this.status === CommentStatus.DELETED;
  }

  get isHidden(): boolean {
    return this.status === CommentStatus.HIDDEN;
  }

  get hasAttachments(): boolean {
    return !!(this.files && this.files.length > 0);
  }

  get hasReplies(): boolean {
    return this.replyCount > 0;
  }

  get isReply(): boolean {
    return !!this.parentId;
  }

  get typeText(): string {
    switch (this.type) {
      case CommentType.INTERNAL: return 'Внутренний';
      case CommentType.PUBLIC: return 'Публичный';
      case CommentType.SYSTEM: return 'Системный';
      default: return this.type;
    }
  }

  get statusText(): string {
    switch (this.status) {
      case CommentStatus.ACTIVE: return 'Активен';
      case CommentStatus.DELETED: return 'Удалён';
      case CommentStatus.HIDDEN: return 'Скрыт';
      default: return this.status;
    }
  }

  get authorName(): string {
    if (this.author) {
      return this.author.fullName;
    }
    if (this.customer) {
      return this.customer.displayName;
    }
    return 'Система';
  }

  get isFromCustomer(): boolean {
    return !!this.customer && !this.author;
  }

  get isFromStaff(): boolean {
    return !!this.author;
  }
}
