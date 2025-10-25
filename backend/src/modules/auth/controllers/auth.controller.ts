import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // Логирование для диагностики CORS
    console.log('🔍 Auth Controller - Login Request:');
    console.log(`- Method: ${req.method}`);
    console.log(`- URL: ${req.url}`);
    console.log(`- Origin: ${req.headers.origin}`);
    console.log(`- Host: ${req.headers.host}`);
    console.log(`- User-Agent: ${req.headers['user-agent']}`);
    console.log(`- IP: ${req.ip}`);
    console.log(`- X-Forwarded-For: ${req.headers['x-forwarded-for']}`);
    console.log(`- Body:`, JSON.stringify(loginDto));
    
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  async logout(@Request() req) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await this.authService.logout(req.user.id, ipAddress, userAgent);
    return { message: 'Успешный выход из системы' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токена' })
  @ApiResponse({ status: 200, description: 'Токен успешно обновлен' })
  @ApiResponse({ status: 401, description: 'Неверный refresh токен' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
