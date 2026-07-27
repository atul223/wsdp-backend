/**
 * Seed script — roles, permissions, role_permissions, and a bootstrap
 * Admin user. Run with: npm run prisma:seed
 *
 * Role set matches auth-system-design.md:
 * admin, project_manager, site_engineer, planning_engineer,
 * finance, client, read_only_user
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ROLES = [
  { name: 'admin', description: 'Full system control' },
  { name: 'project_manager', description: 'Owns one or more projects end-to-end' },
  { name: 'site_engineer', description: 'On-ground execution' },
  { name: 'planning_engineer', description: 'Schedules & work-package planning' },
  { name: 'finance', description: 'Budget & expenditure control' },
  { name: 'client', description: 'External stakeholder / funding body' },
  { name: 'read_only_user', description: 'Internal read-only viewer' },
];

const MODULES = [
  'construction_progress',
  'financial_dashboard',
  'ehs',
  'risk_delay',
  'resource_dashboard',
  'reports',
  'settings',
];
const ACTIONS = ['create', 'read', 'update', 'delete'];

// module -> action -> roles that get that permission
const ROLE_MODULE_ACCESS = {
  admin: { '*': ['create', 'read', 'update', 'delete'] },
  project_manager: {
    construction_progress: ['create', 'read', 'update', 'delete'],
    financial_dashboard: ['create', 'read', 'update', 'delete'],
    ehs: ['create', 'read', 'update', 'delete'],
    risk_delay: ['create', 'read', 'update', 'delete'],
    resource_dashboard: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['read'],
  },
  site_engineer: {
    construction_progress: ['create', 'read', 'update'],
    resource_dashboard: ['create', 'read', 'update'],
    reports: ['create', 'read', 'update'],
    financial_dashboard: ['read'],
    ehs: ['read'],
    risk_delay: ['read'],
  },
  planning_engineer: {
    construction_progress: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    financial_dashboard: ['read'],
    ehs: ['read'],
    risk_delay: ['read'],
    resource_dashboard: ['read'],
  },
  finance: {
    financial_dashboard: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update'],
    construction_progress: ['read'],
    ehs: ['read'],
    risk_delay: ['read'],
    resource_dashboard: ['read'],
  },
  client: {
    construction_progress: ['read'],
    financial_dashboard: ['read'],
    ehs: ['read'],
    risk_delay: ['read'],
    reports: ['read'],
  },
  read_only_user: {
    construction_progress: ['read'],
    financial_dashboard: ['read'],
    ehs: ['read'],
    risk_delay: ['read'],
    resource_dashboard: ['read'],
    reports: ['read'],
  },
};

async function main() {
  console.log('Seeding roles...');
  const roleRecords = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleRecords[r.name] = role;
  }

  console.log('Seeding permissions...');
  const permissionRecords = {};
  for (const mod of MODULES) {
    for (const action of ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: { module_action: { module: mod, action } },
        update: {},
        create: { module: mod, action },
      });
      permissionRecords[`${mod}:${action}`] = perm;
    }
  }

  console.log('Seeding role_permissions...');
  for (const [roleName, access] of Object.entries(ROLE_MODULE_ACCESS)) {
    const role = roleRecords[roleName];
    const grants = [];

    if (access['*']) {
      // wildcard: this role gets every module/action combination
      for (const mod of MODULES) {
        for (const action of access['*']) {
          grants.push(permissionRecords[`${mod}:${action}`]);
        }
      }
    } else {
      for (const [mod, actions] of Object.entries(access)) {
        for (const action of actions) {
          const key = `${mod}:${action}`;
          if (permissionRecords[key]) grants.push(permissionRecords[key]);
        }
      }
    }

    for (const perm of grants) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log('Seeding bootstrap admin user...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@watersupply-monitor.example';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
  where: { email: adminEmail },
  update: {},
  create: {
    name: 'System Administrator',
    email: adminEmail,
    passwordHash,
    roleId: roleRecords['admin'].id,
    status: 'active',
  },
});

const project = await prisma.project.upsert({
  where: { code: 'WSDP-LUBANGO-001' },
  update: {},
  create: {
    name: 'Water Supply Distribution Project',
    code: 'WSDP-LUBANGO-001',
    status: 'active',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
  },
});

await prisma.projectMember.upsert({
  where: {
    projectId_userId: {
      projectId: project.id,
      userId: adminUser.id,
    },
  },
  update: {
    roleOnProject: 'project_manager',
  },
  create: {
    projectId: project.id,
    userId: adminUser.id,
    roleOnProject: 'project_manager',
  },
});

const sampleResources = [
  {
    name: 'DI Pipe — 600mm',
    type: 'material',
    unit: 'm',
    totalCapacity: 1200,
    notes: 'Critical inventory item',
  },
  {
    name: 'DI Pipe — 450mm',
    type: 'material',
    unit: 'm',
    totalCapacity: 3100,
    notes: 'Main distribution pipeline material',
  },
  {
    name: 'HDPE Pipe — 315mm',
    type: 'material',
    unit: 'm',
    totalCapacity: 5400,
    notes: 'Secondary distribution pipeline material',
  },
  {
    name: 'Excavators',
    type: 'equipment',
    unit: 'nos',
    totalCapacity: 10,
    notes: 'Earthwork fleet',
  },
  {
    name: 'HDD Rigs',
    type: 'equipment',
    unit: 'nos',
    totalCapacity: 3,
    notes: 'Horizontal directional drilling rigs',
  },
  {
    name: 'Dewatering Pumps',
    type: 'equipment',
    unit: 'nos',
    totalCapacity: 12,
    notes: 'Used for trench dewatering',
  },
  {
    name: 'Skilled',
    type: 'manpower',
    unit: 'persons',
    totalCapacity: 340,
    notes: 'Skilled labor deployment',
  },
  {
    name: 'Unskilled',
    type: 'manpower',
    unit: 'persons',
    totalCapacity: 520,
    notes: 'Unskilled labor deployment',
  },
  {
    name: 'Supervisory',
    type: 'manpower',
    unit: 'persons',
    totalCapacity: 65,
    notes: 'Site supervision team',
  },
  {
    name: 'Engineering Staff',
    type: 'manpower',
    unit: 'persons',
    totalCapacity: 48,
    notes: 'Engineering and technical team',
  },
];

for (const resource of sampleResources) {
  await prisma.resource.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: resource.name,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      ...resource,
    },
  });
}

console.log(`Project ready: ${project.name} (${project.code})`);



  console.log(`Admin user ready: ${adminEmail}`);
  console.log('NOTE: change the seeded admin password immediately after first login.');
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });