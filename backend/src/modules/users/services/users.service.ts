import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, roles, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
    });

    // Assign roles
    if (roles && roles.length > 0) {
      user.roles = await this.roleRepository.findByIds(roles);
    } else {
      // Assign default role
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'MANAGER' },
      });
      if (defaultRole) {
        user.roles = [defaultRole];
      }
    }

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { roles, password, ...userData } = updateUserDto;

    // Update basic fields
    Object.assign(user, userData);

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Update roles if provided
    if (roles !== undefined) {
      if (roles.length === 0) {
        user.roles = [];
      } else {
        user.roles = await this.roleRepository.findByIds(roles);
      }
    }

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findOne(id);
    const { currentPassword, newPassword } = changePasswordDto;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.INACTIVE;
    return await this.userRepository.save(user);
  }

  async suspendUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.SUSPENDED;
    return await this.userRepository.save(user);
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    return await this.userRepository.save(user);
  }

  async setPasswordResetToken(id: string, token: string, expiresIn: Date): Promise<User> {
    const user = await this.findOne(id);
    user.passwordResetToken = token;
    user.passwordResetExpires = expiresIn;
    return await this.userRepository.save(user);
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() } as any,
      },
    });
  }

  async clearPasswordResetToken(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    return await this.userRepository.save(user);
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.isActive) {
      return false;
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check user permissions
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (
          permission.resource === resource &&
          permission.action === action &&
          permission.isActive
        ) {
          return true;
        }
      }
    }

    // Check for manage permission (grants all actions)
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (
          permission.resource === resource &&
          permission.action === 'manage' &&
          permission.isActive
        ) {
          return true;
        }
      }
    }

    return false;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return [];
    }

    // Admin gets all permissions
    if (user.role === UserRole.ADMIN) {
      return await this.permissionRepository.find({ where: { isActive: true } });
    }

    const permissions: Permission[] = [];
    const permissionMap = new Map<string, Permission>();

    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (permission.isActive && !permissionMap.has(permission.id)) {
          permissionMap.set(permission.id, permission);
          permissions.push(permission);
        }
      }
    }

    return permissions;
  }

  async getUsersByRole(roleName: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.name = :roleName', { roleName })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .getMany();
  }

  async getActiveUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { status: UserStatus.ACTIVE },
      relations: ['roles'],
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where(
        'user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query',
        {
          query: `%${query}%`,
        }
      )
      .getMany();
  }
}
