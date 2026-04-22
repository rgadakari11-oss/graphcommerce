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
  InputBase,
  Chip,
  Collapse,
} from '@mui/material'
import {
  Search as SearchIcon,
  KeyboardArrowRight as ChevronIcon,
  KeyboardArrowDown as ChevronDownIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material'
import React, { useState, useMemo } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

// ── Re-use the same LayoutQuery type that LayoutNavigation already receives ──
// `menu` comes from LayoutDocument which is already fetched in getStaticProps

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ── Brand tokens — consistent with LayoutNavigation ───────────────────────────
const BRAND = '#1e40af'
const BRAND_DARK = '#1e3a8a'
const BRAND_LIGHT = '#eff6ff'
const BRAND_MID = '#bfdbfe'
const ORANGE = '#f97316'

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTER_TABS = ['All', 'A–F', 'G–M', 'N–Z']

// ── Colour palette cycling for category accent colours ───────────────────────
const ACCENT_PALETTE = [
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },

  { color: '#1d4ed8', bg: '#eff6ff' },

  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },
  { color: '#1d4ed8', bg: '#eff6ff' },

]

function accentForIndex(i: number) {
  return ACCENT_PALETTE[i % ACCENT_PALETTE.length]
}

// ── Types mirroring LayoutQuery menu shape ────────────────────────────────────
interface MicroCategory {
  uid: string
  name: string
  url_path: string
}

interface SubCategory {
  uid: string
  name: string
  url_path: string
  children?: MicroCategory[]
}

interface MainCategory {
  uid: string
  name: string
  url_path: string
  children?: SubCategory[]
}

// ── Sub-category row (with optional micro-categories) ─────────────────────────
function SubCategoryRow({
  sub,
  accent,
}: {
  sub: SubCategory
  accent: { color: string; bg: string }
}) {
  const [open, setOpen] = useState(false)
  const hasMicro = (sub.children?.length ?? 0) > 0

  return (
    <Box>
      <Box
        onClick={() => hasMicro && setOpen((o) => !o)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: '6px',
          px: '10px',
          borderRadius: '6px',
          cursor: hasMicro ? 'pointer' : 'default',
          transition: 'all 0.15s',
          '&:hover': {
            bgcolor: hasMicro ? accent.bg : 'transparent',
            color: accent.color,
          },
        }}
      >
        <Box
          component="a"
          href={`/${sub.url_path}`}
          onClick={(e: React.MouseEvent) => hasMicro && e.preventDefault()}
          sx={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'inherit',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif',
            flex: 1,
            lineHeight: 1.3,
          }}
        >
          {sub.name}
        </Box>
        {hasMicro ? (
          <ChevronDownIcon
            sx={{
              fontSize: 15,
              color: accent.color,
              opacity: 0.7,
              flexShrink: 0,
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        ) : (
          <ChevronIcon sx={{ fontSize: 13, opacity: 0.3, flexShrink: 0 }} />
        )}
      </Box>

      {/* Micro-categories */}
      {hasMicro && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2, pb: 0.5 }}>
            {sub.children?.map((micro) => (
              <Box
                key={micro.uid}
                component="a"
                href={`/${micro.url_path}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  py: '4px',
                  px: '8px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 400,
                  color: '#64748b',
                  textDecoration: 'none',
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'all 0.13s',
                  '&:hover': { color: accent.color, bgcolor: accent.bg, pl: '14px' },
                }}
              >
                <Box
                  sx={{
                    width: 4, height: 4,
                    borderRadius: '50%',
                    bgcolor: accent.color,
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                />
                {micro.name}
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  )
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  index,
}: {
  cat: MainCategory
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  const accent = accentForIndex(index)

  const subCount = cat.children?.length ?? 0
  const microCount = cat.children?.reduce((s, sub) => s + (sub.children?.length ?? 0), 0) ?? 0

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? accent.color : '#e8ecf0'}`,
        bgcolor: '#fff',
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? `0 12px 40px ${accent.color}22`
          : '0 1px 4px rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Card Header ── */}
      <Box
        sx={{
          bgcolor: hovered ? accent.color : accent.bg,
          px: '16px',
          py: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          transition: 'background 0.25s',
          borderBottom: `1px solid ${hovered ? 'transparent' : '#f1f5f9'}`,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="a"
            href={`/${cat.url_path}`}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: hovered ? '#fff' : '#0f172a',
              lineHeight: 1.3,
              textDecoration: 'none',
              display: 'block',
              transition: 'color 0.25s',
            }}
          >
            {cat.name}
          </Typography>

          {/* Stats row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.8 }}>
            {subCount > 0 && (
              <Box sx={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: hovered ? 'rgba(255,255,255,0.8)' : accent.color,
                display: 'flex', alignItems: 'center', gap: 0.3,
                fontFamily: '"DM Sans", sans-serif',
                transition: 'color 0.25s',
              }}>
                {subCount} sub-categories
              </Box>
            )}
            {microCount > 0 && (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: hovered ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} />
                <Box sx={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  color: hovered ? 'rgba(255,255,255,0.65)' : '#94a3b8',
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'color 0.25s',
                }}>
                  {microCount} products types
                </Box>
              </>
            )}
          </Box>
        </Box>

        <ChevronIcon sx={{
          fontSize: 18,
          color: hovered ? '#fff' : accent.color,
          opacity: hovered ? 1 : 0.5,
          transition: 'all 0.25s',
          transform: hovered ? 'translateX(3px)' : 'none',
          flexShrink: 0,
          mt: 0.2,
        }} />
      </Box>

      {/* ── Sub-category list ── */}
      <Box sx={{ p: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {cat.children && cat.children.length > 0 ? (
          cat.children.map((sub) => (
            <SubCategoryRow key={sub.uid} sub={sub} accent={accent} />
          ))
        ) : (
          <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#cbd5e1', fontSize: '0.75rem', fontFamily: '"DM Sans", sans-serif',
            py: 3,
          }}>
            No sub-categories yet
          </Box>
        )}
      </Box>

      {/* ── Footer CTA ── */}
      <Box
        component="a"
        href={`/${cat.url_path}`}
        sx={{
          mx: 2, mb: 2, mt: 0.5,
          p: '9px 14px',
          borderRadius: '8px',
          bgcolor: hovered ? accent.color : accent.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.22s ease',
          textDecoration: 'none',
          border: `1px solid ${hovered ? 'transparent' : accent.color}22`,
        }}
      >
        <Typography sx={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: hovered ? '#fff' : accent.color,
          fontFamily: '"DM Sans", sans-serif',
          transition: 'color 0.22s',
        }}>
          Browse all in {cat.name.split(' ')[0]}
        </Typography>
        <ChevronIcon sx={{
          fontSize: 15,
          color: hovered ? '#fff' : accent.color,
          transition: 'all 0.22s',
          transform: hovered ? 'translateX(3px)' : 'none',
        }} />
      </Box>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function CategoriesPage({ menu }: LayoutNavigationProps) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // ── Pull categories from the same menu prop LayoutNavigation uses ──
  const allCategories: MainCategory[] =
    (menu?.items?.[0]?.children ?? []).filter(Boolean) as MainCategory[]

  const totalSubcats = allCategories.reduce((s, c) => s + (c.children?.length ?? 0), 0)
  const totalMicro = allCategories.reduce(
    (s, c) => s + (c.children?.reduce((ss, sub) => ss + (sub.children?.length ?? 0), 0) ?? 0),
    0
  )

  const filtered = useMemo(() => {
    let list = allCategories

    // Letter-range filter
    if (activeFilter === 'A–F') list = list.filter((c) => /^[A-F]/i.test(c.name))
    else if (activeFilter === 'G–M') list = list.filter((c) => /^[G-M]/i.test(c.name))
    else if (activeFilter === 'N–Z') list = list.filter((c) => /^[N-Z]/i.test(c.name))

    // Search across main name + sub-category names + micro names
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.children?.some(
            (sub) =>
              sub.name.toLowerCase().includes(q) ||
              sub.children?.some((m) => m.name.toLowerCase().includes(q))
          )
      )
    }

    return list
  }, [activeFilter, search, allCategories])

  return (
    <>
      <PageMeta
        title="All Categories — Wholesale Marketplace"
        metaDescription="Browse all product categories. Connect with verified bulk suppliers across Agriculture, Construction, Electronics, Machinery and more."
      />

      {/* ── PAGE HERO ─────────────────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 58%, #0e527a 100%)`,
        pt: { xs: 4, md: 6 },
        pb: { xs: 4, md: 5 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Glow orbs */}
        {[
          { size: 380, top: -140, right: -60, color: 'rgba(249,115,22,0.13)' },
          { size: 260, bottom: -80, left: 80, color: 'rgba(59,130,246,0.10)' },
        ].map((o, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: o.size, height: o.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            top: o.top, right: o.right, bottom: o.bottom, left: o.left,
            pointerEvents: 'none',
          }} />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Typography component="a" href="/" sx={{
              fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none', fontFamily: '"DM Sans", sans-serif',
              '&:hover': { color: 'rgba(255,255,255,0.75)' },
            }}>
              Home
            </Typography>
            <ChevronIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
            <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.75)', fontFamily: '"DM Sans", sans-serif' }}>
              All Categories
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography component="h1" sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.6rem' },
                color: '#fff',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                mb: 1.2,
              }}>
                Browse{' '}
                <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  All Industries
                </Box>
              </Typography>

              <Typography sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.95rem',
                fontFamily: '"DM Sans", sans-serif',
                lineHeight: 1.6,
                maxWidth: 460,
                mb: 2.5,
              }}>
                {allCategories.length} categories · {totalSubcats}+ sub-categories · {totalMicro}+ product types
              </Typography>

              {/* Search */}
              <Box sx={{
                display: 'flex',
                bgcolor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,.22)',
                maxWidth: 500,
              }}>
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search categories, sub-categories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    flex: 1,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.9rem',
                    '& input': { py: 1.5 },
                  }}
                />
                {search && (
                  <Box component="button" onClick={() => setSearch('')} sx={{
                    px: 2, bgcolor: 'transparent', border: 'none',
                    color: '#9ca3af', cursor: 'pointer', fontSize: '0.78rem',
                    fontFamily: '"DM Sans", sans-serif',
                    '&:hover': { color: '#374151' },
                  }}>
                    ✕
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Stat cards */}
            <Grid item xs={12} md={5}>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Total Categories', value: allCategories.length, accent: '#fbbf24' },
                  { label: 'Sub-Categories', value: `${totalSubcats}+`, accent: '#34d399' },
                  { label: 'Product Types', value: `${totalMicro}+`, accent: '#60a5fa' },
                  { label: 'Top Categories', value: '15', accent: '#f97316' },
                ].map((s) => (
                  <Grid item xs={6} key={s.label}>
                    <Box sx={{
                      p: '16px 18px',
                      borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                    }}>
                      <Typography sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 800,
                        fontSize: '1.55rem',
                        color: s.accent,
                        lineHeight: 1, mb: 0.4,
                      }}>
                        {s.value}
                      </Typography>
                      <Typography sx={{
                        fontSize: '0.73rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: '"DM Sans", sans-serif',
                      }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TRUST BAR ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: ORANGE, py: 1.1 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 5 }, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              '✅ KYC-Verified Suppliers',
              '💬 Bulk Quotes in 24hrs',
              '🏆 Quality-Assured Products',
              '🚚 End-to-End Logistics',
            ].map((t) => (
              <Typography key={t} sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600, color: '#fff',
                fontSize: { xs: '0.74rem', md: '0.84rem' },
                whiteSpace: 'nowrap',
              }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '60vh', py: { xs: 3.5, md: 5 } }}>
        <Container maxWidth="lg">

          {/* Filter tabs + result count */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 2, mb: 3,
          }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {FILTER_TABS.map((tab) => {
                const active = activeFilter === tab
                return (
                  <Chip
                    key={tab}
                    label={tab}
                    onClick={() => setActiveFilter(tab)}
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.8rem',
                      height: 34,
                      bgcolor: active ? BRAND : '#fff',
                      color: active ? '#fff' : '#475569',
                      border: `1.5px solid ${active ? BRAND : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      '&:hover': {
                        bgcolor: active ? BRAND_DARK : '#f1f5f9',
                        borderColor: active ? BRAND_DARK : '#cbd5e1',
                      },
                    }}
                  />
                )
              })}
            </Box>

            <Typography sx={{
              fontSize: '0.8rem', color: '#64748b',
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
              {search ? ` for "${search}"` : ''}
            </Typography>
          </Box>

          {/* ── Category grid ── */}
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ fontSize: '2.8rem', mb: 2 }}>🔍</Typography>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700, fontSize: '1.15rem',
                color: '#334155', mb: 1,
              }}>
                No categories found
              </Typography>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                color: '#94a3b8', fontSize: '0.88rem', mb: 3,
              }}>
                Try a different search term or clear your filters
              </Typography>
              <Box component="button"
                onClick={() => { setSearch(''); setActiveFilter('All') }}
                sx={{
                  px: 3, py: '10px',
                  bgcolor: BRAND, color: '#fff', border: 'none',
                  borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem',
                  fontFamily: '"DM Sans", sans-serif',
                  '&:hover': { bgcolor: BRAND_DARK },
                }}
              >
                Clear all filters
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filtered.map((cat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.uid}>
                  <CategoryCard cat={cat} index={allCategories.indexOf(cat)} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* ── Post-requirement CTA ── */}
          <Box sx={{
            mt: 6,
            p: { xs: '24px', md: '32px 40px' },
            borderRadius: '20px',
            background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute', top: -60, right: -60,
              width: 240, height: 240, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '1.15rem', md: '1.45rem' },
                color: '#fff', mb: 0.5,
                letterSpacing: '-0.01em',
              }}>
                Can't find your category?
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.58)',
                fontSize: '0.88rem',
                fontFamily: '"DM Sans", sans-serif',
              }}>
                Post a buying requirement — get quotes from 500+ verified suppliers within 24 hours
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex', gap: 1.5, flexWrap: 'wrap',
              position: 'relative', zIndex: 1,
            }}>
              <Box
                component="a"
                href="/cart" sx={{
                  textDecoration: 'none',
                  px: 3, py: '11px',
                  background: 'linear-gradient(90deg, #f97316, #ea580c)',
                  color: '#fff', border: 'none',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                  whiteSpace: 'nowrap',
                  '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
                }}>
                📋 Post a Requirement
              </Box>
              <Box component="a" href="/account/sellersignup" sx={{
                px: 3, py: '11px',
                textDecoration: 'none',
                bgcolor: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.06)' },
              }}>
                Register Free →
              </Box>
            </Box>
          </Box>

        </Container>
      </Box>
    </>
  )
}

CategoriesPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default CategoriesPage

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