/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: false, // o componente portado e' um class component com setState em sequencia
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};
