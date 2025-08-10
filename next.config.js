/** @type {import('next').NextConfig} */

// ✅ Import module phân tích bundle
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withBundleAnalyzer({
  reactStrictMode: true, // ✅ Bật chế độ kiểm tra nghiêm ngặt của React
  trailingSlash: false, // ✅ Giữ URL gọn gàng, không có dấu '/'

  i18n: {
    locales: ['en', 'vi', 'id', 'ar', 'de', 'es', 'pt', 'fr', 'it', 'cs', 'tr', 'ja', 'th', 'zh'],
    //locales: ['en', 'vi', 'id', 'ar', 'de', 'es', 'pt', 'fr', 'it', 'cz', 'tr', 'ja', 'th', 'zh'],
    defaultLocale: 'en', // ✅ Ngôn ngữ mặc định là tiếng Anh
    localeDetection: false, // ✅ Tắt tự động nhận diện ngôn ngữ trình duyệt
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.tube5s.com/api/:path*', // ✅ Proxy API tới backend
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // ✅ Ngăn chặn clickjacking
          { key: 'X-Content-Type-Options', value: 'nosniff' }, // ✅ Ngăn chặn MIME sniffing
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // ✅ Cải thiện bảo mật referrer
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }, // ✅ Giới hạn quyền truy cập thiết bị
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false }; // ✅ Tránh lỗi khi sử dụng module `fs` trên trình duyệt
    }
    return config;
  },

  output: 'standalone', // ✅ Hỗ trợ triển khai server độc lập, tối ưu resource

  // images: {
  //   domains: ['tikcdn.io', 'cdn.example.com'], // ✅ Cho phép tải ảnh từ các domain cụ thể
  // },
});

module.exports = nextConfig;
