/**
 * Static Data Generator - ISR Implementation
 * يبني البيانات الثابتة ويخزنها ويجددها تلقائياً
 */

import { api } from '../services/api';
import fs from 'fs';
import path from 'path';

interface StaticData {
  homeSections: any[];
  categories: any[];
  branches: any[];
  featuredProducts: any[];
  timestamp: number;
  expiresAt: number;
}

const STATIC_DATA_DIR = path.join(process.cwd(), 'public', 'static-data');
const STATIC_DATA_FILE = path.join(STATIC_DATA_DIR, 'site-data.json');
const REVALIDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Build static data from database
 */
export async function buildStaticData(): Promise<StaticData> {
  console.log('[ISR] Building static data...');
  
  try {
    // Fetch all data in parallel
    const [homeSections, categories, branches, featuredProducts] = await Promise.all([
      api.homeSections.getAll(), // Fetch all home sections
      api.categories.getAll(),   // Fetch all categories
      api.branches.getAll(),     // Fetch all branches
      api.products.getFeatured(), // Fetch featured products
    ]);

    const staticData: StaticData = {
      homeSections: homeSections || [],
      categories: categories || [],
      branches: branches || [],
      featuredProducts: featuredProducts || [],
      timestamp: Date.now(),
      expiresAt: Date.now() + REVALIDATE_INTERVAL,
    };

    // Save to file
    if (!fs.existsSync(STATIC_DATA_DIR)) {
      fs.mkdirSync(STATIC_DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(STATIC_DATA_FILE, JSON.stringify(staticData, null, 2));
    
    console.log('[ISR] ✅ Static data built successfully!');
    console.log(`[ISR] - Home Sections: ${homeSections?.length || 0}`);
    console.log(`[ISR] - Categories: ${categories?.length || 0}`);
    console.log(`[ISR] - Branches: ${branches?.length || 0}`);
    console.log(`[ISR] - Featured Products: ${featuredProducts?.length || 0}`);
    console.log(`[ISR] - Next rebuild: ${new Date(staticData.expiresAt).toLocaleString()}`);
    
    return staticData;
  } catch (error) {
    console.error('[ISR] ❌ Failed to build static data:', error);
    throw error;
  }
}

/**
 * Load static data from file
 */
export async function loadStaticData(): Promise<StaticData | null> {
  try {
    if (!fs.existsSync(STATIC_DATA_FILE)) {
      console.log('[ISR] No static data file found. Building...');
      return await buildStaticData();
    }

    const data = JSON.parse(fs.readFileSync(STATIC_DATA_FILE, 'utf-8'));
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      console.log('[ISR] Static data expired. Rebuilding...');
      return await buildStaticData();
    }

    console.log('[ISR] ✅ Loaded static data from cache');
    return data;
  } catch (error) {
    console.error('[ISR] Failed to load static data:', error);
    return null;
  }
}

/**
 * Get static data (with auto-rebuild if expired)
 */
export async function getStaticData(): Promise<StaticData> {
  const data = await loadStaticData();
  
  if (!data) {
    return await buildStaticData();
  }
  
  return data;
}

/**
 * Force rebuild static data
 */
export async function forceRebuild(): Promise<void> {
  console.log('[ISR] Force rebuilding static data...');
  await buildStaticData();
}

/**
 * Schedule automatic rebuilds
 */
export function scheduleAutoRebuild() {
  console.log('[ISR] Scheduling auto-rebuild every 7 days');
  
  setInterval(async () => {
    console.log('[ISR] Auto-rebuild triggered');
    await buildStaticData();
  }, REVALIDATE_INTERVAL);
}
