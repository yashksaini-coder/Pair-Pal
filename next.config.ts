import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images :{
    remotePatterns :[
      {
        protocol : 'https',
        hostname : 'avatars.githubusercontent.com',
        port : '',
        pathname : '/**'
      },
      {
        protocol : 'https',
        hostname : 'github.com',
        port : '',
        pathname : '/**'
      }
    ]
  }
};

export default nextConfig;
