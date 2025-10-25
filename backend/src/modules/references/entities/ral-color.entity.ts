import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ral_colors')
export class RalColor {
  @ApiProperty({ description: 'Уникальный идентификатор цвета' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Код RAL', example: '8017' })
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @ApiProperty({
    description: 'Название цвета',
    example: 'Шоколадно-коричневый',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'HEX код цвета',
    example: '#45322E',
    required: false,
  })
  @Column({ type: 'varchar', length: 7, nullable: true })
  hex: string;

  @ApiProperty({
    description: 'URL превью изображения',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @ApiProperty({
    description: 'Дополнительные параметры покраски',
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
