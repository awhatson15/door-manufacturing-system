import { DataSource } from 'typeorm';
import { Role } from '../../modules/users/entities/role.entity';
import { Permission } from '../../modules/users/entities/permission.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  // Get all permissions
  const allPermissions = await permissionRepository.find();

  // Define roles
  const rolesData = [
    {
      name: 'Admin',
      description: 'Administrator with full system access',
      permissionNames: allPermissions.map(p => p.name), // All permissions
    },
    {
      name: 'Manager',
      description: 'Manager with limited access to orders and customers',
      permissionNames: [
        'customers:read',
        'customers:create',
        'customers:update',
        'orders:read',
        'orders:create',
        'orders:update',
        'stages:read',
        'files:read',
        'files:create',
        'comments:read',
        'comments:create',
        'comments:update',
        'notifications:read',
        'history:read',
      ],
    },
    {
      name: 'Viewer',
      description: 'Read-only access to orders and customers',
      permissionNames: [
        'customers:read',
        'orders:read',
        'stages:read',
        'files:read',
        'comments:read',
        'history:read',
      ],
    },
  ];

  // Create roles with permissions
  for (const roleData of rolesData) {
    let role = await roleRepository.findOne({
      where: { name: roleData.name },
      relations: ['permissions'],
    });

    if (!role) {
      // Create new role
      role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
        isSystem: true,
        isActive: true,
      });
    } else {
      // Update existing role
      role.description = roleData.description;
    }

    // Get permissions for this role
    const rolePermissions = await permissionRepository.find({
      where: roleData.permissionNames.map(name => ({ name })),
    });

    role.permissions = rolePermissions;
    await roleRepository.save(role);

    console.log(`  ✓ Created/Updated role: ${roleData.name} with ${rolePermissions.length} permissions`);
  }
}
