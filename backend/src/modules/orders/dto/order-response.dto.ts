import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  internalNumber: string;

  @ApiProperty({ required: false })
  mainNumber?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  doorType: string;

  @ApiProperty()
  dimensions: string;

  @ApiProperty({ required: false })
  colorCoating?: string;

  @ApiProperty({ required: false })
  shieldNumber?: string;

  @ApiProperty({ required: false })
  managerComment?: string;

  @ApiProperty({ required: false })
  plannedCompletionDate?: Date;

  @ApiProperty({ required: false })
  completionDate?: Date;

  @ApiProperty({ required: false })
  actualDeliveryDate?: Date;

  @ApiProperty({ required: false })
  deliveryType?: string;

  @ApiProperty()
  totalAmount?: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty({ required: false })
  cancelReason?: string;

  @ApiProperty()
  isPaused: boolean;

  @ApiProperty({ required: false })
  pauseReason?: string;

  @ApiProperty()
  commentsCount: number;

  @ApiProperty()
  filesCount: number;

  @ApiProperty()
  stagesCount: number;

  @ApiProperty()
  completedStagesCount: number;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  isOverdue: boolean;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  customer: any;

  @ApiProperty()
  manager: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedOrderResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
