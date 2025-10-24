import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123', description: 'Текущий пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', description: 'Новый пароль пользователя', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
