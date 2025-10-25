import { PartialType } from '@nestjs/swagger';
import { CreateDoorTypeDto } from './create-door-type.dto';

export class UpdateDoorTypeDto extends PartialType(CreateDoorTypeDto) {}
