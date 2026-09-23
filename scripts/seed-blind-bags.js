const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const BLIND_BAGS = [
  {
    slug: 'blind-bag-3-pieces',
    name: "Blind Bag Spoolio — 3 Créations d'Atelier",
    price: '12.00',
    shortDescription: "Un sachet kraft scellé à l'atelier contenant 3 créations surprises : haptique, mécanique et mini-sculptures de bureau.",
    description: "<p>Un sachet kraft scellé à l'atelier contenant 3 créations surprises : haptique, mécanique et mini-sculptures de bureau.</p>\n<p><strong>Packaging :</strong> Sachet kraft écoresponsable scellé d'un sticker Spoolio.</p>\n<p><strong>Mentions légales / Sécurité :</strong> Objets de collection et accessoires de bureau destinés aux adultes et adolescents (+14 ans). Fabrication additive de précision à Comines en PLA biosourcé de maïs.</p>",
    image: '/images/imported/Pochette_S.png',
  },
  {
    slug: 'blind-bag-5-pieces',
    name: "Blind Bag Spoolio — 5 Créations d'Atelier",
    price: '18.00',
    shortDescription: "Le pack idéal pour votre desk setup : 5 objets tactiles et accessoires surprises sortis de nos machines.",
    description: "<p>Le pack idéal pour votre desk setup : 5 objets tactiles et accessoires surprises sortis de nos machines.</p>\n<p><strong>Packaging :</strong> Sachet kraft écoresponsable scellé d'un sticker Spoolio.</p>\n<p><strong>Mentions légales / Sécurité :</strong> Objets de collection et accessoires de bureau destinés aux adultes et adolescents (+14 ans). Fabrication additive de précision à Comines en PLA biosourcé de maïs.</p>",
    image: '/images/imported/PochetteM-1.png',
  },
  {
    slug: 'blind-bag-10-pieces',
    name: "Blind Bag Spoolio — 10 Créations Collector",
    price: '32.00',
    shortDescription: "L'expérience d'unboxing complète : 10 pièces d'atelier incluant finitions rares et mécanismes exclusifs.",
    description: "<p>L'expérience d'unboxing complète : 10 pièces d'atelier incluant finitions rares et mécanismes exclusifs.</p>\n<p><strong>Packaging :</strong> Sachet kraft écoresponsable scellé d'un sticker Spoolio.</p>\n<p><strong>Mentions légales / Sécurité :</strong> Objets de collection et accessoires de bureau destinés aux adultes et adolescents (+14 ans). Fabrication additive de précision à Comines en PLA biosourcé de maïs.</p>",
    image: '/images/imported/Pochette_L.png',
  },
];

async function main() {
  console.log('--- 1. Verification of existing Pochette Surprise records ---');
  const existingPochettes = await prisma.product.findMany({
    where: { id: { in: [6899, 6892, 6882] } },
    select: { id: true, name: true, slug: true, status: true, price: true }
  });
  console.log('Protected existing pochettes in DB (MUST REMAIN INTACT):');
  console.table(existingPochettes);

  console.log('\n--- 2. Checking Category 113 (Pochettes surprise) ---');
  let cat113 = await prisma.category.findUnique({ where: { id: 113 } });
  if (!cat113) {
    console.log('Category 113 not found, checking by slug...');
    cat113 = await prisma.category.findUnique({ where: { slug: 'pochettes-surprise' } });
  }
  console.log('Target Category for Blind Bags:', cat113 ? `${cat113.name} (id: ${cat113.id})` : 'None (will skip connect)');

  console.log('\n--- 3. Inserting or updating 3 Blind Bags in DRAFT status ---');
  for (const item of BLIND_BAGS) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { images: true }
    });

    if (existing) {
      console.log(`Product "${item.slug}" already exists (id: ${existing.id}), verifying draft status...`);
      if (existing.status !== 'draft') {
        await prisma.product.update({
          where: { id: existing.id },
          data: { status: 'draft' }
        });
        console.log(`Updated "${item.slug}" to status: draft`);
      }
    } else {
      const created = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          permalink: `/product/${item.slug}`,
          price: item.price,
          regularPrice: item.price,
          shortDescription: item.shortDescription,
          description: item.description,
          status: 'draft',
          stock: 50,
          productType: 'simple',
          images: {
            create: [
              {
                src: item.image,
                name: item.name,
                alt: item.name
              }
            ]
          },
          ...(cat113 ? { categories: { connect: [{ id: cat113.id }] } } : {})
        },
        include: { images: true, categories: true }
      });
      console.log(`Created new draft product: ${created.name} (id: ${created.id}, status: ${created.status})`);
    }
  }

  console.log('\n--- 4. Updating local products.json fallback with draft items ---');
  const jsonPath = path.join(process.cwd(), 'src/data/products.json');
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const products = JSON.parse(raw);
    let modified = false;

    for (const item of BLIND_BAGS) {
      const idx = products.findIndex((p) => p.slug === item.slug);
      const jsonEntry = {
        id: 99000 + BLIND_BAGS.indexOf(item) + 1,
        name: item.name,
        slug: item.slug,
        permalink: `/product/${item.slug}`,
        price: item.price,
        regular_price: item.price,
        sale_price: '',
        on_sale: false,
        status: 'draft',
        stock: 50,
        short_description: item.shortDescription,
        description: item.description,
        categories: cat113 ? [{ id: cat113.id, name: cat113.name, slug: cat113.slug }] : [],
        images: [{ id: 99100 + BLIND_BAGS.indexOf(item), src: item.image, name: item.name, alt: item.name }],
        date_created: new Date().toISOString()
      };

      if (idx === -1) {
        products.push(jsonEntry);
        modified = true;
        console.log(`Added "${item.slug}" to products.json fallback.`);
      } else {
        products[idx].status = 'draft';
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
      console.log('Successfully saved local products.json fallback.');
    }
  }

  console.log('\n--- 5. Final validation of protected pochettes ---');
  const finalPochettes = await prisma.product.findMany({
    where: { id: { in: [6899, 6892, 6882] } },
    select: { id: true, name: true, slug: true, status: true, price: true }
  });
  console.table(finalPochettes);
  console.log('ALL PROTECTED POCHETTES UNTOUCHED AND STILL "publish".');
}

main()
  .catch((e) => {
    console.error('Error seeding blind bags:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
