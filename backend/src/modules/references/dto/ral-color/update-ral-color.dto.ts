import { PartialType } from '@nestjs/swagger';
import { CreateRalColorDto } from './create-ral-color.dto';

export class UpdateRalColorDto extends PartialType(CreateRalColorDto) {}
