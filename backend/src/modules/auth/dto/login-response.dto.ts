import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT токен доступа' })
  accessToken: string;

  @ApiProperty({ example: 86400, description: 'Время жизни токена в секундах' })
  expiresIn: number;

  @ApiProperty({ example: 'Bearer', description: 'Тип токена' })
  tokenType: string;

  @ApiProperty({ description: 'Данные пользователя' })
  user: User;
}
