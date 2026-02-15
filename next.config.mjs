/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Evita warning de múltiplos lockfiles
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
