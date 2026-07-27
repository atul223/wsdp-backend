
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: {
      code: 'PDISA-WSDP',
    },
    update: {},
    create: {
      name: 'Water Supply Distribution Project',
      code: 'PDISA-WSDP',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
    },
  });

  const users = await prisma.user.findMany({
    where: {
      status: 'active',
      deletedAt: null,
    },
    include: {
      role: true,
    },
  });

  if (!users.length) {
    console.log('No active users found. Create/login user first, then run this seed again.');
    return;
  }

  for (const user of users) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        userId: user.id,
        roleOnProject: user.role?.name || 'member',
      },
    });
  }

  await prisma.budget.upsert({
    where: {
      projectId_category_fiscalYear: {
        projectId: project.id,
        category: 'Project Works',
        fiscalYear: 2026,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      category: 'Project Works',
      fiscalYear: 2026,
      allocatedAmount: 2368000000,
      currency: 'INR',
      notes: 'Initial financial dashboard budget',
    },
  });

  console.log('Financial dashboard project seed completed.');
  console.log('Project ID:', project.id);
  console.log('');
  console.log('Run this in browser console on frontend:');
  console.log(`localStorage.setItem("current_project", "${project.id}")`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });