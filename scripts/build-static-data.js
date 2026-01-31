#!/usr/bin/env node
/**
 * Build Script - Generate Static Data
 * يبني البيانات الثابتة قبل الـ deployment
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple fetch replacement using native Node.js with timeout
async function fetchData(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    // Timeout handler
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    
    const request = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      clearTimeout(timeout);
      reject(new Error('Request timeout'));
    });
  });
}

const API_URL = process.env.VITE_API_URL || 'https://bodeelezaby-backend-test.hf.space/api';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'static-data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'site-data.json');

async function fetchEndpoint(endpoint) {
  try {
    const response = await fetchData(`${API_URL}${endpoint}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

async function buildStaticData() {
  console.log('🚀 Building static data...\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`⏱️  Timeout: 10 seconds per request\n`);

  const startTime = Date.now();

  try {
    // Fetch all data in parallel
    console.log('📡 Fetching data from API...');
    
    const [
      homeSectionsRes,
      categoriesRes,
      branchesRes,
      productsRes
    ] = await Promise.all([
      fetchEndpoint('/home-sections?all=true'),
      fetchEndpoint('/categories'),
      fetchEndpoint('/branches'),
      fetchEndpoint('/products?page=1&limit=50'),
    ]);

    const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Data fetched in ${fetchTime}s\n`);

    // Extract data
    const homeSections = Array.isArray(homeSectionsRes) 
      ? homeSectionsRes 
      : homeSectionsRes?.data || [];
    
    const categories = Array.isArray(categoriesRes)
      ? categoriesRes
      : categoriesRes?.data || [];
    
    const branches = Array.isArray(branchesRes)
      ? branchesRes
      : branchesRes?.data || [];
    
    const featuredProducts = Array.isArray(productsRes)
      ? productsRes
      : productsRes?.data || productsRes?.products || [];

    // Build static data object
    const staticData = {
      homeSections,
      categories,
      branches,
      featuredProducts: featuredProducts.slice(0, 20), // First 20 products
      timestamp: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      buildDate: new Date().toISOString(),
    };

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(staticData, null, 2));

    console.log('\n✅ Static data built successfully!\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Home Sections: ${homeSections.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Branches: ${branches.length}`);
    console.log(`   - Featured Products: ${staticData.featuredProducts.length}`);
    console.log(`\n📁 Output: ${OUTPUT_FILE}`);
    console.log(`📅 Build Date: ${staticData.buildDate}`);
    console.log(`⏰ Expires: ${new Date(staticData.expiresAt).toLocaleString()}`);
    console.log(`⚡ Total build time: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error('\n💡 Tips:');
    console.error('   - Check if API is running: ' + API_URL);
    console.error('   - Try building without static data: npm run build');
    console.error('   - Increase timeout in build-static-data.js\n');
    process.exit(1);
  }
}

// Run build
buildStaticData();
