import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cancel_reasons')
export class CancelReason {
  @ApiProperty({ description: 'Уникальный идентификатор причины отмены' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название причины',
    example: 'Отказ клиента',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Подробное описание',
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
