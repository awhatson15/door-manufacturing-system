import { AppDataSource } from '../data-source';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';
import { seedStages } from './stages.seed';
import { seedReferences } from './references.seed';

async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Run seeds in order (permissions -> roles -> users -> stages)
    console.log('\n📝 Seeding permissions...');
    await seedPermissions(AppDataSource);
    console.log('✅ Permissions seeded');

    console.log('\n👥 Seeding roles...');
    await seedRoles(AppDataSource);
    console.log('✅ Roles seeded');

    console.log('\n👤 Seeding users...');
    await seedUsers(AppDataSource);
    console.log('✅ Users seeded');

    console.log('\n📊 Seeding stages...');
    await seedStages(AppDataSource);
    console.log('✅ Stages seeded');

    console.log('\n📚 Seeding references...');
    await seedReferences(AppDataSource);
    console.log('✅ References seeded');

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

runSeeds();
