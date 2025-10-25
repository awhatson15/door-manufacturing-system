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

  @ApiProperty({ required: false })
  doorType?: any;

  @ApiProperty({ required: false })
  heightMm?: number;

  @ApiProperty({ required: false })
  widthMm?: number;

  @ApiProperty({ required: false })
  color?: any;

  @ApiProperty({ required: false })
  lock?: any;

  @ApiProperty({ required: false })
  threshold?: any;

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
  deliveryMethod?: string;

  @ApiProperty()
  totalAmount?: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty({ required: false })
  cancelReason?: any;

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
