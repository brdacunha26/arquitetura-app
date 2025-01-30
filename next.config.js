/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  compiler: {
    emotion: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];
    return config;
  },
  // Configurações para Supabase e Vercel
  images: {
    domains: ['dpymltbyj.cloudinary.com'], // Domínios de imagens permitidos
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 