import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: '👨‍💼',
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah@example.com',
    avatar: '👩‍🎨',
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: '👨‍💻',
  },
  {
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: '👩‍🔬',
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: '👨‍🚀',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing users (this will cascade delete images)
  await prisma.user.deleteMany();
  console.log('🗑️  Cleared existing users and images');

  // Create demo users
  for (const userData of DEMO_USERS) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
