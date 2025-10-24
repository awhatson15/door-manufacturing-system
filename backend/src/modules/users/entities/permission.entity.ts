import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

export enum PermissionResource {
  USERS = 'users',
  CUSTOMERS = 'customers',
  ORDERS = 'orders',
  STAGES = 'stages',
  FILES = 'files',
  COMMENTS = 'comments',
  NOTIFICATIONS = 'notifications',
  HISTORY = 'history',
  SETTINGS = 'settings',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // Virtual field for permission name in format "resource:action"
  get fullName(): string {
    return `${this.resource}:${this.action}`;
  }
}
