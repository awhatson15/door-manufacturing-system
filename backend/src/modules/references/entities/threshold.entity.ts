import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ThresholdType {
  WITH_QUARTER = 'with_quarter',
  FLAT = 'flat',
  RETRACTABLE = 'retractable',
  WITHOUT = 'without',
}

@Entity('thresholds')
export class Threshold {
  @ApiProperty({ description: 'Уникальный идентификатор порога' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Тип порога',
    enum: ThresholdType,
    example: ThresholdType.WITH_QUARTER,
  })
  @Column({
    type: 'enum',
    enum: ThresholdType,
    default: ThresholdType.FLAT,
  })
  type: ThresholdType;

  @ApiProperty({
    description: 'Высота порога (мм)',
    example: 40,
    required: false,
  })
  @Column({ type: 'int', nullable: true, name: 'height_mm' })
  heightMm: number;

  @ApiProperty({
    description: 'Материал исполнения',
    example: 'Сталь',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  material: string;

  @ApiProperty({
    description: 'Примечания',
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
