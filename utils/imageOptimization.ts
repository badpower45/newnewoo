/**
 * Cloudinary Image Optimization Utility
 * 
 * يوفر functions لتحسين الصور عبر Cloudinary transformations
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
        quality: 'auto:eco', // Cloudinary auto quality (eco = lower quality, smaller size)
        format: 'auto'       // Cloudinary auto format (WebP if supported, JPEG fallback)
    },

    // Product Details Page
    PRODUCT_DETAIL: {
        width: 600,
        height: 600,
        quality: 'auto:good',
        format: 'auto'
    },

    // Frames
    FRAME_OVERLAY: {
        width: 200,
        height: 200,
        quality: 'auto:eco',
        format: 'auto'
    },

    // Hero Images / Banners
    BANNER: {
        width: 1200,
        height: 400,
        quality: 'auto:good',
        format: 'auto'
    },

    // Thumbnails صغيرة جداً
    TINY_THUMB: {
        width: 100,
        height: 100,
        quality: 'auto:low',
        format: 'auto'
    }
};

/**
 * تحسين Cloudinary URL بإضافة transformations
 * 
 * @param url - الـ URL الأصلي
 * @param size - الحجم المطلوب (من IMAGE_SIZES)
 * @returns الـ URL المحسّن
 * 
 * @example
 * const optimized = optimizeCloudinaryImage(
 *   'https://res.cloudinary.com/xyz/image/upload/product.jpg',
 *   IMAGE_SIZES.CARD_THUMBNAIL
 * );
 * // Returns: https://res.cloudinary.com/xyz/image/upload/w_200,h_200,q_auto:eco,f_auto/product.jpg
 */
export function optimizeCloudinaryImage(
    url: string | undefined | null,
    size: typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]
): string {
    // إذا URL فاضي، ارجع placeholder
    if (!url) {
        return `https://placehold.co/${size.width}x${size.height}?text=Product`;
    }

    // تحقق إذا الـ URL من Cloudinary
    if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary')) {
        // لو مش Cloudinary URL، ارجعه زي ما هو
        return url;
    }

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

        // Build transformations
        const transformations = [
            `w_${size.width}`,
            `h_${size.height}`,
            `q_${size.quality}`,
            `f_${size.format}`,
            'c_fill' // Crop to fill (maintain aspect ratio)
        ].join(',');

        // Construct optimized URL
        return `${beforeUpload}${transformations}/${afterUpload}`;
    } catch (error) {
        console.error('Error optimizing Cloudinary URL:', error);
        return url; // Fallback to original
    }
}

/**
 * تحسين صورة منتج للـ Card
 */
export function optimizeProductCardImage(url: string | undefined | null): string {
    return optimizeCloudinaryImage(url, IMAGE_SIZES.CARD_THUMBNAIL);
}

/**
 * تحسين صورة منتج للـ Details Page
 */
export function optimizeProductDetailImage(url: string | undefined | null): string {
    return optimizeCloudinaryImage(url, IMAGE_SIZES.PRODUCT_DETAIL);
}

/**
 * تحسين Frame overlay
 */
export function optimizeFrameImage(url: string | undefined | null): string {
    return optimizeCloudinaryImage(url, IMAGE_SIZES.FRAME_OVERLAY);
}

/**
 * تحسين Banner image
 */
export function optimizeBannerImage(url: string | undefined | null): string {
    return optimizeCloudinaryImage(url, IMAGE_SIZES.BANNER);
}

/**
 * تحسين thumbnail صغير جداً
 */
export function optimizeTinyThumb(url: string | undefined | null): string {
    return optimizeCloudinaryImage(url, IMAGE_SIZES.TINY_THUMB);
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
            const optimized = optimizeCloudinaryImage(url, {
                width,
                height: width,
                quality: 'auto:eco',
                format: 'auto'
            });
            return `${optimized} ${width}w`;
        })
        .join(', ');
}
