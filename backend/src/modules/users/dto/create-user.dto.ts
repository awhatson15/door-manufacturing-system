import { IsEmail, IsString, IsOptional, IsEnum, IsArray, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email пользователя' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль пользователя', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Фамилия пользователя' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Номер телефона' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'Статус пользователя' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({ example: ['manager', 'user'], description: 'Список ID ролей пользователя' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'URL аватара' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: { theme: 'dark', language: 'ru' }, description: 'Настройки пользователя' })
  @IsOptional()
  preferences?: Record<string, any>;
}
