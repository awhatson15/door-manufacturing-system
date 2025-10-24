import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  // Get roles
  const adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
  const managerRole = await roleRepository.findOne({ where: { name: 'Manager' } });

  if (!adminRole || !managerRole) {
    throw new Error('Roles not found. Please run roles seed first.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedManagerPassword = await bcrypt.hash('manager123', 10);

  // Define users
  const usersData = [
    {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roles: [adminRole],
    },
    {
      email: 'manager@example.com',
      password: hashedManagerPassword,
      firstName: 'Manager',
      lastName: 'User',
      phoneNumber: '+1234567891',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roles: [managerRole],
    },
  ];

  // Create users
  for (const userData of usersData) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`  ✓ Created user: ${userData.email}`);
    } else {
      console.log(`  ⊘ User already exists: ${userData.email}`);
    }
  }
}
