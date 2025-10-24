import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerType: string;

  @ApiProperty({ required: false })
  companyName?: string;

  @ApiProperty({ required: false })
  companyInn?: string;

  @ApiProperty({ required: false })
  companyKpp?: string;

  @ApiProperty({ required: false })
  companyAddress?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  middleName?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty({ required: false })
  additionalPhone?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ required: false })
  lastOrderDate?: Date;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedCustomerResponseDto {
  @ApiProperty({ type: [CustomerResponseDto] })
  data: CustomerResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
