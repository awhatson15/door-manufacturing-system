import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { PermissionAction, PermissionResource } from '../entities/permission.entity';

@ApiTags('Пользователи')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(PermissionResource.USERS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей получен' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('active')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Получение списка активных пользователей' })
  @ApiResponse({ status: 200, description: 'Список активных пользователей получен' })
  async findActive() {
    return await this.usersService.getActiveUsers();
  }

  @Get('search/:query')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Поиск пользователей' })
  @ApiResponse({ status: 200, description: 'Результаты поиска получены' })
  async search(@Param('query') query: string) {
    return await this.usersService.searchUsers(query);
  }

  @Get(':id')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Обновление данных пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 204, description: 'Пользователь удалён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Post(':id/activate')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Активация пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь активирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async activate(@Param('id') id: string) {
    return await this.usersService.activateUser(id);
  }

  @Post(':id/deactivate')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Деактивация пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь деактивирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async deactivate(@Param('id') id: string) {
    return await this.usersService.deactivateUser(id);
  }

  @Post(':id/suspend')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Блокировка пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь заблокирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async suspend(@Param('id') id: string) {
    return await this.usersService.suspendUser(id);
  }

  @Post(':id/verify-email')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Подтверждение email пользователя' })
  @ApiResponse({ status: 200, description: 'Email подтверждён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async verifyEmail(@Param('id') id: string) {
    return await this.usersService.verifyEmail(id);
  }

  @Post('change-password')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Смена пароля пользователя' })
  @ApiResponse({ status: 200, description: 'Пароль изменён' })
  @ApiResponse({ status: 400, description: 'Неверный текущий пароль' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return await this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Post(':id/change-password')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.UPDATE)
  @ApiOperation({ summary: 'Смена пароля пользователя (администратор)' })
  @ApiResponse({ status: 200, description: 'Пароль изменён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async changeUserPassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    // Администратор может менять пароль без указания текущего
    const adminPasswordDto = { ...changePasswordDto, currentPassword: 'admin' };
    return await this.usersService.changePassword(id, adminPasswordDto);
  }

  @Get(':id/permissions')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Получение прав пользователя' })
  @ApiResponse({ status: 200, description: 'Права пользователя получены' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserPermissions(@Param('id') id: string) {
    return await this.usersService.getUserPermissions(id);
  }

  @Get('role/:roleName')
  @RequirePermissions(PermissionResource.USERS, PermissionAction.READ)
  @ApiOperation({ summary: 'Получение пользователей по роли' })
  @ApiResponse({ status: 200, description: 'Пользователи получены' })
  async getUsersByRole(@Param('roleName') roleName: string) {
    return await this.usersService.getUsersByRole(roleName);
  }
}
