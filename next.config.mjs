/** @type {import('next').NextConfig} */
const nextConfig = {
  // <- Esto hace que `npm run export` genere HTML estático
  output: 'export',

  // Si quieres rutas con trailing slash (opcional, pero suele funcionar mejor en S3)
  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Next no optimizará las imágenes en el servidor, usará URLs directas
    unoptimized: true,
  },
}

export default nextConfig
