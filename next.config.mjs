/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a phone on the same Wi-Fi use the dev server (development only)
  allowedDevOrigins: ["192.168.12.2", "Jenifers-MacBook-Pro.local"],
};

export default nextConfig;
