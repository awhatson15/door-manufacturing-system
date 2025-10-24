import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';
import { CustomerStatus } from '../entities/customer.entity';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({ enum: CustomerStatus, description: 'Статус заказчика', required: false })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiProperty({ description: 'Email подтвержден', required: false })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
