import { ApiProperty } from '@nestjs/swagger';

export class HistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty({ required: false })
  entityId?: string;

  @ApiProperty({ required: false })
  entityName?: string;

  @ApiProperty({ required: false })
  oldValues?: Record<string, any>;

  @ApiProperty({ required: false })
  newValues?: Record<string, any>;

  @ApiProperty({ required: false })
  changedFields?: string[];

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  userAgent?: string;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty()
  isSystem: boolean;

  @ApiProperty({ required: false })
  user?: any;

  @ApiProperty({ required: false })
  order?: any;

  @ApiProperty({ required: false })
  customer?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  actorName: string;

  @ApiProperty()
  actionText: string;

  @ApiProperty()
  entityTypeText: string;

  @ApiProperty()
  fullDescription: string;
}

export class PaginatedHistoryResponseDto {
  @ApiProperty({ type: [HistoryResponseDto] })
  data: HistoryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class HistoryStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  byAction: Record<string, number>;

  @ApiProperty()
  byEntityType: Record<string, number>;

  @ApiProperty()
  todayCount: number;

  @ApiProperty()
  weekCount: number;

  @ApiProperty()
  monthCount: number;
}
