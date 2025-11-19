'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = 'https://images.pexels.com/photos/3760851/pexels-photo-3760851.jpeg?auto=compress&cs=tinysrgb&w=2070&dpr=2';

// Allowed image domains from next.config.ts (must match remotePatterns exactly)
const ALLOWED_DOMAINS = [
  'placehold.co',
  'images.unsplash.com',
  'images.pexels.com',
  'picsum.photos',
  // Google profile images - all subdomains explicitly listed
  'lh1.googleusercontent.com',
  'lh2.googleusercontent.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  // Appwrite Storage endpoints
  'fra.cloud.appwrite.io',
  'us-east-1.cloud.appwrite.io',
  'us-west-1.cloud.appwrite.io',
  'eu-central-1.cloud.appwrite.io',
  'ap-south-1.cloud.appwrite.io',
  'ap-southeast-1.cloud.appwrite.io',
  'localhost', // For development
];

// Check if image domain is in the allowed list (matches remotePatterns)
function isAllowedDomain(src: string | undefined): boolean {
  if (!src || src.startsWith('/') || src.startsWith('data:')) {
    return true; // Local or data URI - always allowed
  }
  
  try {
    const url = new URL(src);
    const hostname = url.hostname;
    
    // Check if hostname matches any allowed domain exactly or as subdomain
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    // Invalid URL, assume local/allowed
    return true;
  }
}

// Check if we should use regular img tag instead of Next.js Image
// This is needed because Next.js Image validates against remotePatterns even with unoptimized
function shouldUseRegularImg(src: string | undefined): boolean {
  if (!src || src.startsWith('/') || src.startsWith('data:')) {
    return false; // Local or data URI - use Next.js Image
  }
  
  // If domain is not in allowed list, Next.js Image will fail
  // So we should use regular img tag
  return !isAllowedDomain(src);
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill,
  sizes,
  fallbackSrc = DEFAULT_FALLBACK,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSvg, setIsSvg] = useState(() => src?.toLowerCase().endsWith('.svg') ?? false);
  const [useRegularImg, setUseRegularImg] = useState(() => shouldUseRegularImg(src));

  // Update image source when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
    setIsSvg(src?.toLowerCase().endsWith('.svg') ?? false);
    setUseRegularImg(shouldUseRegularImg(src));
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      // If Next.js Image fails, try regular img tag
      if (!useRegularImg) {
        setUseRegularImg(true);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Use regular img tag for external domains not in remotePatterns or if Next.js Image failed
  if (useRegularImg || shouldUseRegularImg(imgSrc)) {
    if (fill) {
      return (
        <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
          {isLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <img
            src={imgSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={handleError}
            onLoad={handleLoad}
          />
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  // Use Next.js Image for allowed domains
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={imgSrc.includes('pexels.com') || isSvg || !isAllowedDomain(imgSrc)}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={imgSrc.includes('pexels.com') || isSvg || !isAllowedDomain(imgSrc)}
      />
    </div>
  );
}

