import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum FileType {
  DRAWING = 'drawing',
  PHOTO = 'photo',
  DOCUMENT = 'document',
  CONTRACT = 'contract',
  SPECIFICATION = 'specification',
  CERTIFICATE = 'certificate',
  INVOICE = 'invoice',
  ACT = 'act',
  OTHER = 'other',
}

export enum FileVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  PRIVATE = 'private',
}

@Entity('files')
@Index(['order'])
@Index(['uploadedBy'])
@Index(['customer'])
@Index(['type'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_url', nullable: true })
  fileUrl?: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  type: FileType;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    default: FileVisibility.INTERNAL,
  })
  visibility: FileVisibility;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'last_downloaded_at', nullable: true })
  lastDownloadedAt?: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Order, (order) => order.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @ManyToOne(() => Customer, (customer) => customer.id, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => Comment, (comment) => comment.files, { nullable: true })
  @JoinColumn({ name: 'comment_id' })
  comment?: Comment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get fileSizeMB(): number {
    return Math.round(this.fileSize / (1024 * 1024) * 100) / 100;
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  get isPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  get isDocument(): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];
    return documentTypes.includes(this.mimeType);
  }

  get fileExtension(): string {
    const parts = this.originalName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  get typeText(): string {
    switch (this.type) {
      case FileType.DRAWING: return 'Чертёж';
      case FileType.PHOTO: return 'Фото';
      case FileType.DOCUMENT: return 'Документ';
      case FileType.CONTRACT: return 'Договор';
      case FileType.SPECIFICATION: return 'Спецификация';
      case FileType.CERTIFICATE: return 'Сертификат';
      case FileType.INVOICE: return 'Счёт';
      case FileType.ACT: return 'Акт';
      case FileType.OTHER: return 'Другое';
      default: return this.type;
    }
  }

  get visibilityText(): string {
    switch (this.visibility) {
      case FileVisibility.PUBLIC: return 'Публичный';
      case FileVisibility.INTERNAL: return 'Внутренний';
      case FileVisibility.PRIVATE: return 'Приватный';
      default: return this.visibility;
    }
  }
}
