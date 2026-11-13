/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...tera jo bhi pehle se hai (cacheComponents etc.) wahi rehne de

  async redirects() {
    return [
      {
        source: "/consciousmain/dashboard",
        destination: "/consciousmain/dashboard/applications",
        permanent: false, // false = 307, browser cache nahi karega
      },
    ];
  },
};

export default nextConfig; // ya module.exports = nextConfig, jo tere file me hai