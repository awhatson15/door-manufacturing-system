import { DataSource } from 'typeorm';
import { Permission, PermissionResource, PermissionAction } from '../../modules/users/entities/permission.entity';

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);

  // Define all permissions
  const permissionsData = [
    // Users permissions
    { resource: PermissionResource.USERS, action: PermissionAction.CREATE, name: 'users:create', description: 'Create new users' },
    { resource: PermissionResource.USERS, action: PermissionAction.READ, name: 'users:read', description: 'View users' },
    { resource: PermissionResource.USERS, action: PermissionAction.UPDATE, name: 'users:update', description: 'Update users' },
    { resource: PermissionResource.USERS, action: PermissionAction.DELETE, name: 'users:delete', description: 'Delete users' },
    { resource: PermissionResource.USERS, action: PermissionAction.MANAGE, name: 'users:manage', description: 'Full user management' },

    // Customers permissions
    { resource: PermissionResource.CUSTOMERS, action: PermissionAction.CREATE, name: 'customers:create', description: 'Create new customers' },
    { resource: PermissionResource.CUSTOMERS, action: PermissionAction.READ, name: 'customers:read', description: 'View customers' },
    { resource: PermissionResource.CUSTOMERS, action: PermissionAction.UPDATE, name: 'customers:update', description: 'Update customers' },
    { resource: PermissionResource.CUSTOMERS, action: PermissionAction.DELETE, name: 'customers:delete', description: 'Delete customers' },
    { resource: PermissionResource.CUSTOMERS, action: PermissionAction.MANAGE, name: 'customers:manage', description: 'Full customer management' },

    // Orders permissions
    { resource: PermissionResource.ORDERS, action: PermissionAction.CREATE, name: 'orders:create', description: 'Create new orders' },
    { resource: PermissionResource.ORDERS, action: PermissionAction.READ, name: 'orders:read', description: 'View orders' },
    { resource: PermissionResource.ORDERS, action: PermissionAction.UPDATE, name: 'orders:update', description: 'Update orders' },
    { resource: PermissionResource.ORDERS, action: PermissionAction.DELETE, name: 'orders:delete', description: 'Delete orders' },
    { resource: PermissionResource.ORDERS, action: PermissionAction.MANAGE, name: 'orders:manage', description: 'Full order management' },

    // Stages permissions
    { resource: PermissionResource.STAGES, action: PermissionAction.CREATE, name: 'stages:create', description: 'Create new stages' },
    { resource: PermissionResource.STAGES, action: PermissionAction.READ, name: 'stages:read', description: 'View stages' },
    { resource: PermissionResource.STAGES, action: PermissionAction.UPDATE, name: 'stages:update', description: 'Update stages' },
    { resource: PermissionResource.STAGES, action: PermissionAction.DELETE, name: 'stages:delete', description: 'Delete stages' },
    { resource: PermissionResource.STAGES, action: PermissionAction.MANAGE, name: 'stages:manage', description: 'Full stage management' },

    // Files permissions
    { resource: PermissionResource.FILES, action: PermissionAction.CREATE, name: 'files:create', description: 'Upload files' },
    { resource: PermissionResource.FILES, action: PermissionAction.READ, name: 'files:read', description: 'View files' },
    { resource: PermissionResource.FILES, action: PermissionAction.UPDATE, name: 'files:update', description: 'Update files' },
    { resource: PermissionResource.FILES, action: PermissionAction.DELETE, name: 'files:delete', description: 'Delete files' },
    { resource: PermissionResource.FILES, action: PermissionAction.MANAGE, name: 'files:manage', description: 'Full file management' },

    // Comments permissions
    { resource: PermissionResource.COMMENTS, action: PermissionAction.CREATE, name: 'comments:create', description: 'Create comments' },
    { resource: PermissionResource.COMMENTS, action: PermissionAction.READ, name: 'comments:read', description: 'View comments' },
    { resource: PermissionResource.COMMENTS, action: PermissionAction.UPDATE, name: 'comments:update', description: 'Update comments' },
    { resource: PermissionResource.COMMENTS, action: PermissionAction.DELETE, name: 'comments:delete', description: 'Delete comments' },
    { resource: PermissionResource.COMMENTS, action: PermissionAction.MANAGE, name: 'comments:manage', description: 'Full comment management' },

    // Notifications permissions
    { resource: PermissionResource.NOTIFICATIONS, action: PermissionAction.CREATE, name: 'notifications:create', description: 'Create notifications' },
    { resource: PermissionResource.NOTIFICATIONS, action: PermissionAction.READ, name: 'notifications:read', description: 'View notifications' },
    { resource: PermissionResource.NOTIFICATIONS, action: PermissionAction.UPDATE, name: 'notifications:update', description: 'Update notifications' },
    { resource: PermissionResource.NOTIFICATIONS, action: PermissionAction.DELETE, name: 'notifications:delete', description: 'Delete notifications' },
    { resource: PermissionResource.NOTIFICATIONS, action: PermissionAction.MANAGE, name: 'notifications:manage', description: 'Full notification management' },

    // History permissions
    { resource: PermissionResource.HISTORY, action: PermissionAction.READ, name: 'history:read', description: 'View history' },
    { resource: PermissionResource.HISTORY, action: PermissionAction.MANAGE, name: 'history:manage', description: 'Full history management' },

    // Settings permissions
    { resource: PermissionResource.SETTINGS, action: PermissionAction.READ, name: 'settings:read', description: 'View settings' },
    { resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE, name: 'settings:update', description: 'Update settings' },
    { resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE, name: 'settings:manage', description: 'Full settings management' },
  ];

  // Create permissions if they don't exist
  for (const permData of permissionsData) {
    const existingPermission = await permissionRepository.findOne({
      where: { name: permData.name },
    });

    if (!existingPermission) {
      const permission = permissionRepository.create({
        ...permData,
        isSystem: true,
        isActive: true,
      });
      await permissionRepository.save(permission);
      console.log(`  ✓ Created permission: ${permData.name}`);
    } else {
      console.log(`  ⊘ Permission already exists: ${permData.name}`);
    }
  }
}
