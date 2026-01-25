import { useMemo } from 'react';
import { optimizeImage, IMAGE_SIZES } from '../utils/imageOptimization';

/**
 * Hook لـ memoize الصور المحسنة
 * يمنع re-requests على كل render
 * 
 * @example
 * const optimizedImage = useOptimizedImage(product.image, 'CARD_THUMBNAIL');
 */
export function useOptimizedImage(
    url: string | undefined | null,
    size: keyof typeof IMAGE_SIZES
): string | null {
    return useMemo(() => {
        if (!url) return null;
        return optimizeImage(url, IMAGE_SIZES[size]);
    }, [url, size]); // Only re-compute if URL or size changes
}

/**
 * Hook لـ multiple images
 * 
 * @example
 * const [mainImg, frameImg] = useOptimizedImages(
 *   [product.image, product.frame],
 *   'CARD_THUMBNAIL'
 * );
 */
export function useOptimizedImages(
    urls: (string | undefined | null)[],
    size: keyof typeof IMAGE_SIZES
): (string | null)[] {
    // Create stable key from URLs
    const urlsKey = useMemo(() =>
        urls.map(u => u || '').join('|'),
        [urls]
    );

    return useMemo(() => {
        return urls.map(url =>
            url ? optimizeImage(url, IMAGE_SIZES[size]) : null
        );
    }, [urlsKey, size]);
}
