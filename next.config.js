/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  
  // ✅ Optimizaciones para Vercel
  experimental: {
    appDir: true,
  },
  
  // ✅ Output standalone para mejor performance
  output: 'standalone',
  
  // ✅ TrailingSlash para mejor routing
  trailingSlash: false,
}

module.exports = nextConfig