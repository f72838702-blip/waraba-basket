import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Images téléversées par l'admin (Storage Supabase, bucket public).
      {
        protocol: "https",
        hostname: "wbiibtkklwmwzcicshfm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
