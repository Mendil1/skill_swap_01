/**
 * Bundle analyzer configuration for performance monitoring
 * This helps identify large dependencies and optimization opportunities
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analyzer when ANALYZE=true
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!dev && !isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-analysis/client.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: '../bundle-analysis/client-stats.json',
          })
        );
      }

      if (!dev && isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-analysis/server.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: '../bundle-analysis/server-stats.json',
          })
        );
      }

      return config;
    },
  }),

  // Performance optimizations
  experimental: {
    // Enable compile-time optimizations
    optimizeCss: true,
    
    // Improve tree shaking
    esmExternals: true,
    
    // Enable WebAssembly support
    allowMiddlewareResponseBody: true,
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Performance optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize lodash imports
      'lodash-es': 'lodash',
    };

    return config;
  },
};

module.exports = nextConfig;
