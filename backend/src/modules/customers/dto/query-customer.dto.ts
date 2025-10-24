import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

export class QueryCustomerDto {
  @ApiProperty({ description: 'Номер страницы', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Количество на странице', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ enum: CustomerType, description: 'Фильтр по типу заказчика', required: false })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @ApiProperty({ enum: CustomerStatus, description: 'Фильтр по статусу', required: false })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiProperty({ description: 'Поиск по имени, email или телефону', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Сортировка', enum: ['createdAt', 'updatedAt', 'totalOrders', 'totalAmount'], required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Порядок сортировки', enum: ['ASC', 'DESC'], required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
