'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';

interface AdvancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * Advanced Image component with progressive enhancement, format detection,
 * and performance optimizations
 */
function AdvancedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  ...props
}: AdvancedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Generate optimized sizes based on viewport
  const optimizedSizes = sizes || (
    fill ? '100vw' : 
    width ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px` :
    '100vw'
  );
  // Generate blur placeholder from image if not provided
  const generateBlurPlaceholder = (): string => {
    // Simple SVG blur placeholder
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="#f0f0f0"/>
        <rect width="40" height="40" fill="url(#gradient)" opacity="0.3"/>
        <defs>
          <linearGradient id="gradient">
            <stop offset="0%" stop-color="#e0e0e0"/>
            <stop offset="100%" stop-color="#d0d0d0"/>
          </linearGradient>
        </defs>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // Use Intersection Observer for better lazy loading
  useEffect(() => {
    if (!imageRef.current || priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is about to enter viewport, start loading
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // If there's an error and we have a fallback, use it
  if (imageError && fallbackSrc) {
    return (
      <Image
        ref={imageRef}
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        placeholder="empty"
        sizes={optimizedSizes}
        fill={fill}
        onLoad={handleImageLoad}
        {...props}
      />
    );
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${
            fill ? 'w-full h-full' : ''
          }`}
          style={!fill ? { width, height } : {}}
        />
      )}
      
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-500 ease-in-out`}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || generateBlurPlaceholder()}
        sizes={optimizedSizes}
        fill={fill}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
}

/**
 * Responsive Image component that automatically selects the best image format
 * and size based on device capabilities and viewport
 */
interface ResponsiveImageProps extends Omit<AdvancedImageProps, 'src'> {
  srcSet: {
    webp?: string;
    avif?: string;
    jpg?: string;
    png?: string;
  };
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const ResponsiveImage = memo(function ResponsiveImage({
  srcSet,
  alt,
  ...props
}: ResponsiveImageProps) {
  const [supportedFormat, setSupportedFormat] = useState<string>('');

  useEffect(() => {
    // Check browser support for modern image formats
    const checkImageSupport = async () => {
      try {
        // Check AVIF support
        if (srcSet.avif) {
          const avifSupported = await checkFormatSupport('image/avif');
          if (avifSupported) {
            setSupportedFormat(srcSet.avif);
            return;
          }
        }

        // Check WebP support
        if (srcSet.webp) {
          const webpSupported = await checkFormatSupport('image/webp');
          if (webpSupported) {
            setSupportedFormat(srcSet.webp);
            return;
          }
        }

        // Fallback to JPG or PNG
        setSupportedFormat(srcSet.jpg || srcSet.png || '');
      } catch {
        // Fallback to traditional formats
        setSupportedFormat(srcSet.jpg || srcSet.png || '');
      }
    };

    checkImageSupport();
  }, [srcSet]);

  // Check if browser supports a specific image format
  const checkFormatSupport = (format: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Test images for format support
      const testImages: Record<string, string> = {
        'image/webp': 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
        'image/avif': 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      };

      img.src = testImages[format] || '';
    });
  };

  if (!supportedFormat) {
    // Show loading state while format detection is in progress
    return (
      <div className="animate-pulse bg-gray-200 rounded" style={{ width: props.width, height: props.height }}>
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      </div>
    );
  }

  return <AdvancedImage src={supportedFormat} alt={alt} {...props} />;
});

export default memo(AdvancedImage);
