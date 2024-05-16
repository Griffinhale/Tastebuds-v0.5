/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['books.google.com', 'lastfm.freetls.fastly.net', 'images.igdb.com', 'image.tmdb.org'],
      },
}

module.exports = nextConfig