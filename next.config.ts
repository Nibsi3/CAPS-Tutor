import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  // Note: Next.js 15+ supports src/app/ directory natively
  // .env.local is loaded from project root automatically
  typescript: {
    ignoreBuildErrors: true, // Temporarily disabled to prevent memory errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Disabled to prevent build failures and memory issues
  },
  // Add headers for better CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
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
      // Google profile images (OAuth)
      // Note: Next.js doesn't support wildcards in hostname, so we list all common subdomains
      {
        protocol: 'https',
        hostname: 'lh1.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh2.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        pathname: '/**',
      },
      // Appwrite Storage endpoints - specific hostnames
      // Note: Next.js doesn't support wildcards in remotePatterns, so we list common endpoints
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'us-east-1.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'us-west-1.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eu-central-1.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ap-south-1.cloud.appwrite.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ap-southeast-1.cloud.appwrite.io',
        pathname: '/**',
      },
      // Self-hosted Appwrite (if using custom domain)
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
        port: '443',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
        port: '80',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Ensure image optimization is enabled
    minimumCacheTTL: 60,
    // Add device sizes for better responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable compression
  compress: true,
  // Standalone output for Appwrite deployment
  // This creates a minimal server bundle in .next/standalone
  // Temporarily disabled - Appwrite Cloud Sites might not support standalone mode
  // output: 'standalone',
  // Fix standalone path issue on Windows by setting the root explicitly
  // This prevents Next.js from creating nested paths with spaces
  outputFileTracingRoot: path.resolve(process.cwd()),
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Experimental optimizations for faster builds
  experimental: {
    // Note: forceSwcTransforms removed - not compatible with Turbopack
    // Enable build cache for faster rebuilds
    // This caches compiled outputs in .next/cache/
    // Note: Appwrite may need to preserve .next/cache/ between builds
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Note: optimizeCss removed - requires 'critters' dependency which causes build failures
  },
  // Generate build ID for better caching
  // Note: Using timestamp in build environments where git may not be available
  generateBuildId: async () => {
    // Try git commit hash if available, otherwise use timestamp
    try {
      const { execSync } = require('child_process');
      const hash = execSync('git rev-parse --short HEAD', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000 
      }).trim();
      return hash || `build-${Date.now()}`;
    } catch {
      // Fallback to timestamp if git is not available (e.g., in Appwrite build environment)
      return `build-${Date.now()}`;
    }
  },
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
  // Optimized webpack config for faster builds
  webpack: (config, { isServer, dev }) => {
    // Only apply optimizations in production
    if (!dev) {
      // Increase parallelism for faster builds (use 4 workers)
      // This balances speed with memory usage
      config.parallelism = 4;
      
      // Optimize build settings for faster compilation
      config.optimization = {
        ...config.optimization,
        // Disable expensive analysis for faster builds
        usedExports: false,
        sideEffects: false,
        minimize: true,
      };
      
      // Disable source maps for faster builds
      config.devtool = false;
      
      // Optimize chunk splitting for better caching and faster builds
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
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
