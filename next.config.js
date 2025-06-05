/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Ant Design
  transpilePackages: ['antd', '@ant-design/charts'],
  
  // Optimización del bundle
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/charts', 'date-fns'],
  },
  
  // Si usas ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configuración de imágenes (si las necesitas)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;