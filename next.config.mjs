/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The contact form page is gone; old links land on the home page's
  // contact block (email) instead of a 404. Not permanent, so browsers
  // don't cache it if a /contact page ever comes back.
  async redirects() {
    return [{ source: "/contact", destination: "/#contact", permanent: false }];
  },
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
