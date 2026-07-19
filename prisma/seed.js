require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is missing");
  process.exit(1);
}

let prisma;

try {
  prisma = new PrismaClient();
} catch (err) {
  console.error("Failed to initialize Prisma client for seed:", err);
  process.exit(1);
}

const productsPath = path.join(__dirname, '../src/data/products.json');
const categoriesPath = path.join(__dirname, '../src/data/categories.json');
const blogPath = path.join(__dirname, '../src/data/blog.json');
const pagesPath = path.join(__dirname, '../src/data/pages.json');

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records
  console.log('Cleaning old records...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.page.deleteMany();

  // 2. Load JSON files
  const rawCategories = fs.existsSync(categoriesPath) ? JSON.parse(fs.readFileSync(categoriesPath, 'utf8')) : [];
  const rawProducts = fs.existsSync(productsPath) ? JSON.parse(fs.readFileSync(productsPath, 'utf8')) : [];
  const rawBlog = fs.existsSync(blogPath) ? JSON.parse(fs.readFileSync(blogPath, 'utf8')) : [];
  const rawPages = fs.existsSync(pagesPath) ? JSON.parse(fs.readFileSync(pagesPath, 'utf8')) : [];

  console.log(`Loaded JSONs: ${rawCategories.length} categories, ${rawProducts.length} products, ${rawBlog.length} posts, ${rawPages.length} pages.`);

  // 3. Seed Categories
  console.log('Seeding categories...');
  const categoryMap = new Map(); // Keep track of seeded categories and their database ID
  const seededCategorySlugs = new Set();
  
  for (const cat of rawCategories) {
    let uniqueSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
    let counter = 1;
    while (seededCategorySlugs.has(uniqueSlug)) {
      uniqueSlug = `${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}-${counter}`;
      counter++;
    }
    seededCategorySlugs.add(uniqueSlug);

    try {
      const created = await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          slug: uniqueSlug,
        }
      });
      categoryMap.set(cat.id, created.id);
    } catch (e) {
      console.warn(`Could not seed category ${cat.name}:`, e.message);
    }
  }

  // 4. Seed Products
  console.log('Seeding products & product images...');
  const seededProductSlugs = new Set();
  for (const p of rawProducts) {
    // Prepare categories relations
    const catRelations = [];
    if (p.categories && p.categories.length > 0) {
      for (const rawCat of p.categories) {
        if (categoryMap.has(rawCat.id)) {
          catRelations.push({ id: categoryMap.get(rawCat.id) });
        } else {
          // If a category in product is not in main categories list, create it on-the-fly
          try {
            const newCat = await prisma.category.create({
              data: {
                id: rawCat.id,
                name: rawCat.name,
                slug: rawCat.slug || rawCat.name.toLowerCase().replace(/\s+/g, '-'),
              }
            });
            categoryMap.set(rawCat.id, newCat.id);
            catRelations.push({ id: newCat.id });
          } catch (e) {
            // Already exists or insert error
            catRelations.push({ slug: rawCat.slug });
          }
        }
      }
    }

    let uniqueSlug = p.slug || p.name.toLowerCase().replace(/\s+/g, '-');
    let counter = 1;
    while (seededProductSlugs.has(uniqueSlug)) {
      uniqueSlug = `${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}-${counter}`;
      counter++;
    }
    seededProductSlugs.add(uniqueSlug);

    try {
      // Build Prisma data
      const data = {
        id: p.id,
        name: p.name,
        slug: uniqueSlug,
        permalink: p.permalink,
        price: p.price || "0",
        regularPrice: p.regular_price || p.price || "0",
        salePrice: p.sale_price || null,
        onSale: p.on_sale || false,
        shortDescription: p.short_description || "",
        description: p.description || "",
        stock: p.stock_quantity || (p.stock === 0 ? 0 : p.stock || 10), // handling both wc formats
        productType: p.type || "simple",
        status: p.status || "publish",
        seoScore: p.seoScore || 70,
        dateCreated: p.date_created ? new Date(p.date_created) : new Date(),
        categories: {
          connect: catRelations.map(c => ({ id: c.id }))
        },
        images: {
          create: (p.images || []).map(img => ({
            src: img.src,
            name: img.name || p.name,
            alt: img.alt || p.name,
          }))
        },
        attributes: p.attributes ? JSON.stringify(p.attributes) : null,
      };

      await prisma.product.create({ data });
    } catch (e) {
      console.error(`Error seeding product ${p.name}:`, e.message);
    }
  }

  // 5. Seed Blog Posts
  console.log('Seeding blog posts...');
  const seededBlogSlugs = new Set();
  for (const post of rawBlog) {
    let uniqueSlug = post.slug || post.title?.rendered?.toLowerCase().replace(/\s+/g, '-') || 'post';
    let counter = 1;
    while (seededBlogSlugs.has(uniqueSlug)) {
      uniqueSlug = `${post.slug || 'post'}-${counter}`;
      counter++;
    }
    seededBlogSlugs.add(uniqueSlug);

    try {
      await prisma.blogPost.create({
        data: {
          id: post.id,
          title: post.title?.rendered || post.title || 'Untitled',
          slug: uniqueSlug,
          content: typeof post.content === 'object' ? (post.content.rendered || JSON.stringify(post.content)) : (post.content || ''),
          excerpt: typeof post.excerpt === 'object' ? (post.excerpt.rendered || JSON.stringify(post.excerpt)) : (post.excerpt || ''),
          date: post.date ? new Date(post.date) : new Date(),
          status: post.status || 'publish',
          featuredImageUrl: post.featured_image_url || null,
        }
      });
    } catch (e) {
      console.error(`Error seeding blog post ${post.title?.rendered}:`, e.message);
    }
  }

  // 6. Seed Pages
  console.log('Seeding pages...');
  const seededPageSlugs = new Set();
  for (const pg of rawPages) {
    let uniqueSlug = pg.slug || pg.title?.rendered?.toLowerCase().replace(/\s+/g, '-') || 'page';
    let counter = 1;
    while (seededPageSlugs.has(uniqueSlug)) {
      uniqueSlug = `${pg.slug || 'page'}-${counter}`;
      counter++;
    }
    seededPageSlugs.add(uniqueSlug);

    try {
      await prisma.page.create({
        data: {
          id: pg.id,
          title: pg.title?.rendered || pg.title || 'Untitled',
          slug: uniqueSlug,
          content: typeof pg.content === 'object' ? (pg.content.rendered || JSON.stringify(pg.content)) : (pg.content || ''),
          date: pg.date ? new Date(pg.date) : new Date(),
          status: pg.status || 'publish',
          featuredImageUrl: pg.featured_image_url || null,
        }
      });
    } catch (e) {
      console.error(`Error seeding page ${pg.title?.rendered}:`, e.message);
    }
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
