/**
 * Static Data Generator - ISR Implementation (Server-Side Only!)
 * 
 * ⚠️ WARNING: This file is for Node.js environments ONLY (build scripts)
 * DO NOT import this file in browser code!
 * 
 * Use staticDataClient.ts instead for browser environments
 */

// This file should only be imported by Node.js scripts like build-static-data.js
if (typeof window !== 'undefined') {
  throw new Error('staticDataGenerator.ts should not be imported in browser code!');
}

export {};

/*
 * Original implementation moved to scripts/build-static-data.js
 * This file is kept as placeholder to prevent accidental browser imports
 */
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
