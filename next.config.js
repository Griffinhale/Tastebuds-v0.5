/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['books.google.com', 'lastfm.freetls.fastly.net'],
      },
}

module.exports = nextConfig