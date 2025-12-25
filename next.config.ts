import { withGraphCommerce } from '@graphcommerce/next-config'
import withSerwistInit from '@serwist/next'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const withPWA = withSerwistInit({
  swSrc: 'lib/sw.ts',
  swDest: 'public/sw.js',
  exclude: [/sitemap/, /robots/, 'sw.js'],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 10,
    pagesBufferLength: 10,
  },
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack(config) {
    // ✅ Override ProductListItem safely
    config.resolve.alias[
      'magento-product/components/ProductListItem'
    ] = path.resolve(
      __dirname,
      'components/magento-product/ProductListItem'
    )

    return config
  },
}

export default withGraphCommerce(withPWA(nextConfig))
