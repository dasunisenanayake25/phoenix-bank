import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
=======
  /* config options here */
>>>>>>> 68a2d6c02c964faad59ad73411bf680c32d82355
};

export default nextConfig;
