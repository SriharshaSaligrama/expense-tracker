import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        nodeMiddleware: true,
        authInterrupts: true,
        dynamicIO: true,
    },
};

export default nextConfig;
