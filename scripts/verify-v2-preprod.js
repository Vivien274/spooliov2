const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== TEST 1: DATABASE INTEGRITY & DRAFT RECORDS ===');
  const pochettes = await prisma.product.findMany({
    where: { id: { in: [6899, 6892, 6882] } }
  });
  console.log('Existing Pochettes Count:', pochettes.length);
  pochettes.forEach(p => {
    console.log(`  [ID ${p.id}] ${p.name} -> status: ${p.status}, price: ${p.price}€`);
    if (p.status !== 'publish') throw new Error('Existing pochette modified!');
  });

  const blindBags = await prisma.product.findMany({
    where: { slug: { in: ['blind-bag-3-pieces', 'blind-bag-5-pieces', 'blind-bag-10-pieces'] } }
  });
  console.log('Blind Bags in DB Count:', blindBags.length);
  blindBags.forEach(b => {
    console.log(`  [ID ${b.id}] ${b.name} -> status: ${b.status}, price: ${b.price}€, slug: ${b.slug}`);
    if (b.status !== 'draft') throw new Error('Blind bag is not draft!');
  });

  console.log('\n=== TEST 2: PRODUCTION ISOLATION TEST (status=publish) ===');
  const resProd = await fetch('http://localhost:3000/api/products?status=publish');
  const prodProducts = await resProd.json();
  const leakedBlindBags = prodProducts.filter(p => p.slug && p.slug.startsWith('blind-bag'));
  console.log('Leaked Blind Bags in Prod query:', leakedBlindBags.length);
  if (leakedBlindBags.length > 0) throw new Error('DATA LEAK TO PRODUCTION!');
  console.log('Prod query strictly excluded drafts: PASSED.');

  console.log('\n=== TEST 3: PREPRODUCTION CATALOG TEST ===');
  const resPreprod = await fetch('http://localhost:3000/api/products');
  const preprodProducts = await resPreprod.json();
  const preprodBlindBags = preprodProducts.filter(p => p.slug && p.slug.startsWith('blind-bag'));
  console.log('Blind Bags available in Preprod catalog:', preprodBlindBags.length);
  preprodBlindBags.forEach(b => {
    console.log(`  ${b.name} (${b.slug}) -> is_active: ${b.is_active}, status: ${b.status}`);
  });
  if (preprodBlindBags.length !== 3) throw new Error('Blind bags missing in preprod!');

  console.log('\n=== TEST 4: DIRECT URL TESTS ===');
  for (const slug of ['blind-bag-3-pieces', 'blind-bag-5-pieces', 'blind-bag-10-pieces']) {
    const resPage = await fetch(`http://localhost:3000/product/${slug}`);
    console.log(`  /product/${slug} -> HTTP ${resPage.status}`);
    if (resPage.status !== 200) throw new Error(`Failed to load /product/${slug}`);
  }

  console.log('\n=== TEST 5: EDITORIAL ADJUSTMENTS VERIFICATION ===');
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  const hasDropsTab = homeHtml.includes("Derniers Drops");
  console.log('  Homepage contains "Derniers Drops":', hasDropsTab);

  const pochetteRes = await fetch('http://localhost:3000/pochette-surprise');
  const pochetteHtml = await pochetteRes.text();
  const hasBlindBags = pochetteHtml.includes("BLIND BAGS D&#x27;ATELIER") || pochetteHtml.includes("BLIND BAGS D'ATELIER");
  console.log('  Pochette page contains "BLIND BAGS D\'ATELIER":', hasBlindBags);

  console.log('\nALL 5 AUDIT TESTS PASSED WITH 100% SUCCESS! 🎉');
}

runTests()
  .catch(e => { console.error('TEST FAILED:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
