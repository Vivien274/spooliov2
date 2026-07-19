const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Config paths
const envPath = '/Users/20015984/Documents/SpoolioV2/.env.local';
const dataDir = '/Users/20015984/Documents/SpoolioV2/src/data';
const imagesDir = '/Users/20015984/Documents/SpoolioV2/public/images/imported';

// Make sure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Load configurations
let wcUrl = 'https://spoolio.fr';
let consumerKey = '';
let consumerSecret = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_WC_URL') wcUrl = val;
      if (key === 'WC_CONSUMER_KEY') consumerKey = val;
      if (key === 'WC_CONSUMER_SECRET') consumerSecret = val;
    }
  });
}

const cleanUrl = wcUrl.replace(/\/$/, '');

// Utility helper to request JSON
function fetchJson(url, useAuth = true) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'NodeJS/SpoolioImporter'
    };
    if (useAuth) {
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    const options = { headers };
    const client = url.startsWith('https') ? https : http;
    client.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP Error ${res.statusCode} on fetch: ${url}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Utility helper to download a file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'NodeJS/SpoolioImporter' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image (HTTP ${res.statusCode}): ${url}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Sanitize filename for images
function getFilenameFromUrl(url) {
  const parts = url.split('/');
  const rawFilename = parts[parts.length - 1].split('?')[0];
  // clean up filename keeping extension
  return rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Keep track of downloaded images to avoid duplicates
const downloadedImages = new Set();

async function importImage(url) {
  if (!url) return null;
  const filename = getFilenameFromUrl(url);
  const localPath = path.join(imagesDir, filename);
  const relativeUrl = `/images/imported/${filename}`;

  if (downloadedImages.has(filename) || fs.existsSync(localPath)) {
    return relativeUrl;
  }

  console.log(`Downloading image: ${filename} ...`);
  try {
    await downloadFile(url, localPath);
    downloadedImages.add(filename);
    return relativeUrl;
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return url; // fallback to original remote url if download fails
  }
}

// Helper to extract image URLs from HTML content (for description/posts)
async function sanitizeHtmlImages(html) {
  if (!html) return html;
  
  // Regex to match src="http..." inside img tags
  const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  let updatedHtml = html;
  const matches = [];

  while ((match = imgRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  for (const remoteUrl of matches) {
    const localUrl = await importImage(remoteUrl);
    if (localUrl && localUrl !== remoteUrl) {
      updatedHtml = updatedHtml.replaceAll(remoteUrl, localUrl);
    }
  }

  return updatedHtml;
}

async function importProducts() {
  console.log('--- Importing WooCommerce Products ---');
  let products = [];
  let page = 1;
  const perPage = 50;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page} of products...`);
    try {
      const fetched = await fetchJson(`${cleanUrl}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`);
      if (fetched.length === 0) {
        hasMore = false;
      } else {
        products = products.concat(fetched);
        page++;
        if (fetched.length < perPage) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      hasMore = false;
    }
  }

  console.log(`Fetched ${products.length} products total.`);

  // Process products, download their images, and rewrite paths
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[Product ${i+1}/${products.length}] Processing: ${p.name}`);

    // Standard images array
    if (p.images && p.images.length > 0) {
      for (const img of p.images) {
        const localUrl = await importImage(img.src);
        if (localUrl) img.src = localUrl;
      }
    }

    // HTML Content description and short description images
    p.description = await sanitizeHtmlImages(p.description);
    p.short_description = await sanitizeHtmlImages(p.short_description);
  }

  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2), 'utf8');
  console.log('Saved products.json successfully.');
}

async function importCategories() {
  console.log('--- Importing WooCommerce Product Categories ---');
  let categories = [];
  let page = 1;
  const perPage = 50;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page} of categories...`);
    try {
      const fetched = await fetchJson(`${cleanUrl}/wp-json/wc/v3/products/categories?page=${page}&per_page=${perPage}`);
      if (fetched.length === 0) {
        hasMore = false;
      } else {
        categories = categories.concat(fetched);
        page++;
        if (fetched.length < perPage) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      hasMore = false;
    }
  }

  console.log(`Fetched ${categories.length} categories total.`);

  // Download icons/images for categories if present
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (cat.image && cat.image.src) {
      const localUrl = await importImage(cat.image.src);
      if (localUrl) cat.image.src = localUrl;
    }
  }

  fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2), 'utf8');
  console.log('Saved categories.json successfully.');
}

async function importBlogPosts() {
  console.log('--- Importing WordPress Blog Posts ---');
  let posts = [];
  let page = 1;
  const perPage = 50;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page} of posts...`);
    try {
      // Accessing public WP JSON endpoint without authentication headers
      const fetched = await fetchJson(`${cleanUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_embed`, false);
      if (fetched.length === 0) {
        hasMore = false;
      } else {
        posts = posts.concat(fetched);
        page++;
        if (fetched.length < perPage) {
          hasMore = false;
        }
      }
    } catch (error) {
      // The site might not have blog posts or endpoint could differ, gracefully catch
      console.error('Error fetching blog posts (might not exist):', error.message);
      hasMore = false;
    }
  }

  console.log(`Fetched ${posts.length} blog posts total.`);

  // Clean, parse images and rewrite paths
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[Post ${i+1}/${posts.length}] Processing: ${post.title?.rendered}`);

    // Extract featured image from wp:featuredmedia embed if present
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      const sourceUrl = media.source_url;
      const localUrl = await importImage(sourceUrl);
      if (localUrl) {
        post.featured_image_url = localUrl;
      }
    }

    if (post.content && post.content.rendered) {
      post.content.rendered = await sanitizeHtmlImages(post.content.rendered);
    }
    if (post.excerpt && post.excerpt.rendered) {
      post.excerpt.rendered = await sanitizeHtmlImages(post.excerpt.rendered);
    }
  }

  fs.writeFileSync(path.join(dataDir, 'blog.json'), JSON.stringify(posts, null, 2), 'utf8');
  console.log('Saved blog.json successfully.');
}

async function importPages() {
  console.log('--- Importing WordPress Pages ---');
  let pages = [];
  let page = 1;
  const perPage = 50;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page} of pages...`);
    try {
      const fetched = await fetchJson(`${cleanUrl}/wp-json/wp/v2/pages?page=${page}&per_page=${perPage}&_embed`, false);
      if (fetched.length === 0) {
        hasMore = false;
      } else {
        pages = pages.concat(fetched);
        page++;
        if (fetched.length < perPage) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error.message);
      hasMore = false;
    }
  }

  console.log(`Fetched ${pages.length} pages total.`);

  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    console.log(`[Page ${i+1}/${pages.length}] Processing: ${pg.title?.rendered}`);

    if (pg._embedded && pg._embedded['wp:featuredmedia'] && pg._embedded['wp:featuredmedia'][0]) {
      const media = pg._embedded['wp:featuredmedia'][0];
      const sourceUrl = media.source_url;
      const localUrl = await importImage(sourceUrl);
      if (localUrl) {
        pg.featured_image_url = localUrl;
      }
    }

    if (pg.content && pg.content.rendered) {
      pg.content.rendered = await sanitizeHtmlImages(pg.content.rendered);
    }
  }

  fs.writeFileSync(path.join(dataDir, 'pages.json'), JSON.stringify(pages, null, 2), 'utf8');
  console.log('Saved pages.json successfully.');
}

async function main() {
  try {
    await importProducts();
    await importCategories();
    await importBlogPosts();
    await importPages();
    console.log('\n=========================================');
    console.log('🎉 ALL DATA & IMAGES IMPORTED SUCCESSFULLY !');
    console.log('=========================================');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

main();
