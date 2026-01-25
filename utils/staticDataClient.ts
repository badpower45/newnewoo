/**
 * Static Data Client - Browser Version
 * يحمل البيانات الثابتة من الـ server
 */

interface StaticSiteData {
  homeSections: any[];
  categories: any[];
  branches: any[];
  featuredProducts: any[];
  timestamp: number;
  expiresAt: number;
}

class StaticDataClient {
  private cache: StaticSiteData | null = null;
  private loading: Promise<StaticSiteData> | null = null;
  
  /**
   * Load static data from server
   */
  async load(): Promise<StaticSiteData> {
    // Return cached data if available and not expired
    if (this.cache && Date.now() < this.cache.expiresAt) {
      console.log('[Static] Using cached data');
      return this.cache;
    }

    // Avoid multiple simultaneous loads
    if (this.loading) {
      console.log('[Static] Load already in progress, waiting...');
      return this.loading;
    }

    console.log('[Static] Loading static data from server...');
    
    this.loading = this.fetchStaticData();
    
    try {
      this.cache = await this.loading;
      return this.cache;
    } finally {
      this.loading = null;
    }
  }

  /**
   * Fetch static data from server
   */
  private async fetchStaticData(): Promise<StaticSiteData> {
    try {
      // Try to load from static JSON file (generated at build time)
      const response = await fetch('/static-data/site-data.json', {
        cache: 'no-cache', // Always check for updates
      });

      if (!response.ok) {
        throw new Error('Failed to load static data');
      }

      const data = await response.json();
      
      console.log('[Static] ✅ Loaded static data');
      console.log(`[Static] - Home Sections: ${data.homeSections?.length || 0}`);
      console.log(`[Static] - Categories: ${data.categories?.length || 0}`);
      console.log(`[Static] - Branches: ${data.branches?.length || 0}`);
      console.log(`[Static] - Products: ${data.featuredProducts?.length || 0}`);
      console.log(`[Static] - Last updated: ${new Date(data.timestamp).toLocaleString()}`);
      
      return data;
    } catch (error) {
      console.error('[Static] ❌ Failed to load static data:', error);
      
      // Fallback: return empty data
      return {
        homeSections: [],
        categories: [],
        branches: [],
        featuredProducts: [],
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000, // Retry after 1 minute
      };
    }
  }

  /**
   * Get home sections
   */
  async getHomeSections() {
    const data = await this.load();
    return data.homeSections;
  }

  /**
   * Get categories
   */
  async getCategories() {
    const data = await this.load();
    return data.categories;
  }

  /**
   * Get branches
   */
  async getBranches() {
    const data = await this.load();
    return data.branches;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    const data = await this.load();
    return data.featuredProducts;
  }

  /**
   * Force refresh data
   */
  async refresh() {
    this.cache = null;
    return this.load();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = null;
    console.log('[Static] Cache cleared');
  }
}

// Singleton instance
export const staticData = new StaticDataClient();

/**
 * Usage Example:
 * 
 * // في HomePage.tsx
 * const sections = await staticData.getHomeSections();
 * const categories = await staticData.getCategories();
 * 
 * // Force refresh (مثلاً بعد تحديث)
 * await staticData.refresh();
 */
