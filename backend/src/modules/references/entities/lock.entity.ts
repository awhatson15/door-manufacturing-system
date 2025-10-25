import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('locks')
export class Lock {
  @ApiProperty({ description: 'Уникальный идентификатор замка' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Модель замка', example: 'Гардиан 30.01' })
  @Column({ type: 'varchar', length: 255 })
  model: string;

  @ApiProperty({
    description: 'Количество замков',
    example: 2,
    default: 1,
  })
  @Column({ type: 'int', default: 1 })
  count: number;

  @ApiProperty({
    description: 'Наличие задвижки',
    example: true,
  })
  @Column({ type: 'boolean', default: false, name: 'has_bolt' })
  hasBolt: boolean;

  @ApiProperty({
    description: 'Наличие цилиндра',
    example: true,
  })
  @Column({ type: 'boolean', default: false, name: 'has_cylinder' })
  hasCylinder: boolean;

  @ApiProperty({
    description: 'Наличие броненакладки',
    example: false,
  })
  @Column({ type: 'boolean', default: false, name: 'has_bronenakladka' })
  hasBronenakladka: boolean;

  @ApiProperty({
    description: 'Комментарий о замке',
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
