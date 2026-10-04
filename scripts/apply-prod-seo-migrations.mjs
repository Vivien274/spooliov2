#!/usr/bin/env node
/**
 * scripts/apply-prod-seo-migrations.mjs
 *
 * Script sécurisé et idempotent de mise à niveau de la base de données :
 * 1. Renommage contrôlé des slugs invalides vers leurs cibles normalisées.
 * 2. Rétrogradation des balises <h1> parasites internes en <h2> dans les articles et fiches produits.
 *
 * Sécurités implémentées :
 * - Mode --dry-run par défaut (aucune écriture sans argument explicite --apply).
 * - Détection et arrêt bloquant en cas de conflit ambigu (ancien slug et slug cible existant simultanément).
 * - Exécution au sein d'une transaction Prisma interactive atomique en mode --apply.
 * - Rapport détaillé avant / après.
 *
 * Utilisation :
 *   node scripts/apply-prod-seo-migrations.mjs           # Simulation sécurisée
 *   node scripts/apply-prod-seo-migrations.mjs --apply   # Application réelle dans une transaction
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isApply = process.argv.includes("--apply") || process.argv.includes("--execute");
const isDryRun = !isApply;

async function runSeoMigrations() {
  console.log("==================================================================");
  console.log(`🔒 [MIGRATION SEO BDD] Mode : ${isDryRun ? "SIMULATION (--dry-run)" : "APPLICATION RÉELLE (--apply)"}`);
  console.log("==================================================================\n");

  const plannedOperations = [];
  const conflicts = [];

  // --- 1. Audit Slug 1: boucles d'oreilles feuilles été ---
  const invalidSlug1Variants = [
    "boucles-d'oreilles---feuilles-été",
    "boucles-d'oreilles---feuilles-\u00e9t\u00e9",
    "boucles-d%27oreilles---feuilles-%C3%A9t%C3%A9"
  ];
  const targetSlug1 = "boucles-doreilles-feuilles-ete";

  const target1 = await prisma.product.findUnique({ where: { slug: targetSlug1 } });
  let oldProduct1 = null;
  for (const variant of invalidSlug1Variants) {
    const found = await prisma.product.findUnique({ where: { slug: variant } });
    if (found) {
      oldProduct1 = found;
      break;
    }
  }

  if (target1 && oldProduct1 && target1.id !== oldProduct1.id) {
    conflicts.push(
      `[CONFLIT AMBIGU] Le produit cible "${targetSlug1}" (ID: ${target1.id}) et l'ancien produit "${oldProduct1.slug}" (ID: ${oldProduct1.id}) existent tous les deux avec des identifiants distincts.`
    );
  } else if (!target1 && oldProduct1) {
    plannedOperations.push({
      type: "product_slug_rename",
      entityId: oldProduct1.id,
      title: `Produit "${oldProduct1.name}" (ID ${oldProduct1.id})`,
      before: `slug="${oldProduct1.slug}", permalink="${oldProduct1.permalink}"`,
      after: `slug="${targetSlug1}", permalink="/product/${targetSlug1}"`,
      execute: async (tx) => {
        await tx.product.update({
          where: { id: oldProduct1.id },
          data: { slug: targetSlug1, permalink: `/product/${targetSlug1}` },
        });
      },
    });
  } else if (target1 && !oldProduct1) {
    console.log(`  [OK] Slug 1 : Cible "${targetSlug1}" active (ID: ${target1.id}), aucun ancien slug invalide résiduel.`);
  } else {
    console.log(`  [INFO] Slug 1 : Aucun produit trouvé avec les slugs ciblés.`);
  }

  // --- 2. Audit Slug 2: oeuf de serpent / dragon ---
  const invalidSlug2 = "oeuf-de-serpent-/-dragon";
  const targetSlug2 = "oeuf-de-serpent-dragon";

  const target2 = await prisma.product.findUnique({ where: { slug: targetSlug2 } });
  const oldProduct2 = await prisma.product.findUnique({ where: { slug: invalidSlug2 } });

  if (target2 && oldProduct2 && target2.id !== oldProduct2.id) {
    conflicts.push(
      `[CONFLIT AMBIGU] Le produit cible "${targetSlug2}" (ID: ${target2.id}) et l'ancien produit "${invalidSlug2}" (ID: ${oldProduct2.id}) existent tous les deux avec des identifiants distincts.`
    );
  } else if (!target2 && oldProduct2) {
    plannedOperations.push({
      type: "product_slug_rename",
      entityId: oldProduct2.id,
      title: `Produit "${oldProduct2.name}" (ID ${oldProduct2.id})`,
      before: `slug="${oldProduct2.slug}", permalink="${oldProduct2.permalink}"`,
      after: `slug="${targetSlug2}", permalink="/product/${targetSlug2}"`,
      execute: async (tx) => {
        await tx.product.update({
          where: { id: oldProduct2.id },
          data: { slug: targetSlug2, permalink: `/product/${targetSlug2}` },
        });
      },
    });
  } else if (target2 && !oldProduct2) {
    console.log(`  [OK] Slug 2 : Cible "${targetSlug2}" active (ID: ${target2.id}), aucun ancien slug invalide résiduel.`);
  } else {
    console.log(`  [INFO] Slug 2 : Aucun produit trouvé avec les slugs ciblés.`);
  }

  // --- 3. Audit Blog Post : Double H1 ---
  const blogSlug = "pourquoi-l-impression-3d-magie-envers-du-decor-chez-spoolio";
  const post = await prisma.blogPost.findUnique({ where: { slug: blogSlug } });

  if (post && post.content && (post.content.includes("<h1") || post.content.includes("</h1>"))) {
    const sanitizedContent = post.content
      .replace(/<h1(\s|>)/gi, "<h2$1")
      .replace(/<\/h1>/gi, "</h2>");

    plannedOperations.push({
      type: "blog_h1_retrofit",
      entityId: post.id,
      title: `Article de Blog "${post.title}" (ID ${post.id})`,
      before: `Contient des balises <h1> internes dans le corps HTML`,
      after: `Balises <h1> internes rétrogradées en <h2> pour préserver l'unicité du H1 de page`,
      execute: async (tx) => {
        await tx.blogPost.update({
          where: { id: post.id },
          data: { content: sanitizedContent },
        });
      },
    });
  } else if (post) {
    console.log(`  [OK] Blog Post (ID ${post.id}) : Aucun <h1> parasite détecté dans le contenu.`);
  }

  // --- 4. Audit Fiches Produits : H1 internes dans les descriptions ---
  const productsWithH1 = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: "<h1" } },
        { shortDescription: { contains: "<h1" } },
      ],
    },
    select: { id: true, name: true, slug: true, description: true, shortDescription: true },
  });

  if (productsWithH1.length > 0) {
    for (const p of productsWithH1) {
      const sanitizedDesc = p.description
        ? p.description.replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>")
        : p.description;
      const sanitizedShortDesc = p.shortDescription
        ? p.shortDescription.replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>")
        : p.shortDescription;

      plannedOperations.push({
        type: "product_h1_retrofit",
        entityId: p.id,
        title: `Produit "${p.name}" (ID ${p.id}, slug "${p.slug}")`,
        before: `Contient <h1 dans description ou shortDescription`,
        after: `Balises <h1> internes rétrogradées en <h2>`,
        execute: async (tx) => {
          await tx.product.update({
            where: { id: p.id },
            data: {
              description: sanitizedDesc,
              shortDescription: sanitizedShortDesc,
            },
          });
        },
      });
    }
  } else {
    console.log(`  [OK] Descriptions Produits : Aucun <h1> parasite détecté en base.`);
  }

  console.log("\n------------------------------------------------------------------");
  console.log(`📋 RAPPORT PRÉ-EXÉCUTION :`);
  console.log(`  - Opérations planifiées : ${plannedOperations.length}`);
  console.log(`  - Conflits bloquants : ${conflicts.length}`);
  console.log("------------------------------------------------------------------\n");

  if (conflicts.length > 0) {
    console.error("❌ ARRÊT IMMÉDIAT : Conflits ambigus détectés. Aucune modification ne sera appliquée.");
    for (const conflict of conflicts) {
      console.error(`  - ${conflict}`);
    }
    process.exit(1);
  }

  if (plannedOperations.length === 0) {
    console.log("✅ La base de données est déjà 100% conforme. Aucune modification à appliquer.");
    return;
  }

  console.log("Détail des opérations planifiées :");
  for (let i = 0; i < plannedOperations.length; i++) {
    const op = plannedOperations[i];
    console.log(`\n[Opération ${i + 1}/${plannedOperations.length}] : ${op.title}`);
    console.log(`  AVANT : ${op.before}`);
    console.log(`  APRÈS : ${op.after}`);
  }

  if (isDryRun) {
    console.log("\n==================================================================");
    console.log("ℹ️  MODE SIMULATION (--dry-run) : Aucune écriture n'a été effectuée.");
    console.log("   Pour appliquer ces modifications dans une transaction atomique,");
    console.log("   exécutez : node scripts/apply-prod-seo-migrations.mjs --apply");
    console.log("==================================================================");
    return;
  }

  // --- Exécution réelle dans une transaction Prisma ---
  console.log("\n🚀 Application des modifications au sein d'une transaction Prisma...");
  await prisma.$transaction(async (tx) => {
    for (const op of plannedOperations) {
      await op.execute(tx);
    }
  });

  console.log("✅ Toutes les opérations ont été appliquées avec succès dans la transaction.");
}

runSeoMigrations()
  .catch((err) => {
    console.error("❌ Erreur lors de l'exécution des migrations SEO :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
