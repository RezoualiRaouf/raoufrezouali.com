/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raoufrezouali.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
