import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction, HistoryEntityType } from '../../history/entities/history.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly historyService: HistoryService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Пользователь неактивен или заблокирован');
    }

    return user;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponseDto> {
    const { email, password, rememberMe } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
    };

    const expiresIn = rememberMe ? '7d' : '24h';
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Log login action
    await this.historyService.create({
      action: HistoryAction.LOGIN,
      entityType: HistoryEntityType.USER,
      entityId: user.id,
      entityName: user.fullName,
      description: 'Пользователь вошёл в систему',
      ipAddress,
      userAgent,
      user: user,
    });

    return {
      accessToken,
      expiresIn: this.parseExpiresIn(expiresIn),
      tokenType: 'Bearer',
      user,
    };
  }

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponseDto> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber: phone,
      status: UserStatus.ACTIVE,
      isEmailVerified: false,
    });

    const savedUser = (await this.userRepository.save(user)) as User;

    // Generate JWT token
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      roles: savedUser.roles?.map(role => role.name) || [],
    };

    const accessToken = this.jwtService.sign(payload);

    // Log registration action
    await this.historyService.create({
      action: HistoryAction.CREATE,
      entityType: HistoryEntityType.USER,
      entityId: savedUser.id,
      entityName: savedUser.fullName,
      description: 'Зарегистрирован новый пользователь',
      ipAddress,
      userAgent,
      user: savedUser,
    });

    return {
      accessToken,
      expiresIn: 86400, // 24 hours
      tokenType: 'Bearer',
      user: savedUser,
    };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Получаем пользователя
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Log logout action
    await this.historyService.create({
      action: HistoryAction.LOGOUT,
      entityType: HistoryEntityType.USER,
      entityId: user.id,
      entityName: user.fullName,
      description: 'Пользователь вышел из системы',
      ipAddress,
      userAgent,
      user: user,
    });
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    try {
      // Decode refresh token to get user ID
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Пользователь не найден или неактивен');
      }

      // Generate new JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles?.map(role => role.name) || [],
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        expiresIn: 86400, // 24 hours
        tokenType: 'Bearer',
        user: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }
  }

  async refreshTokenWithUser(user: User): Promise<LoginResponseDto> {
    // Validate user still exists and is active
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!currentUser || currentUser.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Пользователь не найден или неактивен');
    }

    // Generate new JWT token
    const payload = {
      sub: currentUser.id,
      email: currentUser.email,
      roles: currentUser.roles?.map(role => role.name) || [],
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: 86400, // 24 hours
      tokenType: 'Bearer',
      user: currentUser,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token
    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Недействительный или просроченный токен сброса пароля');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Log password reset action
    await this.historyService.create({
      action: HistoryAction.UPDATE,
      entityType: HistoryEntityType.USER,
      entityId: user.id,
      entityName: user.fullName,
      description: 'Пароль был сброшен',
      isSystem: true,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Недействительный токен подтверждения email');
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    // Log email verification
    await this.historyService.create({
      action: HistoryAction.UPDATE,
      entityType: HistoryEntityType.USER,
      entityId: user.id,
      entityName: user.fullName,
      description: 'Email был подтверждён',
      isSystem: true,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    // Log password change
    await this.historyService.create({
      action: HistoryAction.UPDATE,
      entityType: HistoryEntityType.USER,
      entityId: userId,
      entityName: user.fullName,
      description: 'Пароль был изменён',
      user: user,
    });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  private parseExpiresIn(expiresIn: string): number {
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 3600;
      case 'd':
        return timeValue * 86400;
      default:
        return 86400; // Default to 24 hours
    }
  }

  private generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
