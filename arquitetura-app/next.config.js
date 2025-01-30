/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt'];
    return config;
  },
}

module.exports = nextConfig 