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

  // Update image source when src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

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
          unoptimized={imgSrc.includes('pexels.com')}
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
        unoptimized={imgSrc.includes('pexels.com')}
      />
    </div>
  );
}

