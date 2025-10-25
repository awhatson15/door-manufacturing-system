import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('door_types')
export class DoorType {
  @ApiProperty({ description: 'Уникальный идентификатор типа двери' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Название типа двери', example: 'Техническая' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Признак противопожарной двери',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  fireproof: boolean;

  @ApiProperty({
    description: 'Требует ли номер шильды',
    example: false,
  })
  @Column({ type: 'boolean', default: false, name: 'requires_shield_number' })
  requiresShieldNumber: boolean;

  @ApiProperty({
    description: 'Толщина металла снаружи (мм)',
    example: 2,
    required: false,
  })
  @Column({ type: 'int', nullable: true, name: 'thickness_outer' })
  thicknessOuter: number;

  @ApiProperty({
    description: 'Толщина металла внутри (мм)',
    example: 2,
    required: false,
  })
  @Column({ type: 'int', nullable: true, name: 'thickness_inner' })
  thicknessInner: number;

  @ApiProperty({
    description: 'Описание типа двери',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Активность справочника', example: true })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty({ description: 'Дата создания' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
