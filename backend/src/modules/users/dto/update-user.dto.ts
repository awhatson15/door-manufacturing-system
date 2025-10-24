import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'newpassword123', description: 'Новый пароль пользователя', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email пользователя' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John', description: 'Имя пользователя' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Фамилия пользователя' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Номер телефона' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN, description: 'Роль пользователя' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'Статус пользователя' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({ example: ['admin', 'manager'], description: 'Список ID ролей пользователя' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg', description: 'URL аватара' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: { theme: 'light', language: 'en', notifications: true }, description: 'Настройки пользователя' })
  @IsOptional()
  preferences?: Record<string, any>;

  @ApiPropertyOptional({ example: false, description: 'Подтвержден ли email' })
  @IsOptional()
  isEmailVerified?: boolean;
}
