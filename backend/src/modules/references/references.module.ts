import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { DoorType } from './entities/door-type.entity';
import { RalColor } from './entities/ral-color.entity';
import { Lock } from './entities/lock.entity';
import { Threshold } from './entities/threshold.entity';
import { CancelReason } from './entities/cancel-reason.entity';

// Services
import { DoorTypesService } from './services/door-types.service';
import { RalColorsService } from './services/ral-colors.service';
import { LocksService } from './services/locks.service';
import { ThresholdsService } from './services/thresholds.service';
import { CancelReasonsService } from './services/cancel-reasons.service';

// Controllers
import { DoorTypesController } from './controllers/door-types.controller';
import { RalColorsController } from './controllers/ral-colors.controller';
import { LocksController } from './controllers/locks.controller';
import { ThresholdsController } from './controllers/thresholds.controller';
import { CancelReasonsController } from './controllers/cancel-reasons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoorType,
      RalColor,
      Lock,
      Threshold,
      CancelReason,
    ]),
  ],
  controllers: [
    DoorTypesController,
    RalColorsController,
    LocksController,
    ThresholdsController,
    CancelReasonsController,
  ],
  providers: [
    DoorTypesService,
    RalColorsService,
    LocksService,
    ThresholdsService,
    CancelReasonsService,
  ],
  exports: [
    TypeOrmModule,
    DoorTypesService,
    RalColorsService,
    LocksService,
    ThresholdsService,
    CancelReasonsService,
  ],
})
export class ReferencesModule {}
