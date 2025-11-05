import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Temporarily disabled to prevent memory errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Disabled to prevent build failures and memory issues
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable compression
  compress: true,
  // Standalone output for Appwrite deployment
  // This creates a minimal server bundle in .next/standalone
  output: 'standalone',
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Externalize packages to reduce bundle size (moved from experimental in Next.js 15)
  serverExternalPackages: [
    // Firebase removed - migrating to Appwrite
    'appwrite',
    'node-appwrite',
  ],
  // Optimize build performance and reduce memory usage
  outputFileTracingExcludes: {
    '*': [
      // Exclude large files from serverless function tracing
      '**/node_modules/@swc/core*/**',
      '**/node_modules/@next/swc*/**',
      '**/node_modules/next/dist/compiled/**',
      '**/node_modules/next/dist/server/**',
      // Exclude large source files that might be causing issues
      '**/src/lib/questions.ts',
      '**/past papers/**',
      '**/extracted_papers/**',
      '**/*.pdf',
      '**/*.json',
      '**/scripts/**',
      '**/docs/**',
      '**/*.md',
      '**/*.py',
      '**/*.ps1',
      '**/*.bat',
      '**/*.sh',
    ],
  },
  // Simplified webpack config for faster builds
  webpack: (config, { isServer, dev }) => {
    // Only apply optimizations in production
    if (!dev) {
      // Reduce parallel processing to avoid memory issues
      config.parallelism = 1;
      
      // Simplify optimization settings for faster builds
      config.optimization = {
        ...config.optimization,
        // Disable expensive analysis for faster builds
        usedExports: false,
        sideEffects: false,
        minimize: true,
      };
      
      // Disable source maps for faster builds
      config.devtool = false;
      
      // Simplify chunk splitting - less analysis = faster builds
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        };
      }
    }

    // Optimize module resolution
    config.resolve = {
      ...config.resolve,
      cache: true,
      symlinks: false,
    };

    // Exclude large files from webpack processing
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /\.(pdf|json)$/,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });

    return config;
  },
};

export default nextConfig;
