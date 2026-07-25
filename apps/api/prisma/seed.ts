import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash('ChangeMe123!');

  await prisma.user.upsert({
    where: { email: 'superadmin@tasork.com' },
    update: {},
    create: {
      email: 'superadmin@tasork.com',
      fullName: 'Tasork Super Admin',
      passwordHash: password,
      role: UserRole.SUPER_ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@tasork.com' },
    update: {},
    create: {
      email: 'admin@tasork.com',
      fullName: 'Tasork Admin',
      passwordHash: password,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      fullName: 'Demo Client',
      passwordHash: password,
      role: UserRole.CUSTOMER,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Seed complete. Default password for all seeded accounts: ChangeMe123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
