import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Paper,
  InputBase,
} from '@mui/material'
import {
  Search as SearchIcon,
  LocalFireDepartment as TrendingIcon,
  ArrowForward as ArrowIcon,
  CheckCircleOutline as CheckIcon,
  Storefront as StoreIcon,
  Inventory2Outlined as ProductIcon,
  Groups as BuyersIcon,
  SupportAgent as SupportIcon,
  VerifiedUser as VerifiedIcon,
  RequestQuote as QuoteIcon,
  LocalShipping as ShippingIcon,
  EmojiEvents as AwardIcon,
  KeyboardArrowRight as ChevronIcon,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import ProductsSection from './../components/ProductsSection'
import { useRouter } from 'next/router'
// ── Types ─────────────────────────────────────────────────────────────────────
type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// Derived from the Magento menu GraphQL shape
type MenuCategory = {
  uid?: string | null
  name?: string | null
  url_path?: string | null
  image?: string | null
  children?: Array<{
    uid?: string | null
    name?: string | null
    url_path?: string | null
    children?: Array<{
      uid?: string | null
      name?: string | null
      url_path?: string | null
    } | null> | null
  } | null> | null
}

// ── Category icon map (keyed by uid or partial name match) ───────────────────
// Extend this map as your Magento categories grow.
const CATEGORY_ICONS: Record<string, string> = {
  agriculture: '🌾',
  construction: '🏗️',
  electrical: '⚡',
  machinery: '⚙️',
  metals: '🔩',
  medical: '🏥',
  packaging: '📦',
  piping: '🔧',
  health: '💊',
  chemicals: '🧪',
  industrial: '🏭',
  gifting: '🎁',
  home: '🏠',
  clothing: '👕',
}

function getCategoryIcon(name: string): string {
  const lower = (name ?? '').toLowerCase()
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '📁'
}

// ── Stats & Benefits (static content, unchanged) ─────────────────────────────
const STATS = [
  { icon: <StoreIcon sx={{ fontSize: 28 }} />, value: '500+', label: 'Verified Suppliers' },
  { icon: <ProductIcon sx={{ fontSize: 28 }} />, value: '50K+', label: 'Products Listed' },
  { icon: <BuyersIcon sx={{ fontSize: 28 }} />, value: '1,200+', label: 'Active Buyers' },
  { icon: <SupportIcon sx={{ fontSize: 28 }} />, value: '24/7', label: 'Trade Support' },
]

const BENEFITS = [
  { icon: <VerifiedIcon sx={{ fontSize: 36 }} />, title: 'Verified Network', desc: 'Every supplier is verified before listing on our platform.' },
  { icon: <QuoteIcon sx={{ fontSize: 36 }} />, title: 'Instant Quotes', desc: 'Post your requirement and receive competitive bulk quotes within hours.' },
  { icon: <ShippingIcon sx={{ fontSize: 36 }} />, title: 'Logistics Support', desc: 'End-to-end freight solutions — from factory to your doorstep.' },
  { icon: <AwardIcon sx={{ fontSize: 36 }} />, title: 'Quality Assured', desc: 'Product samples, inspection reports and buyer protection on every order.' },
]

// ── Sub-component: Category Card ─────────────────────────────────────────────
function CategoryCard({
  cat,
  variant = 'default',
  label
}: {
  cat: MenuCategory
  variant?: 'default' | 'compact'
  label?: string
}) {
  const [hovered, setHovered] = useState(false)
  const icon = getCategoryIcon(cat.name ?? '')
  const subCategories = cat.children?.filter(Boolean) ?? []
  const imageUrl = cat.image?.startsWith('http')
    ? cat.image
    : cat.image
      ? `${process.env.NEXT_PUBLIC_MAGENTO_ENDPOINT}${cat.image}`
      : null

  return (
    <Box
      component="a"
      href={cat.url_path ? `/${cat.url_path}` : '#'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? '#f97316' : '#e5e7eb'}`,
        transition: 'all 0.24s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'pointer',
        bgcolor: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
    >
      {/* 🔥 NEW: IMAGE BLOCK */}
      {imageUrl ? variant !== 'compact' && (
        <Box sx={{ position: 'relative' }}>
          {/* IMAGE */}
          <Box
            sx={{
              height: 120,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* 🔥 LABEL BADGE */}
          {label && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                px: 1.2,
                py: '3px',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '6px',
                color: '#fff',

                // optional: dynamic colors
                background: '#1159b4',
              }}
            >
              {label}
            </Box>
          )}
        </Box>
      ) : (
        null
      )}
      {/* ── Card body ── */}
      <Box sx={{ p: '14px 16px 10px', flex: 1 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#0f172a',
            lineHeight: 1.3,
            mb: 1.5,
          }}
        >
          {icon} {cat.name}
        </Typography>

        {variant !== 'compact' && subCategories.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {subCategories.slice(0, 4).map((sub, i, arr) => (
              <Box
                key={sub?.uid ?? i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: '5px',
                  borderBottom: i < arr.length - 1 ? '1px dashed #f1f5f9' : 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#f97316', pl: 0.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'black',
                    fontFamily: '"DM Sans", sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  {sub?.name}
                </Typography>
                <ChevronIcon sx={{ fontSize: 14, opacity: 0.45, flexShrink: 0, ml: 0.5 }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Card footer ── */}
      {variant !== 'compact' && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f97316',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Explore <ChevronIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function IndexPage(props: LayoutNavigationProps) {
  const [searchVal, setSearchVal] = useState('')
  const router = useRouter()

  // Pull categories from the same GraphQL data the nav uses
  const allCategories: MenuCategory[] =
    (props.menu?.items?.[0]?.children?.filter(Boolean) as MenuCategory[]) ?? []

  // "Trending" = first 4 categories (or adapt this logic to a tag/attribute if your
  // Magento setup exposes one, e.g. cat.is_trending or similar)
  const trendingCategories = allCategories.slice(0, 4)
  const LABELS = ['Trending', 'Top Seller', 'Hot', 'New']
  return (
    <>
      <PageMeta
        title="QTYBID — India's B2B Marketplace | Connect. Trade. Grow."
        metaDescription="Connect with verified suppliers across 14 categories. Post requirements, get quotes, and grow your business on QTYBID."
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 55%, #14527a 100%)',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
        }}
      >
        {[
          { size: 500, top: -180, right: -120, opacity: 0.06 },
          { size: 300, top: 40, right: 220, opacity: 0.04 },
          { size: 200, bottom: -60, left: -60, opacity: 0.05 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: c.size,
              height: c.size,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,.3)',
              top: c.top,
              right: c.right,
              bottom: c.bottom,
              left: c.left,
              opacity: c.opacity,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="🇮🇳  Made in India · For Indian Businesses"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.9)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  mb: 1.5,
                  border: '1px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(4px)',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3.2rem' },
                  color: '#fff',
                  lineHeight: 1.15,
                  mb: 1.5,
                  letterSpacing: '-0.02em',
                }}
              >
                India's Emerging{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  B2B Marketplace
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,.75)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 2.5,
                  maxWidth: 560,
                  lineHeight: 1.65,
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                Connect with verified suppliers across {allCategories.length || 14} industries. Post requirements, receive
                competitive bulk quotes, and grow your procurement network.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,.25)',
                  maxWidth: 580,
                  mb: 2,
                }}
              >
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search products, categories, suppliers…"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchVal.trim()) {
                      router.push(`/search/${encodeURIComponent(searchVal.trim())}`)
                    }
                  }}
                  sx={{
                    flex: 1,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.95rem',
                    '& input': { py: 1.6 },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 0,
                    px: 3,
                    background: 'linear-gradient(90deg, #f97316, #ea580c)',
                    textTransform: 'none',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
                  }}
                >
                  Search
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {allCategories.slice(0, 5).map((cat) => (
                  <Chip
                    key={cat.uid}
                    label={cat.name}
                    size="small"
                    onClick={() => setSearchVal(cat.name ?? '')}
                    sx={{
                      bgcolor: 'rgba(255,255,255,.1)',
                      color: 'rgba(255,255,255,.85)',
                      border: '1px solid rgba(255,255,255,.2)',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,.18)' },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.12)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '1rem',
                      mb: 0.4,
                    }}
                  >
                    ⚡ Seamless Procurement Flow
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,.5)', fontSize: '0.78rem' }}>
                    From requirement to delivery — simplified
                  </Typography>
                </Box>

                <Box sx={{ px: 2.5, pb: 0 }}>
                  {[
                    {
                      step: '01',
                      icon: '🧾',
                      title: 'Multi-Seller Quotes',
                      sub: 'Add products and receive competitive offers from verified sellers.',
                    },
                    {
                      step: '02',
                      icon: '💰',
                      title: 'Customized Pricing',
                      sub: 'Tailored quotes based on your bulk volume and requirements.',
                    },
                    {
                      step: '03',
                      icon: '🤝',
                      title: 'Direct Negotiations',
                      sub: 'Message sellers to finalize terms, shipping, and lead times.',
                    },
                    {
                      step: '04',
                      icon: '🛟',
                      title: '24/7 Trade Support',
                      sub: 'Our team assists you from inquiry to final delivery.',
                    },
                  ].map((item, i, arr) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        py: 1,
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '7px',
                            bgcolor: i === 0 ? '#f97316' : 'rgba(255,255,255,.1)',
                            border: `1.5px solid ${i === 0 ? '#f97316' : 'rgba(255,255,255,.2)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            color: '#fff',
                            fontFamily: '"DM Sans", sans-serif',
                          }}
                        >
                          {item.step}
                        </Box>
                        {i < arr.length - 1 && (
                          <Box
                            sx={{
                              width: '1px',
                              height: 12,
                              background: 'linear-gradient(to bottom, rgba(249,115,22,.4), rgba(255,255,255,.06))',
                              mt: '2px',
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                          <span style={{ fontSize: '0.88rem' }}>{item.icon}</span>
                          <Typography
                            sx={{
                              fontFamily: '"DM Sans", sans-serif',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              color: '#fff',
                              lineHeight: 1.2,
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: '0.73rem',
                            color: 'rgba(255,255,255,.5)',
                            lineHeight: 1.45,
                          }}
                        >
                          {item.sub}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ px: 3, pb: 2, pt: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    sx={{
                      background: 'linear-gradient(90deg, #f97316, #ea580c)',
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      py: 1.2,
                      '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
                    }}
                  >
                    Register — Free
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TRUST BAR ──────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f97316', py: 1.5 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 5 },
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[
              '✅ Zero Commission on First 100 Orders',
              '🔒 Verified Suppliers',
              '💬 24/7 Trade Desk',
              '🆓 Free Registration',
            ].map((t) => (
              <Typography
                key={t}
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: { xs: '0.78rem', md: '0.88rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── TRENDING / MOST ACTIVE CATEGORIES ─────────────────────────────── */}
      {trendingCategories.length > 0 && (
        <Box sx={{ bgcolor: '#fafafa', py: { xs: 2, md: 2 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <TrendingIcon sx={{ color: '#1159b4', fontSize: 20 }} />
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 800,
                      color: '#1159b4',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Trending Now
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: { xs: '1.5rem', md: '1.9rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  Most Active Categories
                </Typography>
              </Box>

              <Button
                variant="contained"
                component="a"
                href="/allcategories"
                endIcon={<ArrowIcon />}
                sx={{
                  background: '#f8f9fa',
                  textTransform: 'none',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  borderRadius: '9px',
                  px: 2.5,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { background: '#f8f9fa', boxShadow: 'none' },
                }}
              >
                View All Categories
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {trendingCategories.map((cat, index) => (
                <Grid item xs={12} sm={6} md={3} key={cat.uid}>
                  <CategoryCard cat={cat} variant='default' label={LABELS[index]} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      <ProductsSection categoryIds={[246, 283, 320]} />

      {/* ── Bottom CTA ── */}
      <Box sx={{
        mt: 3, mb: 3, p: '18px 22px', borderRadius: '12px',
        background: 'linear-gradient(90deg, #0c1e3c, #1a3a6b)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: '"DM Sans", sans-serif' }}>
            Can't find what you need?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '0.8rem', mt: 0.3, fontFamily: '"DM Sans", sans-serif' }}>
            Post a requirement and receive bulk quotes from verified suppliers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box component="button" sx={{
            px: 2.5, py: '9px', bgcolor: '#f97316', color: '#fff', border: 'none',
            borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            '&:hover': { bgcolor: '#c2410c' },
          }}>
            Post requirement
          </Box>
          <Box component="button" sx={{
            px: 2.5, py: '9px', bgcolor: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,.3)', borderRadius: '9px',
            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
          }}>
            Browse all
          </Box>
        </Box>
      </Box>

      <ProductsSection categoryIds={[357, 431, 504]} />

      {/* ── ALL CATEGORIES ──────────────────────────────────────────────────── */}
      {allCategories.length > 0 && (
        <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  color: '#1159b4',
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 0.5,
                }}
              >
                Browse by Industry
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1.5rem', md: '1.9rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                All Product Categories
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {allCategories.map((cat) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.uid}>
                  <CategoryCard cat={cat} variant="compact" />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── WHY QTYBID ──────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                color: '#0f172a',
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Why Thousands Choose QTYBID
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '1.05rem',
                maxWidth: 480,
                mx: 'auto',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Built specifically for India's bulk procurement ecosystem
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {BENEFITS.map((b, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '16px',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      boxShadow: '0 12px 32px rgba(29,78,216,.1)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ color: '#1d4ed8', mb: 2 }}>{b.icon}</Box>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#0f172a',
                      mb: 1,
                    }}
                  >
                    {b.title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {b.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── EARLY OFFER BANNER ──────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 100%)',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="🎉 Limited Time — Early Member Offer"
            sx={{
              bgcolor: '#f97316',
              color: '#fff',
              fontWeight: 700,
              mb: 3,
              fontSize: '0.82rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 800,
              color: '#fff',
              mb: 2,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}
          >
            Ready to Grow Your Business?
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #f97316, #ea580c)',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
              }}
            >
              Get Started for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,.4)',
                borderWidth: 2,
                color: '#fff',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: '#fff',
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,.08)',
                },
              }}
            >
              Post a Requirement
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Free Registration', 'No Hidden Fees', '24/7 Support', 'Zero Commission'].map(
              (t) => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,.8)',
                      fontSize: '0.88rem',
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    {t}
                  </Typography>
                </Box>
              ),
            )}
          </Box>
        </Container>
      </Box>
    </>
  )
}

IndexPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default IndexPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  return {
    props: {
      ...(await layout).data,
      up: { href: '/', title: i18n._(/* i18n */ 'Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}