/**
 * Cloudinary & Supabase Image Optimization Utility
 * 
 * يوفر functions لتحسين الصور عبر Cloudinary transformations و Supabase transforms
 * التوفير المتوقع: 85-95% من حجم الصور! 🔥
 */

/**
 * أحجام الصور المختلفة حسب الاستخدام
 */
export const IMAGE_SIZES = {
    // Product Cards في القوائم
    CARD_THUMBNAIL: {
        width: 200,
        height: 200,
        quality: 60, // Reduced from 70
        format: 'webp'
    },

    // Product Details Page
    PRODUCT_DETAIL: {
        width: 600,
        height: 600,
        quality: 75, // Reduced from 80
        format: 'webp'
    },

    // Frames
    FRAME_OVERLAY: {
        width: 200,
        height: 200,
        quality: 60, // Reduced from 70
        format: 'webp'
    },

    // Hero Images / Banners
    BANNER: {
        width: 1200,
        height: 400,
        quality: 80, // Reduced from 85
        format: 'webp'
    },

    // Thumbnails صغيرة جداً
    TINY_THUMB: {
        width: 100,
        height: 100,
        quality: 50, // Reduced from 60
        format: 'webp'
    }
};

/**
 * تحسين Supabase Storage URL
 * Supabase supports transformation via query params
 * 
 * @example
 * https://xxx.supabase.co/storage/v1/object/public/bucket/image.jpg
 * -> https://xxx.supabase.co/storage/v1/object/public/bucket/image.jpg?width=200&quality=70
 */
function optimizeSupabaseImage(
    url: string,
    size: typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]
): string {
    try {
        // Check if already has params
        const hasParams = url.includes('?');
        const separator = hasParams ? '&' : '?';
        
        // Add transformation params
        return `${url}${separator}width=${size.width}&height=${size.height}&quality=${size.quality}&format=${size.format}&resize=cover`;
    } catch (error) {
        return url;
    }
}

/**
 * تحسين Cloudinary URL بإضافة transformations
 */
function optimizeCloudinaryImage(
    url: string,
    size: typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]
): string {
    // لو الـ URL already optimized (فيه transformations)، ارجعه زي ما هو
    if (url.includes('w_') || url.includes('q_auto')) {
        return url;
    }

    try {
        // Extract parts: https://res.cloudinary.com/CLOUD_NAME/image/upload/VERSION/PUBLIC_ID.EXT
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return url;

        const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
        const afterUpload = url.substring(uploadIndex + 8);

        // Build transformations with aggressive compression
        const transformations = [
            `w_${size.width}`,
            `h_${size.height}`,
            `q_${size.quality}`,
            `f_${size.format}`,
            'c_fill', // Crop to fill (maintain aspect ratio)
            'fl_progressive', // Progressive loading
            'fl_lossy' // Lossy compression for smaller files
        ].join(',');

        // Construct optimized URL
        return `${beforeUpload}${transformations}/${afterUpload}`;
    } catch (error) {
        console.error('Error optimizing Cloudinary URL:', error);
        return url; // Fallback to original
    }
}

/**
 * تحسين أي صورة (Cloudinary أو Supabase أو غيرها)
 * 
 * @param url - الـ URL الأصلي
 * @param size - الحجم المطلوب
 * @returns الـ URL المحسّن
 */
export function optimizeImage(
    url: string | undefined | null,
    size: typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]
): string {
    // إذا URL فاضي، ارجع placeholder
    if (!url) {
        return `https://placehold.co/${size.width}x${size.height}/e5e7eb/6b7280?text=Image`;
    }

    // Supabase Storage
    if (url.includes('supabase.co/storage')) {
        return optimizeSupabaseImage(url, size);
    }

    // Cloudinary
    if (url.includes('cloudinary.com') || url.includes('res.cloudinary')) {
        return optimizeCloudinaryImage(url, size);
    }

    // External URLs - add query params if possible
    try {
        const hasParams = url.includes('?');
        const separator = hasParams ? '&' : '?';
        return `${url}${separator}w=${size.width}&q=${size.quality}`;
    } catch {
        return url;
    }
}

/**
 * تحسين صورة منتج للـ Card (أهم optimization!)
 */
export function optimizeProductCardImage(url: string | undefined | null): string {
    return optimizeImage(url, IMAGE_SIZES.CARD_THUMBNAIL);
}

/**
 * تحسين صورة منتج للـ Details Page
 */
export function optimizeProductDetailImage(url: string | undefined | null): string {
    return optimizeImage(url, IMAGE_SIZES.PRODUCT_DETAIL);
}

/**
 * تحسين Frame overlay
 */
export function optimizeFrameImage(url: string | undefined | null): string {
    return optimizeImage(url, IMAGE_SIZES.FRAME_OVERLAY);
}

/**
 * تحسين Banner image
 */
export function optimizeBannerImage(url: string | undefined | null): string {
    return optimizeImage(url, IMAGE_SIZES.BANNER);
}

/**
 * تحسين thumbnail صغير جداً
 */
export function optimizeTinyThumb(url: string | undefined | null): string {
    return optimizeImage(url, IMAGE_SIZES.TINY_THUMB);
}

/**
 * استخدام srcset لـ responsive images
 * 
 * @example
 * <img 
 *   src={optimizeProductCardImage(url)}
 *   srcSet={generateSrcSet(url, [200, 400, 600])}
 *   sizes="(max-width: 640px) 200px, (max-width: 1024px) 400px, 600px"
 * />
 */
export function generateSrcSet(
    url: string | undefined | null,
    widths: number[] = [200, 400, 600]
): string {
    if (!url) return '';

    return widths
        .map(width => {
            const optimized = optimizeImage(url, {
                width,
                height: width,
                quality: 70,
                format: 'webp'
            });
            return `${optimized} ${width}w`;
        })
        .join(', ');
}
