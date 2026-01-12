/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'localhost'],
    },
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
};

export default nextConfig;
