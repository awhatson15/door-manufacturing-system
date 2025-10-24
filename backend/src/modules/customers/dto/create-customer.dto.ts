import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  ValidateIf,
  Matches,
  MinLength,
} from 'class-validator';
import { CustomerType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ enum: CustomerType, description: 'Тип заказчика', default: CustomerType.INDIVIDUAL })
  @IsEnum(CustomerType)
  customerType: CustomerType;

  // Поля для организации
  @ApiProperty({ description: 'Название компании', required: false })
  @ValidateIf((o) => o.customerType === CustomerType.ORGANIZATION)
  @IsString()
  @MinLength(1)
  companyName?: string;

  @ApiProperty({ description: 'ИНН компании', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$|^\d{12}$/, { message: 'ИНН должен содержать 10 или 12 цифр' })
  companyInn?: string;

  @ApiProperty({ description: 'КПП компании', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{9}$/, { message: 'КПП должен содержать 9 цифр' })
  companyKpp?: string;

  @ApiProperty({ description: 'Юридический адрес компании', required: false })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  // Поля для физического лица
  @ApiProperty({ description: 'Имя', required: false })
  @ValidateIf((o) => o.customerType === CustomerType.INDIVIDUAL)
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({ description: 'Фамилия', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Отчество', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  // Контактные данные
  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email?: string;

  @ApiProperty({ description: 'Номер телефона', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-\(\)]{10,20}$/, { message: 'Некорректный номер телефона' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Дополнительный телефон', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-\(\)]{10,20}$/, { message: 'Некорректный номер телефона' })
  additionalPhone?: string;

  @ApiProperty({ description: 'Адрес', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Заметки', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Настройки', required: false })
  @IsOptional()
  preferences?: Record<string, any>;
}
