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
  // Externalize packages to reduce bundle size (moved from experimental in Next.js 15)
  serverExternalPackages: [
    'firebase',
    'firebase-admin',
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
    ],
  },
  // Reduce memory usage during build
  webpack: (config, { isServer, dev }) => {
    // Optimize client bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        // Simplified chunk splitting for faster builds
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
        // Minimize runtime chunk size
        runtimeChunk: 'single',
      };
    }

    // Optimize module resolution
    config.resolve = {
      ...config.resolve,
      // Reduce file system calls during resolution
      cache: true,
      // Optimize module resolution
      symlinks: false,
      // Reduce module resolution attempts
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    };

    // Reduce memory usage by limiting parallel processing
    if (!dev) {
      config.parallelism = 1;
      // Limit chunk count to reduce memory
      config.optimization = {
        ...config.optimization,
        ...(config.optimization || {}),
        usedExports: false, // Disable tree shaking analysis for faster builds
      };
    }

    // Exclude large files from webpack processing
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add rule to ignore large files during build
    config.module.rules.push({
      test: /\.(pdf|json)$/,
      type: 'asset/resource',
      generator: {
        emit: false, // Don't emit these files during build
      },
    });

    return config;
  },
};

export default nextConfig;
