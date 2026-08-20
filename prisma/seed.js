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

// -----------------------------------------------------------------------
// Resource Dashboard reporting tables — migrated from what used to be
// hardcoded arrays in js/resource-dashboard.js, so these tables now have
// real, persistent rows that can be edited via the CRUD APIs.
// -----------------------------------------------------------------------

console.log('Seeding HDPE pipe stock...');
const hdpePipeStockRows = [
  { diameter: 'De20 PN16', receivedM: 41100, usedM: 1200 },
  { diameter: 'De25 PN16', receivedM: 44844, usedM: 7200 },
  { diameter: 'De63 PN10', receivedM: 32784, usedM: 12960 },
  { diameter: 'De75 PN10', receivedM: 1968, usedM: 0 },
  { diameter: 'De90 PN10', receivedM: 7728, usedM: 4836 },
  { diameter: 'De110 PN10', receivedM: 3420, usedM: 1032 },
  { diameter: 'De160 PN10', receivedM: 6860, usedM: 912 },
  { diameter: 'De200 PN10', receivedM: 4896, usedM: 1152 },
  { diameter: 'De250 PN10', receivedM: 2592, usedM: 1964 },
  { diameter: 'De315 PN10', receivedM: 1872, usedM: 888 },
  { diameter: 'De110 PN16', receivedM: 12, usedM: 0 },
  { diameter: 'De160 PN16', receivedM: 300, usedM: 0 },
];

for (let i = 0; i < hdpePipeStockRows.length; i++) {
  const row = hdpePipeStockRows[i];
  await prisma.hdpePipeStock.upsert({
    where: {
      projectId_diameter: {
        projectId: project.id,
        diameter: row.diameter,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      diameter: row.diameter,
      receivedM: row.receivedM,
      usedM: row.usedM,
      sortOrder: i,
    },
  });
}

console.log('Seeding equipment deployment...');
const equipmentDeploymentRows = [
  { category: 'Earthmoving (Excavator, dump truck, backhoe)', planned: null, deployed: 4, remarks: 'No planned baseline set; utilization to be monitored against June work-front ramp-up' },
  { category: 'Welding (Butt fusion, manual, handheld)', planned: null, deployed: 11, remarks: 'Adequate coverage for current pipe-fusion works' },
  { category: 'Generators (30/15/10/2.5 kW)', planned: null, deployed: 5, remarks: 'Sufficient for active work fronts' },
  { category: 'Light Vehicles (Pickups + truck)', planned: null, deployed: 7, remarks: 'Adequate site mobility support' },
  { category: 'Tamping, cutting, grinder, jackhammer', planned: null, deployed: 12, remarks: 'Adequate for pavement and concrete works' },
  { category: 'Survey (GPS, level)', planned: null, deployed: 2, remarks: 'Minimum required; no spare unit available' },
  { category: 'Test equipment (Pump, tanks)', planned: null, deployed: 3, remarks: 'Repeat pressure test required (DN250, 463 m) due to equipment failure' },
  { category: 'Other', planned: null, deployed: 2, remarks: 'Miscellaneous support equipment' },
  { category: 'TOTAL', planned: 61, deployed: 46, remarks: 'Shortfall of 15 units vs May plan; additional mobilization pending', isTotal: true },
];

for (let i = 0; i < equipmentDeploymentRows.length; i++) {
  const row = equipmentDeploymentRows[i];
  const existing = await prisma.equipmentDeployment.findFirst({
    where: { projectId: project.id, category: row.category },
  });
  if (!existing) {
    await prisma.equipmentDeployment.create({
      data: {
        projectId: project.id,
        category: row.category,
        planned: row.planned,
        deployed: row.deployed,
        remarks: row.remarks,
        isTotal: row.isTotal || false,
        sortOrder: i,
      },
    });
  }
}

console.log('Seeding workforce by employer...');
const workforceEmployerRows = [
  { groupName: 'CTCE Direct (17)', category: 'Construction Manager', headcount: 1 },
  { groupName: null, category: 'Site Engineers', headcount: 2 },
  { groupName: null, category: 'Land Surveyor', headcount: 1 },
  { groupName: null, category: 'HSE Officer + Assistant', headcount: 2 },
  { groupName: null, category: 'Social Expert + Assistants', headcount: 9 },
  { groupName: null, category: 'Other Specialists', headcount: 2 },
  { groupName: 'XINYI Subcontractor (58)', category: 'Skilled', headcount: 4 },
  { groupName: null, category: 'Unskilled', headcount: 54 },
  { groupName: 'SHIGUO Subcontractor (40)', category: 'Skilled', headcount: 4 },
  { groupName: null, category: 'Unskilled', headcount: 36 },
  { groupName: 'Grand Total', category: null, headcount: 115, isTotal: true },
];

const existingWorkforceCount = await prisma.workforceEmployer.count({ where: { projectId: project.id } });
if (existingWorkforceCount === 0) {
  for (let i = 0; i < workforceEmployerRows.length; i++) {
    const row = workforceEmployerRows[i];
    await prisma.workforceEmployer.create({
      data: {
        projectId: project.id,
        groupName: row.groupName,
        category: row.category,
        headcount: row.headcount,
        isTotal: row.isTotal || false,
        sortOrder: i,
      },
    });
  }
}

console.log('Resource dashboard reporting tables seeded.');

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
