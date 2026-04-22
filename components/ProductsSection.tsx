import React, { useState, useEffect } from 'react'
import { Box, Container, Grid, Typography, Skeleton } from '@mui/material'
import { gql, useQuery } from '@apollo/client'

// ─────────────────────────────────────────────────────────────────────────────
// USAGE in index.tsx:
//
//   import ProductsSection from '../components/ProductsSection'
//
//   <ProductsSection categoryIds={[246, 247, 248]} />
//   <ProductsSection categoryIds={[249, 250]} pageSize={8} />
//   <ProductsSection categoryIds={[251, 252, 253]} title="Electronics, Gifts & Wellness" />
//
// Props:
//   categoryIds  — required, array of Magento category IDs to fetch
//   pageSize     — optional, number of products per category (default: 6)
//   title        — optional, section heading override
// ─────────────────────────────────────────────────────────────────────────────

// ── Theme ─────────────────────────────────────────────────────────────────────
const BRAND = '#125ab5'
const BRAND_LIGHT = '#f8fafc'
const BRAND_MID = '#e2e8f0'
const BRAND_DARK = '#0e4491'
const BRAND_TEXT = '#000000'

// ── GraphQL query — same pattern as SELLER_PRODUCTS_QUERY in reference page ──
const HOMEPAGE_PRODUCTS_QUERY = gql`
  query GetHomepageProducts($category_ids: [Int!]!, $pageSize: Int) {
    homepageCategoryProducts(category_ids: $category_ids, pageSize: $pageSize) {
      category_id
      category_name
      category_url
      products {
        name
        url_key
        price
        image
        category
        store_code
        store_name
        unit_of_measurement
      }
    }
  }
`

// ── Types ─────────────────────────────────────────────────────────────────────
interface ApiProduct {
  name: string
  url_key: string
  price: number
  image: string
  category: string
  store_code: string | null
  store_name: string | null
  unit_of_measurement: string
}

interface CategoryData {
  category_id: number
  category_name: string
  category_url: string
  products: ApiProduct[]
}

interface HomepageProductsQueryResult {
  homepageCategoryProducts: CategoryData[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`
  return `₹${price}`
}

function isValidImage(url: string): boolean {
  if (!url) return false
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: ApiProduct }) {
  const [hovered, setHovered] = useState(false)
  const [quoteAdded, setQuoteAdded] = useState(false)
  const hasImage = isValidImage(product.image)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '12px',
        border: `1.5px solid ${hovered ? BRAND : '#e5e7eb'}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
        height: '100%',
        fontFamily: '"DM Sans", sans-serif',
        boxShadow: hovered ? '0 6px 24px rgba(18,90,181,0.10)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <Box sx={{
        height: '140px',
        bgcolor: BRAND_LIGHT,
        borderBottom: `1px solid ${BRAND_MID}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {hasImage ? (
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none'
            }}
            sx={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : null}
      </Box>

      {/* Body */}
      <Box sx={{ p: '11px 13px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Typography component="a"
          href={`/p/${product.url_key}`} sx={{
            fontSize: '0.75rem', textDecoration: 'none', fontWeight: 700, lineHeight: 1.35, color: '#0f172a',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', minHeight: 33, fontFamily: '"DM Sans", sans-serif',
          }}>
          {product.name}
        </Typography>

        {product.store_name && (
          <Box component="a"
            href={`/seller/${product.store_code}`} sx={{
              fontSize: '0.62rem', fontWeight: 600,
              bgcolor: BRAND_LIGHT, color: BRAND_TEXT,
              borderRadius: '4px', px: '7px', py: '2px',
              display: 'inline-block', alignSelf: 'flex-start',
              fontFamily: '"DM Sans", sans-serif',
              maxWidth: '100%', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
            🏪 {product.store_name}
          </Box>
        )}

        <Box sx={{ mt: '3px', display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: '"DM Sans", sans-serif' }}>
            {formatPrice(product.price)}
          </Typography>
          {product.unit_of_measurement && (
            <Typography sx={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: '"DM Sans", sans-serif' }}>
              / {product.unit_of_measurement}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: '7px 12px 11px' }}>
        <Box
          component="a"
          href={`/p/${product.url_key}`}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            py: '7px',
            bgcolor: 'transparent',
            border: `1px solid ${BRAND}`,
            borderRadius: '7px',

            fontSize: '0.72rem',
            fontWeight: 700,
            color: BRAND,
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            textDecoration: 'none',

            '&:hover': {
              bgcolor: BRAND_LIGHT,
            },
          }}
        >
          View Details
        </Box>
      </Box>


    </Box>



  )
}

// ── Skeleton loader card ──────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Box sx={{ borderRadius: '12px', border: '1.5px solid #e5e7eb', bgcolor: '#fff', overflow: 'hidden', height: '100%' }}>
      <Skeleton variant="rectangular" height={90} />
      <Box sx={{ p: '11px 13px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
      <Box sx={{ p: '7px 12px 11px', display: 'flex', gap: '6px' }}>
        <Skeleton variant="rounded" width="70%" height={32} />
        <Skeleton variant="rounded" width="28%" height={32} />
      </Box>
    </Box>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ProductsSectionProps {
  /** Array of Magento category IDs to display */
  categoryIds: number[]
  /** Number of products per category (default: 6) */
  pageSize?: number
  /** Optional section title override */
  title?: string
}

// ── Main exported component ───────────────────────────────────────────────────
export default function ProductsSection({ categoryIds, pageSize = 6, title }: ProductsSectionProps) {

  // Apollo useQuery — same pattern as the seller products reference page
  const { data, loading, error } = useQuery<HomepageProductsQueryResult>(
    HOMEPAGE_PRODUCTS_QUERY,
    {
      variables: { category_ids: categoryIds, pageSize },
      fetchPolicy: 'cache-and-network',
      skip: !categoryIds || categoryIds.length === 0,
    }
  )

  // Filter to only categories that have at least 1 product
  const categories: CategoryData[] = (data?.homepageCategoryProducts ?? []).filter(
    (c) => c.products?.length > 0
  )

  const [activeId, setActiveId] = useState<number | null>(null)

  // Set first tab active once data arrives
  useEffect(() => {
    if (categories.length > 0 && activeId === null) {
      setActiveId(categories[0].category_id)
    }
  }, [categories.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCat = categories.find((c) => c.category_id === activeId) ?? categories[0] ?? null

  const sectionTitle =
    title ??
    (categories.length > 0
      ? categories.map((c) => c.category_name.split(' ')[0]).join(' · ')
      : 'Products')

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box sx={{ bgcolor: '#fff', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{
            p: 3, borderRadius: '12px', border: '1.5px solid #fee2e2',
            bgcolor: '#fff5f5', color: '#dc2626', fontFamily: '"DM Sans", sans-serif',
          }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Failed to load products</Typography>
            <Typography sx={{ fontSize: '0.85rem', opacity: 0.8 }}>{error.message}</Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#fff', py: 0, fontFamily: '"DM Sans", sans-serif' }}>
      <Container maxWidth="lg">

        {/* ── Section header ── */}
        <Box sx={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          mb: 3, flexWrap: 'wrap', gap: 1.5,
        }}>
          <Box>
            {loading && categories.length === 0 ? (
              <Skeleton variant="text" width={280} height={40} />
            ) : (
              <Typography variant="h4" sx={{
                fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em',
                fontSize: { xs: '1.5rem', md: '1.9rem' }, fontFamily: '"DM Sans", sans-serif',
              }}>
                {sectionTitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Category tab strip ── */}
        <Box sx={{
          display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, mb: 1.5,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {loading && categories.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={120} height={36} sx={{ borderRadius: '100px', flexShrink: 0 }} />
            ))
            : categories.map((cat) => {
              const isActive = (activeId ?? categories[0]?.category_id) === cat.category_id
              const shortLabel = cat.category_name
              return (
                <Box
                  key={cat.category_id}
                  component="button"
                  onClick={() => setActiveId(cat.category_id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    px: 2, py: '8px', borderRadius: '100px', flexShrink: 0,
                    border: `1px solid ${isActive ? BRAND : '#e5e7eb'}`,
                    bgcolor: isActive ? BRAND_LIGHT : '#fafafa',
                    color: isActive ? BRAND_TEXT : '#6b7280',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.78rem', cursor: 'pointer',
                    fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.18s',
                  }}
                >
                  {shortLabel}
                </Box>
              )
            })}
        </Box>

        {/* ── Active category info strip ── */}
        {loading && categories.length === 0 ? (
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: '10px', mb: 2 }} />
        ) : activeCat ? (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            p: '12px 16px', borderRadius: '10px', mb: 2,
            bgcolor: BRAND_LIGHT, border: `1px solid ${BRAND_MID}`,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: BRAND_TEXT, fontFamily: '"DM Sans", sans-serif' }}>
                {activeCat.category_name}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: BRAND_TEXT, opacity: 0.7, fontFamily: '"DM Sans", sans-serif' }}>
                Verified bulk suppliers
              </Typography>
            </Box>
            <Box component="a"
              href={`/c/${activeCat.category_url}`} sx={{
                ml: 'auto', px: 2, py: '6px',
                bgcolor: BRAND, color: '#fff', border: 'none', textDecoration: 'none',
                borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                '&:hover': { bgcolor: BRAND_DARK },
              }}>
              View all →
            </Box>
          </Box>
        ) : null}

        {/* ── Product grid ── */}
        <Grid container spacing={2}>
          {loading && categories.length === 0
            ? Array.from({ length: pageSize }).map((_, i) => (
              <Grid item xs={6} sm={4} md={2} lg={2} key={i}>
                <SkeletonCard />
              </Grid>
            ))
            : activeCat?.products.map((product) => (
              <Grid item xs={6} sm={4} md={2} lg={2} key={product.url_key}>
                <ProductCard
                  product={product}
                />
              </Grid>
            ))}
        </Grid>

      </Container>
    </Box>
  )
}