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

  // --- CMS seed data ---------------------------------------------------------
  // Keeps the marketing site from rendering empty FAQ/testimonial sections
  // on a fresh install. Content is fully editable afterward via
  // /admin/cms/* — this is just a sensible starting point.

  const faqItems = [
    {
      question: 'How is Tasork different from a freelance marketplace?',
      answer:
        'You never search for or negotiate with individual freelancers. You submit your project once, and our team reviews it, assigns the right people, and sends you a single, professional proposal.',
      order: 0,
    },
    {
      question: 'How long does it take to get a proposal?',
      answer: 'Most requests receive a proposal within 24 hours. More complex projects may take longer.',
      order: 1,
    },
    {
      question: 'Is my payment secure?',
      answer:
        'Yes. Payments are processed through PCI-compliant providers, and larger projects can be split into milestone-based payments.',
      order: 2,
    },
  ];
  for (const item of faqItems) {
    await prisma.faqItem.upsert({
      where: { id: `seed-faq-${item.order}` },
      update: {},
      create: { id: `seed-faq-${item.order}`, ...item },
    });
  }

  const testimonials = [
    {
      authorName: 'Amara O.',
      authorRole: 'Startup Founder',
      quote: 'The proposal was more thorough than three freelancer quotes combined.',
      order: 0,
    },
    {
      authorName: 'Daniel K.',
      authorRole: 'Graduate Student',
      quote: 'The dashboard kept me updated the whole time, no chasing anyone for status.',
      order: 1,
    },
  ];
  for (const item of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `seed-testimonial-${item.order}` },
      update: {},
      create: { id: `seed-testimonial-${item.order}`, ...item },
    });
  }

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
