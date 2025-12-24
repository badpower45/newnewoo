import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image Component with:
 * - Lazy loading
 * - Blur placeholder
 * - Error handling
 * - WebP support
 * - Responsive images
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = 'https://placehold.co/400x400?text=No+Image',
  width,
  height,
  priority = false,
  objectFit = 'contain'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
  };

  // Convert Cloudinary URL to WebP if possible
  const getOptimizedSrc = (url: string) => {
    if (url.includes('cloudinary.com') && !url.includes('.webp')) {
      // Add Cloudinary transformations for better performance
      return url.replace('/upload/', '/upload/f_auto,q_auto:good,w_800/');
    }
    return url;
  };

  const optimizedSrc = getOptimizedSrc(imageSrc);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Image */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full
          object-${objectFit}
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${hasError ? 'opacity-50' : ''}
        `}
        style={{ width, height }}
      />

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">فشل تحميل الصورة</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Product Image with better optimization
 */
export const ProductImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}> = ({ src, alt, className, priority }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallback="https://placehold.co/400x400?text=Product"
      priority={priority}
      objectFit="contain"
    />
  );
};

/**
 * Responsive Image with srcset support
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes,
  className = ''
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Generate srcset for different screen sizes
  const getSrcSet = (url: string) => {
    if (url.includes('cloudinary.com')) {
      return `
        ${url.replace('/upload/', '/upload/w_400/')} 400w,
        ${url.replace('/upload/', '/upload/w_800/')} 800w,
        ${url.replace('/upload/', '/upload/w_1200/')} 1200w
      `;
    }
    return undefined;
  };

  const sizesString = `
    (max-width: 640px) ${sizes?.mobile || '100vw'},
    (max-width: 1024px) ${sizes?.tablet || '50vw'},
    ${sizes?.desktop || '33vw'}
  `;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imageSrc}
        srcSet={getSrcSet(imageSrc)}
        sizes={sizesString}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setImageSrc('https://placehold.co/800x800?text=Error');
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default OptimizedImage;
