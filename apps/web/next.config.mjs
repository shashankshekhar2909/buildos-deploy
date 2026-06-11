/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@buildos/types"],
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  ...(process.env.API_URL && {
    async rewrites() {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${process.env.API_URL}/api/v1/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
