/**
 * Inline Base64 Placeholders
 * 
 * Ultra-tiny embedded images (~50-100 bytes each)
 * Zero network requests = Zero bandwidth = Zero quota usage!
 * 
 * Use these instead of external placeholders to save:
 * - Cloudinary transformations
 * - HTTP requests  
 * - Bandwidth
 */

/**
 * 10x10 gray product placeholder (~90 bytes)
 * Use for missing product images
 */
export const PRODUCT_PLACEHOLDER_BASE64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mN8/5+hnoEIwDiqkL4KAcT9GO0U4BxoAAAAAElFTkSuQmCC';

/**
 * 10x10 transparent placeholder (~60 bytes)
 * Use for missing frame overlays
 */
export const FRAME_PLACEHOLDER_BASE64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADUlEQVR42mNgYGD4DwABBAEAW9JBBAAAAABJRU5ErkJggg==';

/**
 * 16x9 gray banner placeholder (~95 bytes)
 * Use for missing banners/hero images
 */
export const BANNER_PLACEHOLDER_BASE64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAF0lEQVR42mN8/5+hnoEIwDiqYNQAyhuAAU1pG+18rxoAAAAASUVORK5CYII=';

/**
 * 1x1 transparent pixel (smallest possible - ~50 bytes)
 * Use as universal fallback
 */
export const TRANSPARENT_PIXEL =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
