/**
 * scripts/create-client-user.js
 * *** NEW FILE — place at: backend/scripts/create-client-user.js ***
 *
 * One-off provisioning script that creates (or re-links) the read-only
 * Client login and scopes it to your project via project_members. Safe
 * to re-run — it's an upsert, and it will NEVER silently overwrite an
 * already-set password on an existing user.
 *
 * Usage (from your backend project root, same place you run
 * `npm run prisma:seed`):
 *
 *   CLIENT_EMAIL="client@yourclientdomain.com" \
 *   CLIENT_PASSWORD="SomeTempStrongPass123!" \
 *   CLIENT_NAME="PDISA-2 Client Viewer" \
 *   PROJECT_CODE="WSDP-LUBANGO-001" \
 *   node scripts/create-client-user.js
 *
 * On Windows (PowerShell):
 *   $env:CLIENT_EMAIL="client@yourclientdomain.com"
 *   $env:CLIENT_PASSWORD="SomeTempStrongPass123!"
 *   $env:CLIENT_NAME="PDISA-2 Client Viewer"
 *   $env:PROJECT_CODE="WSDP-LUBANGO-001"
 *   node scripts/create-client-user.js
 *
 * If you omit the env vars, the fallback defaults below are used —
 * ALWAYS set CLIENT_PASSWORD explicitly for anything beyond local
 * testing, and have the client change it immediately via
 * POST /api/v1/auth/password/change after their first login.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.CLIENT_EMAIL || 'client@pdisa2-lubango.example';
  const password = process.env.CLIENT_PASSWORD || 'ChangeMeClient123!';
  const name = process.env.CLIENT_NAME || 'PDISA-2 Client Viewer';
  const projectCode = process.env.PROJECT_CODE || 'WSDP-LUBANGO-001';

  const clientRole = await prisma.role.findUnique({ where: { name: 'client' } });
  if (!clientRole) {
    throw new Error(
      "Role 'client' not found in the roles table — run `npm run prisma:seed` (with the updated seed.js) first."
    );
  }

  const project = await prisma.project.findUnique({ where: { code: projectCode } });
  if (!project) {
    throw new Error(`Project with code '${projectCode}' not found. Check PROJECT_CODE.`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existingUser) {
    // Re-running against an existing user only fixes role/status — it
    // deliberately never touches passwordHash, so a client who already
    // changed their password never gets silently reset.
    user = await prisma.user.update({
      where: { email },
      data: { roleId: clientRole.id, status: 'active' },
    });
    console.log(`Existing user found — role/status updated, password left untouched.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: clientRole.id,
        status: 'active',
      },
    });
    console.log(`New client user created with the temporary password you provided.`);
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: user.id } },
    update: { roleOnProject: 'client' },
    create: { projectId: project.id, userId: user.id, roleOnProject: 'client' },
  });

  console.log('---------------------------------------------------------');
  console.log(`Client user ready : ${email}`);
  console.log(`Role              : client (read-only, per role_permissions)`);
  console.log(`Linked to project : ${project.name} (${project.code})`);
  console.log('---------------------------------------------------------');
  if (!existingUser) {
    console.log('Share this temporary password with the client through a secure');
    console.log('channel (not email/chat in plaintext), and have them change it');
    console.log('immediately via POST /api/v1/auth/password/change.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
