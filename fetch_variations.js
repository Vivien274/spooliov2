const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const envPath = './.env.local';
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

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'NodeJS/SpoolioImporter'
    };
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
    
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

async function main() {
  const productId = 7933; // let's try to query variations for this product
  console.log(`Fetching variations from WooCommerce for product ID: ${productId}...`);
  try {
    const url = `${cleanUrl}/wp-json/wc/v3/products/${productId}/variations`;
    const variations = await fetchJson(url);
    console.log(`Successfully fetched ${variations.length} variations!`);
    if (variations.length > 0) {
      console.log("First variation details:");
      console.log(JSON.stringify(variations[0], null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch(err => console.error(err));
