const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const auditPath = path.join(__dirname, '../audit_final.json');
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

  const aRetravaillerIds = new Set();
  const aSupprimerIds = new Set();
  const garderIds = new Set();

  for (const item of audit) {
    let decision = item.decision;
    if (item.id === 8464 || [6882, 6892, 6899].includes(item.id)) {
      decision = 'REQUALIFIER';
    }

    if (decision === 'REQUALIFIER') {
      aRetravaillerIds.add(item.id);
    } else if (decision === 'SUPPRIMER') {
      aSupprimerIds.add(item.id);
    } else {
      garderIds.add(item.id);
    }
  }

  console.log(`Plan de marquage d'audit :`);
  console.log(`- A_RETRAVAILLER : ${aRetravaillerIds.size} produits`);
  console.log(`- A_SUPPRIMER    : ${aSupprimerIds.size} produits`);
  console.log(`- SANS TAG (Garder) : ${garderIds.size} produits`);

  // 1. Reset all adminAuditTag to null first
  await prisma.$executeRawUnsafe(`UPDATE "Product" SET "adminAuditTag" = NULL;`);

  // 2. Apply A_RETRAVAILLER
  if (aRetravaillerIds.size > 0) {
    const idsList = Array.from(aRetravaillerIds).join(',');
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET "adminAuditTag" = 'A_RETRAVAILLER' WHERE id IN (${idsList});`
    );
  }

  // 3. Apply A_SUPPRIMER
  if (aSupprimerIds.size > 0) {
    const idsList = Array.from(aSupprimerIds).join(',');
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET "adminAuditTag" = 'A_SUPPRIMER' WHERE id IN (${idsList});`
    );
  }

  // Verify in database
  const countRetravailler = await prisma.$queryRaw`SELECT count(*)::int as count FROM "Product" WHERE "adminAuditTag" = 'A_RETRAVAILLER'`;
  const countSupprimer = await prisma.$queryRaw`SELECT count(*)::int as count FROM "Product" WHERE "adminAuditTag" = 'A_SUPPRIMER'`;
  const countNull = await prisma.$queryRaw`SELECT count(*)::int as count FROM "Product" WHERE "adminAuditTag" IS NULL`;

  console.log(`\nVérification en base de données Supabase / PostgreSQL :`);
  console.log(`- Produits tagués 'A_RETRAVAILLER' : ${countRetravailler[0].count}`);
  console.log(`- Produits tagués 'A_SUPPRIMER'    : ${countSupprimer[0].count}`);
  console.log(`- Produits sans tag (Garder/autre) : ${countNull[0].count}`);

  // 4. Also synchronize src/data/products.json fallback if it exists
  const jsonPath = path.join(__dirname, '../src/data/products.json');
  if (fs.existsSync(jsonPath)) {
    const localProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const p of localProducts) {
      if (aRetravaillerIds.has(p.id)) {
        p.adminAuditTag = 'A_RETRAVAILLER';
        p.admin_audit_tag = 'A_RETRAVAILLER';
      } else if (aSupprimerIds.has(p.id)) {
        p.adminAuditTag = 'A_SUPPRIMER';
        p.admin_audit_tag = 'A_SUPPRIMER';
      } else {
        p.adminAuditTag = null;
        p.admin_audit_tag = null;
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(localProducts, null, 2), 'utf8');
    console.log(`\nSynchronisation effectuée sur src/data/products.json (${localProducts.length} produits).`);
  }
}

main()
  .catch((e) => {
    console.error('Erreur lors du marquage :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
