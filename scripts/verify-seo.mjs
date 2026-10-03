#!/usr/bin/env node
/**
 * scripts/verify-seo.mjs
 * 
 * Audit et contrôle automatisé SEO technique de bout en bout :
 * 1. Téléchargement et validation de /robots.txt
 * 2. Téléchargement, parsing XML et contrôle d'unicité des URLs de /sitemap.xml
 * 3. Préchargement groupé avec tentatives des produits et avis réels en BDD (PostgreSQL / Supabase)
 * 4. Crawl HTTP réel de chaque URL du sitemap (sans redirection, statut 200 strict)
 * 5. Contrôle d'unicité et de conformité de la balise canonical (https://www.spoolio.fr)
 * 6. Contrôle de correspondance stricte og:url === canonical
 * 7. Contrôle d'unicité stricte du H1 (exactement 1 H1 par page indexable)
 * 8. Présence et unicité des balises <title> et <meta name="description">
 * 9. Détection des doublons de title / description sur des URLs distinctes
 * 10. Parsing réel de tous les blocs JSON-LD (<script type="application/ld+json">)
 * 11. Contrôle d'existence réelle de Product.url et Offer.url (HTTP 200 direct)
 * 12. Comparaison stricte du prix JSON-LD avec la donnée produit réelle en base de données
 * 13. Comparaison stricte de tout AggregateRating avec les avis approuvés réels en base de données
 * 14. Contrôle des horaires d'ouverture conditionné dynamiquement par openingHoursConfirmed
 * 15. Confirmation qu'aucune URL du sitemap n'a de noindex ni n'est une page privée
 * 16. Décompte rigoureux : toute anomalie BDD ou HTTP entraîne l'échec strict de la page et du script.
 * 
 * Utilisation :
 *   node scripts/verify-seo.mjs [--base-url=http://localhost:3000]
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Extraction de l'URL de base passée en argument
const args = process.argv.slice(2);
let baseUrl = "http://localhost:3000";
for (const arg of args) {
  if (arg.startsWith("--base-url=")) {
    baseUrl = arg.split("=")[1].replace(/\/$/, "");
  }
}

const CANONICAL_ORIGIN = "https://www.spoolio.fr";
const PRIVATE_PATH_PREFIXES = [
  "/admin",
  "/suivi",
  "/panier",
  "/api",
  "/badges",
  "/sos",
  "/anniversaire",
  "/checkout",
  "/order"
];

// Lecture dynamique de la configuration métier pour openingHoursConfirmed
let openingHoursConfirmed = false;
try {
  const configPath = path.join(process.cwd(), "src/lib/businessConfig.ts");
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf8");
    const match = configContent.match(/openingHoursConfirmed:\s*(true|false)/i);
    if (match) {
      openingHoursConfirmed = match[1].toLowerCase() === "true";
    }
  }
} catch (e) {
  console.warn("Avertissement: Impossible de lire businessConfig.ts:", e.message);
}

const prisma = new PrismaClient();

const results = {
  totalChecked: 0,
  passedPages: 0,
  failedPages: 0,
  allErrors: [],
  warnings: [],
  dbChecksSuccessCount: 0,
};

function logGlobalError(msg) {
  results.allErrors.push(msg);
  console.error(`  ❌ [ERREUR GLOBALE] ${msg}`);
}

function logWarning(msg) {
  results.warnings.push(msg);
  console.warn(`  ⚠️  [ATTENTION] ${msg}`);
}

function logSuccess(msg) {
  console.log(`  ✅ ${msg}`);
}

// Fonction de tentative avec délai pour les requêtes réseau / BDD
async function retryOperation(opFn, maxRetries = 3, baseDelayMs = 1000) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await opFn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }
  throw lastError;
}

// Extraction sans dépendance externe
function extractCanonical(html) {
  const matches = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)];
  const urls = [];
  for (const m of matches) {
    const hrefMatch = m[0].match(/href=["']([^"']+)["']/i);
    if (hrefMatch) urls.push(hrefMatch[1]);
  }
  return urls;
}

function extractOgUrl(html) {
  const m = html.match(/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:url["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

function extractH1s(html) {
  const matches = [...html.matchAll(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi)];
  return matches.map(m => m[2].replace(/<[^>]*>/g, '').trim());
}

function extractTitle(html) {
  const m = html.match(/<title(\s[^>]*)?>([\s\S]*?)<\/title>/i);
  return m ? m[2].trim() : null;
}

function extractMetaDescription(html) {
  const m = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

function extractRobotsMeta(html) {
  const m = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

function extractJsonLdBlocks(html) {
  const matches = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const blocks = [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      blocks.push(parsed);
    } catch (e) {
      blocks.push({ __syntaxError: e.message, raw: m[1] });
    }
  }
  return blocks;
}

async function verifyRobotsTxt() {
  console.log(`\n1. 🔍 Vérification de ${baseUrl}/robots.txt...`);
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, { redirect: "manual" });
    if (res.status !== 200) {
      logGlobalError(`/robots.txt a retourné le code HTTP ${res.status}`);
      return;
    }
    const text = await res.text();
    if (!text.includes("Sitemap: https://www.spoolio.fr/sitemap.xml")) {
      logGlobalError(`/robots.txt ne déclare pas "Sitemap: https://www.spoolio.fr/sitemap.xml"`);
    } else {
      logSuccess(`/robots.txt est accessible et déclare le sitemap canonique.`);
    }

    if (!text.includes("Disallow: /admin")) {
      logWarning(`/robots.txt devrait bloquer /admin`);
    }
  } catch (err) {
    logGlobalError(`Impossible de contacter ${baseUrl}/robots.txt : ${err.message}. Le serveur local est-il démarré ?`);
  }
}

async function fetchAndParseSitemap() {
  console.log(`\n2. 🔍 Téléchargement, parsing et contrôle d'unicité de ${baseUrl}/sitemap.xml...`);
  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`, { redirect: "manual" });
    if (res.status !== 200) {
      logGlobalError(`/sitemap.xml a retourné le code HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)];
    const rawUrls = locMatches.map(m => m[1].trim());

    if (rawUrls.length === 0) {
      logGlobalError(`Aucune URL trouvée dans /sitemap.xml`);
      return [];
    }

    // Contrôle d'unicité stricte des URLs du sitemap
    const seenUrls = new Set();
    const duplicateUrls = [];
    for (const url of rawUrls) {
      if (seenUrls.has(url)) {
        duplicateUrls.push(url);
      }
      seenUrls.add(url);
    }

    if (duplicateUrls.length > 0) {
      logGlobalError(`URLs dupliquées détectées dans /sitemap.xml : ${duplicateUrls.join(", ")}`);
    } else {
      logSuccess(`Unicité validée : aucun doublon parmi les ${rawUrls.length} URLs du sitemap.`);
    }

    const uniqueUrls = Array.from(seenUrls);

    // Vérifier l'origine canonique et l'absence de routes privées
    for (const url of uniqueUrls) {
      if (!url.startsWith(CANONICAL_ORIGIN)) {
        logGlobalError(`L'URL "${url}" du sitemap n'utilise pas le domaine canonique ${CANONICAL_ORIGIN}`);
      }

      const pathPart = url.replace(CANONICAL_ORIGIN, "");
      for (const priv of PRIVATE_PATH_PREFIXES) {
        if (pathPart.startsWith(priv)) {
          logGlobalError(`Route privée interdite trouvée dans le sitemap : ${url}`);
        }
      }
    }

    return uniqueUrls;
  } catch (err) {
    logGlobalError(`Échec lors du téléchargement de /sitemap.xml : ${err.message}`);
    return [];
  }
}

async function preloadDatabaseProducts() {
  console.log(`\n3. ⏳ Préchargement groupé des produits et avis réels depuis la base de données...`);
  try {
    const products = await retryOperation(async () => {
      return prisma.product.findMany({
        where: { status: "publish" },
        select: {
          id: true,
          slug: true,
          price: true,
          reviews: {
            where: { approved: true },
            select: { rating: true }
          }
        }
      });
    }, 4, 1500);

    const map = new Map();
    for (const p of products) {
      map.set(p.slug, p);
    }
    logSuccess(`${products.length} fiches produits publiées avec leurs avis approuvés préchargées depuis la base.`);
    return map;
  } catch (err) {
    logGlobalError(`Échec bloquant de connexion à la base de données PostgreSQL : ${err.message}`);
    return null;
  }
}

async function crawlAndVerifyUrls(urls, dbProductsMap) {
  console.log(`\n4. 🚀 Crawl et inspection approfondie de chaque URL du sitemap...`);
  
  const titleToUrls = new Map();
  const descToUrls = new Map();
  const sitemapUrlsSet = new Set(urls);

  for (let i = 0; i < urls.length; i++) {
    const canonicalUrl = urls[i];
    const pathPart = canonicalUrl.replace(CANONICAL_ORIGIN, "") || "/";
    const targetUrl = `${baseUrl}${pathPart}`;

    results.totalChecked++;
    const pageErrors = [];

    const addPageError = (msg) => {
      pageErrors.push(msg);
      results.allErrors.push(`[${pathPart}] ${msg}`);
      console.error(`  ❌ [${pathPart}] ${msg}`);
    };

    try {
      // Visite sans redirection automatique
      const res = await fetch(targetUrl, { redirect: "manual" });

      if (res.status !== 200) {
        if ([301, 302, 307, 308].includes(res.status)) {
          const loc = res.headers.get("location");
          addPageError(`[HTTP ${res.status} Redirection] Redirige vers ${loc} (le sitemap ne doit contenir que des HTTP 200 directs)`);
        } else {
          addPageError(`[HTTP ${res.status}] A répondu en erreur`);
        }
        results.failedPages++;
        continue;
      }

      const html = await res.text();

      // 1. Balise Robots (pas de noindex)
      const robots = extractRobotsMeta(html);
      if (robots && robots.toLowerCase().includes("noindex")) {
        addPageError(`Est indexée dans le sitemap mais déclare <meta name="robots" content="${robots}">`);
      }

      // 2. Canonical auto-référente
      const canonicals = extractCanonical(html);
      const expectedCanonical = `${CANONICAL_ORIGIN}${pathPart === "/" ? "" : pathPart}`;
      if (canonicals.length === 0) {
        addPageError(`Aucune balise canonical trouvée`);
      } else if (canonicals.length > 1) {
        addPageError(`Plusieurs balises canonical trouvées : ${canonicals.join(", ")}`);
      } else {
        const found = canonicals[0].replace(/\/$/, "");
        const expected = expectedCanonical.replace(/\/$/, "");
        if (found !== expected) {
          addPageError(`Canonical incorrecte : trouvée "${canonicals[0]}", attendue "${expectedCanonical}"`);
        }
      }

      // 3. Open Graph URL (og:url doit correspondre exactement à la canonical)
      const ogUrl = extractOgUrl(html);
      if (!ogUrl) {
        addPageError(`Balise <meta property="og:url"> manquante`);
      } else {
        const foundOg = ogUrl.replace(/\/$/, "");
        const expectedOg = expectedCanonical.replace(/\/$/, "");
        if (foundOg !== expectedOg) {
          addPageError(`og:url incorrecte : trouvée "${ogUrl}", attendue "${expectedCanonical}"`);
        }
      }

      // 4. Unicité stricte du H1
      const h1s = extractH1s(html);
      if (h1s.length === 0) {
        addPageError(`Aucun H1 trouvé dans le HTML initial`);
      } else if (h1s.length > 1) {
        addPageError(`${h1s.length} balises H1 trouvées : "${h1s.join('" ET "')}"`);
      }

      // 5. Balise Title
      const title = extractTitle(html);
      if (!title) {
        addPageError(`Balise <title> manquante`);
      } else {
        if (!titleToUrls.has(title)) titleToUrls.set(title, []);
        titleToUrls.get(title).push(pathPart);
      }

      // 6. Meta Description
      const desc = extractMetaDescription(html);
      if (!desc) {
        addPageError(`Balise <meta name="description"> manquante`);
      } else {
        if (!descToUrls.has(desc)) descToUrls.set(desc, []);
        descToUrls.get(desc).push(pathPart);
      }

      // 7. Données structurées JSON-LD approfondies
      const jsonLdBlocks = extractJsonLdBlocks(html);
      for (const block of jsonLdBlocks) {
        if (block.__syntaxError) {
          addPageError(`Erreur de syntaxe JSON-LD : ${block.__syntaxError}`);
          continue;
        }

        const items = Array.isArray(block["@graph"]) ? block["@graph"] : [block];
        for (const item of items) {
          const type = Array.isArray(item["@type"]) ? item["@type"].join(",") : String(item["@type"] || "");

          // --- Contrôle approfondi des Schémas Product ---
          if (type.includes("Product")) {
            // A. Validation de l'existence réelle de Product.url
            if (item.url) {
              if (!item.url.startsWith(CANONICAL_ORIGIN)) {
                addPageError(`URL JSON-LD Product hors domaine canonique : "${item.url}"`);
              } else {
                const productUrlPath = item.url.replace(CANONICAL_ORIGIN, "") || "/";
                if (!sitemapUrlsSet.has(item.url)) {
                  try {
                    const checkRes = await fetch(`${baseUrl}${productUrlPath}`, { method: "HEAD", redirect: "manual" });
                    if (checkRes.status !== 200) {
                      addPageError(`L'URL de fiche produit JSON-LD "${item.url}" ne répond pas en HTTP 200 (statut: ${checkRes.status})`);
                    }
                  } catch (e) {
                    addPageError(`Impossible de joindre l'URL de produit "${item.url}" : ${e.message}`);
                  }
                }
              }
            }

            // B. Validation de l'existence réelle de Offer.url
            if (item.offers) {
              const offerUrl = item.offers.url;
              if (offerUrl) {
                if (!offerUrl.startsWith(CANONICAL_ORIGIN)) {
                  addPageError(`URL JSON-LD Offer hors domaine canonique : "${offerUrl}"`);
                } else {
                  const offerPath = offerUrl.replace(CANONICAL_ORIGIN, "") || "/";
                  if (!sitemapUrlsSet.has(offerUrl)) {
                    try {
                      const checkRes = await fetch(`${baseUrl}${offerPath}`, { method: "HEAD", redirect: "manual" });
                      if (checkRes.status !== 200) {
                        addPageError(`L'URL de l'offre JSON-LD "${offerUrl}" ne répond pas en HTTP 200 (statut: ${checkRes.status})`);
                      }
                    } catch (e) {
                      addPageError(`Impossible de joindre l'URL d'offre "${offerUrl}" : ${e.message}`);
                    }
                  }
                }
              }

              // Prix numérique valide
              const price = parseFloat(item.offers.price);
              if (isNaN(price) || price <= 0) {
                addPageError(`Prix invalide ou non numérique dans le JSON-LD Product : "${item.offers.price}"`);
              }
              if (item.offers.priceCurrency !== "EUR") {
                addPageError(`Devise incorrecte dans le JSON-LD Product : "${item.offers.priceCurrency}"`);
              }
            }

            // C. Comparaison stricte avec la base de données PostgreSQL
            // Déterminer le slug cible : soit depuis l'URL de page produit, soit depuis l'URL de l'offre (ex: landing médaillon)
            let targetProductSlug = null;
            if (pathPart.startsWith("/product/")) {
              targetProductSlug = pathPart.replace("/product/", "");
            } else if (item.offers && item.offers.url && item.offers.url.includes("/product/")) {
              targetProductSlug = item.offers.url.replace(`${CANONICAL_ORIGIN}/product/`, "");
            }

            if (targetProductSlug) {
              let dbProduct = dbProductsMap ? dbProductsMap.get(targetProductSlug) : null;

              if (!dbProduct) {
                // Tentative à la demande avec réessais en cas d'absence du cache initial
                try {
                  dbProduct = await retryOperation(async () => {
                    return prisma.product.findUnique({
                      where: { slug: targetProductSlug },
                      select: {
                        id: true,
                        slug: true,
                        price: true,
                        reviews: { where: { approved: true }, select: { rating: true } }
                      }
                    });
                  }, 3, 1000);
                  if (dbProduct && dbProductsMap) {
                    dbProductsMap.set(targetProductSlug, dbProduct);
                  }
                } catch (dbErr) {
                  addPageError(`Échec bloquant de requête BDD pour "${targetProductSlug}" : ${dbErr.message}`);
                }
              }

              if (!dbProduct) {
                addPageError(`Produit "${targetProductSlug}" introuvable dans la base de données PostgreSQL !`);
              } else {
                results.dbChecksSuccessCount++;

                // Comparaison stricte du prix
                if (item.offers && dbProduct.price != null) {
                  const dbPrice = parseFloat(dbProduct.price);
                  const ldPrice = parseFloat(item.offers.price);
                  if (isNaN(dbPrice) || isNaN(ldPrice) || Math.abs(dbPrice - ldPrice) > 0.01) {
                    addPageError(`Incohérence de prix pour "${targetProductSlug}" : JSON-LD indique ${ldPrice}€ mais la base indique ${dbPrice}€`);
                  }
                }

                // Comparaison stricte de l'AggregateRating
                if (item.aggregateRating) {
                  const approvedReviews = dbProduct.reviews || [];
                  if (approvedReviews.length === 0) {
                    addPageError(`Note artificielle sur "${targetProductSlug}" : AggregateRating présent (${item.aggregateRating.ratingValue}/5 sur ${item.aggregateRating.reviewCount} avis) alors que le produit a 0 avis approuvé en base de données`);
                  } else {
                    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
                    const expectedRating = Number((sum / approvedReviews.length).toFixed(1));
                    const expectedCount = approvedReviews.length;
                    const ldRating = parseFloat(item.aggregateRating.ratingValue);
                    const ldCount = parseInt(item.aggregateRating.reviewCount, 10);

                    if (ldRating !== expectedRating || ldCount !== expectedCount) {
                      addPageError(`Incohérence d'avis pour "${targetProductSlug}" : AggregateRating (${ldRating}/5 sur ${ldCount} avis) ne correspond pas aux avis réels approuvés en base (${expectedRating}/5 sur ${expectedCount} avis)`);
                    }
                  }
                }
              }
            } else {
              // Si la page n'est pas liée à un produit réel en BDD mais contient un AggregateRating
              if (item.aggregateRating) {
                addPageError(`AggregateRating non relié à des avis BDD vérifiés présent sur la page ${pathPart}`);
              }
            }
          }

          // --- Contrôle des Horaires selon openingHoursConfirmed ---
          if (type.includes("LocalBusiness") || type.includes("Organization")) {
            if (!openingHoursConfirmed && item.openingHoursSpecification) {
              addPageError(`Horaires non confirmés (openingHoursSpecification) émis dans JSON-LD alors que openingHoursConfirmed === false`);
            } else if (openingHoursConfirmed && !item.openingHoursSpecification) {
              logWarning(`Les horaires sont confirmés mais aucun openingHoursSpecification n'a été trouvé sur ${pathPart}`);
            }
          }
        }
      }

      // Décompte strict : une page n'est comptée comme passée que si 0 erreur
      if (pageErrors.length === 0) {
        results.passedPages++;
      } else {
        results.failedPages++;
      }
    } catch (err) {
      addPageError(`Erreur de requête HTTP (${targetUrl}) : ${err.message}`);
      results.failedPages++;
    }
  }

  // Contrôle des doublons de Title entre URLs distinctes
  console.log(`\n5. 🔍 Analyse des doublons de métadonnées (Titles et Descriptions)...`);
  for (const [title, pages] of titleToUrls.entries()) {
    if (pages.length > 1) {
      logGlobalError(`Title dupliqué sur ${pages.length} pages ("${title}") : ${pages.join(", ")}`);
    }
  }

  // Contrôle des doublons de Meta Description entre URLs distinctes
  for (const [desc, pages] of descToUrls.entries()) {
    if (pages.length > 1) {
      logGlobalError(`Meta description dupliquée sur ${pages.length} pages ("${desc.slice(0, 60)}...") : ${pages.join(", ")}`);
    }
  }

  if (results.allErrors.length === 0) {
    logSuccess(`Aucun doublon de title ou de description détecté sur les pages actives.`);
  }
}

async function main() {
  console.log("==================================================================");
  console.log("🔍 [AUDIT SEO TECHNIQUE SPOOLIO.FR] Contrôle de Rendu et de Crawl");
  console.log(`🌐 Base URL ciblée : ${baseUrl}`);
  console.log(`🎯 Domaine canonique obligatoire : ${CANONICAL_ORIGIN}`);
  console.log(`🕒 Statut confirmation horaires : ${openingHoursConfirmed ? "CONFIRMÉS" : "NON CONFIRMÉS (omission requise)"}`);
  console.log("==================================================================");

  try {
    await verifyRobotsTxt();
    const urls = await fetchAndParseSitemap();
    const dbProductsMap = await preloadDatabaseProducts();

    if (!dbProductsMap) {
      console.error("\n❌ ARRÊT BLOQUANT : Impossible de contacter la base PostgreSQL pour les contrôles de prix et d'avis.");
      process.exit(1);
    }

    if (urls.length > 0) {
      await crawlAndVerifyUrls(urls, dbProductsMap);
    }

    console.log("\n==================================================================");
    console.log("📊 BILAN DU CONTRÔLE SEO TECHNIQUE :");
    console.log(`  - Total URLs testées : ${results.totalChecked}`);
    console.log(`  - Pages conformes : ${results.passedPages}`);
    console.log(`  - Pages en échec : ${results.failedPages}`);
    console.log(`  - Contrôles BDD validés avec succès : ${results.dbChecksSuccessCount}`);
    console.log(`  - Avertissements : ${results.warnings.length}`);
    console.log(`  - Total Erreurs bloquantes : ${results.allErrors.length}`);
    console.log("==================================================================");

    if (results.allErrors.length > 0 || results.failedPages > 0) {
      console.error(`\n❌ ÉCHEC DE LA VALIDATION : ${results.allErrors.length} erreur(s) détectée(s) sur ${results.failedPages} page(s).`);
      process.exit(1);
    } else {
      console.log(`\n🎉 SUCCÈS COMPLET : 100% conforme. Toutes les URLs, prix et avis ont été réellement vérifiés.`);
      process.exit(0);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
