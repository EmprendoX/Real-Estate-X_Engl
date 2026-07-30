/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'adzhwcywtpexvtcgqhsv.supabase.co'],
  },
  // Ensure the translation JSON files are bundled into the serverless
  // functions that render ISR pages (revalidate/fallback). Without this,
  // next-i18next can't find public/locales at runtime on Netlify and the
  // pages render raw translation keys when opened directly.
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./public/locales/**/*'],
    },
  },
  // ESLint no está instalado como dependencia; no bloquear el build por linting.
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig


