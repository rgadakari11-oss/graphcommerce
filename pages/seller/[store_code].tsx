// pages/seller/[store_code].tsx
// ─────────────────────────────────────────────────────────────────────────────
// Design: Dark premium B2B — Syne + Manrope fonts
// Palette: Ink #0a0f1e · Accent #1a4dff · Gold #e8a020 · Emerald #0fa96b
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/client'
import {
  Box, Container, Grid, Typography, Button, Chip, Avatar,
  Divider, TextField, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemText, CircularProgress, FormHelperText,
  Snackbar, Alert,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import BadgeIcon from '@mui/icons-material/Badge'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import { VendorStoresDocument } from '../../graphql/vendorstore.gql'
import { SellerProductsDocument } from '../../graphql/sellerProducts.gql'
import { SellerReviewsDocument, AddSellerReviewDocument } from '../../graphql/seller/Sellerreviews.gql'

// ─────────────────────────────────────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  ink: '#0a0f1e',
  ink2: '#1c2540',
  ink3: '#2e3a5c',
  muted: '#6b7694',
  muted2: '#9aa3be',
  surface: '#f5f6fa',
  surface2: '#eceef5',
  border: 'rgba(30,45,100,0.10)',
  border2: 'rgba(30,45,100,0.17)',
  accent: '#1a4dff',
  accent2: '#0033cc',
  gold: '#e8a020',
  gold2: '#c47d00',
  emerald: '#0fa96b',
  emerald2: '#097a4d',
  white: '#ffffff',
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'Manrope', sans-serif",
}

const NAV_ITEMS = ['Overview', 'Products', 'Reviews', 'Contact']

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_RE = /^[6-9]\d{9}$/

// ─────────────────────────────────────────────────────────────────────────────
// BADGE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
interface BadgeDef { label: string; Icon: React.ElementType }
const BADGE_MAP: Record<string, BadgeDef> = {
  gst_number: { label: 'GST Verified', Icon: VerifiedUserIcon },
  trust_seal: { label: 'Trusted', Icon: VerifiedUserIcon },
  secure_badge: { label: 'Secure', Icon: VerifiedUserIcon },
  buyer_protected_badge: { label: 'Buyer Protected', Icon: VerifiedUserIcon },
  on_time_delivery_badge: { label: 'On-Time Delivery', Icon: VerifiedUserIcon },
  star_supplier_badge: { label: 'Star Supplier', Icon: VerifiedUserIcon },
}

function getActiveBadges(store: any): BadgeDef[] {
  return Object.entries(BADGE_MAP)
    .filter(([key]) => {
      const val = store?.[key]
      return val !== null && val !== undefined && val !== false && val !== ''
    })
    .map(([, def]) => def)
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SX HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const sxCard = {
  bgcolor: T.white,
  border: `1px solid ${T.border}`,
  borderRadius: '20px',
  overflow: 'hidden',
  mb: 3,
}

const sxCardHeader = {
  px: { xs: 2, md: 3.5 },
  py: 2.5,
  borderBottom: `1px solid ${T.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
}

const sxCardBody = { px: { xs: 2, md: 3.5 }, py: 3 }

const sxCardIcon = (bg: string, color: string) => ({
  width: 36, height: 36, borderRadius: '10px',
  bgcolor: bg, display: 'flex', alignItems: 'center',
  justifyContent: 'center', color, flexShrink: 0,
})

const sxCardTitle = {
  fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem',
  color: T.ink, letterSpacing: '-0.01em',
}

const sxBtn = (bg: string, color: string, hoverBg: string) => ({
  fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none' as const,
  bgcolor: bg, color, borderRadius: '11px', boxShadow: 'none',
  '&:hover': { bgcolor: hoverBg, boxShadow: 'none', transform: 'translateY(-1px)' },
  transition: 'all 0.18s',
})

const sxInput = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontFamily: T.fontBody,
    '& fieldset': { borderColor: T.border2 },
    '&:hover fieldset': { borderColor: T.accent },
    '&.Mui-focused fieldset': { borderColor: T.accent },
  },
  '& .MuiInputLabel-root': { fontFamily: T.fontBody },
  '& .MuiFormHelperText-root': { fontFamily: T.fontBody },
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: useSellerReviews — fetch + derive stats for a sellerId
// ─────────────────────────────────────────────────────────────────────────────
function useSellerReviews(sellerId?: number) {
  const { data, loading, error, refetch } = useQuery(SellerReviewsDocument, {
    variables: { seller_id: sellerId! },
    skip: !sellerId,
  })

  const reviews: any[] = data?.sellerReviews ?? []

  const stats = useMemo(() => {
    if (!reviews.length)
      return { averageRating: 0, totalReviews: 0, ratingDistribution: [0, 0, 0, 0, 0] }

    const total = reviews.length
    const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / total
    const dist = [5, 4, 3, 2, 1].map(
      (star) => (reviews.filter((r: any) => r.rating === star).length / total) * 100,
    )
    return { averageRating: avg, totalReviews: total, ratingDistribution: dist }
  }, [reviews])

  return { reviews, loading, error, refetch, ...stats }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: star row
// ─────────────────────────────────────────────────────────────────────────────
function StarRow({ value, size = 13, color }: { value: number; size?: number; color?: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} sx={{ fontSize: size, color: s <= Math.round(value) ? (color ?? T.gold) : T.border2 }} />
      ))}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: format relative date
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 60) return '1 month ago'
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    const y = Math.floor(diffDays / 365)
    return `${y} year${y > 1 ? 's' : ''} ago`
  } catch { return dateStr }
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TOPBAR / HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SellerHeader({
  storeName, logoUrl, city, state, gstNumber, rating, trustSeal,
  phone, activeSection, onNavClick,
}: {
  storeName: string; logoUrl?: string; city?: string; state?: string
  gstNumber?: string; rating: number; trustSeal?: boolean
  phone?: string; activeSection: number; onNavClick: (i: number) => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const abbr = storeName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SL'

  const handleNav = (i: number) => { setMobileOpen(false); onNavClick(i) }

  return (
    <>
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: T.ink, boxShadow: '0 2px 24px rgba(0,0,0,0.25)' }}>
        <Box sx={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, minHeight: { xs: 60, md: 72 } }}>

              {/* Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: { xs: 2, md: 4 }, mr: { xs: 0, md: 2 }, borderRight: { xs: 'none', md: `1px solid rgba(255,255,255,0.08)` }, minWidth: 0 }}>
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar src={logoUrl || undefined} sx={{ width: { xs: 38, md: 46 }, height: { xs: 38, md: 46 }, borderRadius: '10px', background: `linear-gradient(135deg, ${T.accent} 0%, #7c3aed 100%)`, fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1rem', color: T.white }}>
                    {!logoUrl && abbr}
                  </Avatar>
                  {trustSeal && (
                    <Box sx={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, bgcolor: T.emerald, borderRadius: '50%', border: `2px solid ${T.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircleIcon sx={{ fontSize: 8, color: T.white }} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: { xs: '0.85rem', md: '0.95rem' }, color: T.white, lineHeight: 1.2, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 160, sm: 220, md: 'none' } }}>
                    {storeName}
                  </Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
                    {(city || state) && (
                      <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                        {[city, state].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                    {gstNumber && (
                      <>
                        <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: T.fontBody, fontWeight: 600 }}>GST Verified</Typography>
                      </>
                    )}
                    {rating > 0 && (
                      <>
                        <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <StarIcon sx={{ fontSize: 10, color: T.gold }} />
                          <Typography sx={{ fontSize: '0.68rem', color: T.white, fontFamily: T.fontBody, fontWeight: 700 }}>
                            {rating > 0 ? rating.toFixed(1) : '—'}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Desktop Nav */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', flex: 1 }}>
                {NAV_ITEMS.map((label, i) => (
                  <Box key={label} onClick={() => handleNav(i)} sx={{ px: 2.5, display: 'flex', alignItems: 'center', fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.75rem', color: activeSection === i ? T.white : 'rgba(255,255,255,0.4)', cursor: 'pointer', position: 'relative', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.2s', '&:hover': { color: 'rgba(255,255,255,0.8)' }, '&::after': activeSection === i ? { content: '""', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, bgcolor: T.accent, borderRadius: '2px 2px 0 0' } : {} }}>
                    {label}
                  </Box>
                ))}
              </Box>

              {/* Desktop Actions */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 'auto', py: 1.5 }}>
                {phone && (
                  <Button variant="outlined" size="small" startIcon={<PhoneIcon sx={{ fontSize: '13px !important' }} />} href={`tel:${phone}`} sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.75rem', textTransform: 'none', borderRadius: '9px', px: 2, height: 34, borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: T.accent, color: T.white, bgcolor: 'rgba(26,77,255,0.15)' } }}>
                    Call Now
                  </Button>
                )}
                <Button variant="contained" size="small" startIcon={<SendOutlinedIcon sx={{ fontSize: '13px !important' }} />} onClick={() => handleNav(3)} sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.75rem', textTransform: 'none', borderRadius: '9px', px: 2.5, height: 34, bgcolor: T.accent, boxShadow: 'none', '&:hover': { bgcolor: T.accent2, boxShadow: 'none' } }}>
                  Send Inquiry
                </Button>
              </Box>

              {/* Mobile Actions */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.75, ml: 'auto' }}>
                {phone && (
                  <IconButton href={`tel:${phone}`} size="small" sx={{ color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '9px', width: 36, height: 36 }}>
                    <PhoneIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                )}
                <Button size="small" onClick={() => handleNav(3)} sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.72rem', textTransform: 'none', borderRadius: '9px', px: 1.5, height: 34, bgcolor: T.accent, color: T.white, boxShadow: 'none', '&:hover': { bgcolor: T.accent2 }, display: { xs: 'none', sm: 'flex' } }}>
                  Inquiry
                </Button>
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5 }}>
                  <MenuIcon />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Mobile tab strip */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, overflowX: 'auto', borderTop: `1px solid rgba(255,255,255,0.06)`, '&::-webkit-scrollbar': { display: 'none' } }}>
          {NAV_ITEMS.map((label, i) => (
            <Box key={label} onClick={() => handleNav(i)} sx={{ px: 2.5, py: 1.2, flexShrink: 0, fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.72rem', color: activeSection === i ? T.white : 'rgba(255,255,255,0.4)', cursor: 'pointer', position: 'relative', textTransform: 'uppercase', letterSpacing: '0.05em', '&::after': activeSection === i ? { content: '""', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, bgcolor: T.accent, borderRadius: '2px 2px 0 0' } : {} }}>
              {label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 260, bgcolor: T.ink, color: T.white } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.9rem', color: T.white }}>Menu</Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>
        <List disablePadding>
          {NAV_ITEMS.map((label, i) => (
            <ListItem key={label} disablePadding>
              <ListItemButton onClick={() => handleNav(i)} sx={{ px: 2.5, py: 1.6, borderBottom: `1px solid rgba(255,255,255,0.05)`, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <ListItemText primary={label} primaryTypographyProps={{ fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.9rem', color: activeSection === i ? T.white : 'rgba(255,255,255,0.55)' }} />
                {activeSection === i && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.accent }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2.5, mt: 'auto', borderTop: `1px solid rgba(255,255,255,0.07)` }}>
          {phone && (
            <Button fullWidth href={`tel:${phone}`} startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />} sx={{ ...sxBtn('rgba(26,77,255,0.12)', '#7aabff', 'rgba(26,77,255,0.2)'), border: `1px solid rgba(26,77,255,0.3)`, py: 1.2, mb: 1, fontSize: '0.85rem' }}>
              Call Now
            </Button>
          )}
          <Button fullWidth onClick={() => handleNav(3)} startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />} sx={{ ...sxBtn(T.accent, T.white, T.accent2), py: 1.2, fontSize: '0.85rem' }}>
            Send Inquiry
          </Button>
        </Box>
      </Drawer>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO  — rating prop now comes from live data
// ─────────────────────────────────────────────────────────────────────────────
function SellerHero({ store, rating, onInquiry }: { store: any; rating: number; onInquiry: () => void }) {
  const badges = getActiveBadges(store)
  const storeName: string = store?.store_name || ''
  const phone: string = store?.whatsapp_number || store?.phone || ''

  return (
    <Box sx={{ bgcolor: T.ink, position: 'relative', overflow: 'hidden', pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 } }}>
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 50%, rgba(26,77,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.10) 0%, transparent 50%)' }} />
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">

          {/* Left */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.75, bgcolor: 'rgba(26,77,255,0.15)', border: `1px solid rgba(26,77,255,0.35)`, borderRadius: '100px', mb: 2.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4d8fff', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: '#7aabff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Verified Supplier
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' }, color: T.white, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2 }}>
              {storeName.split(' ').length > 1 ? (
                <>
                  {storeName.split(' ').slice(0, -1).join(' ')}{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #4d8fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {storeName.split(' ').slice(-1)[0]}
                  </Box>
                </>
              ) : (
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #4d8fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {storeName}
                </Box>
              )}
            </Typography>

            <Typography sx={{ fontFamily: T.fontBody, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'rgba(255,255,255,0.5)', maxWidth: 500, lineHeight: 1.75, mb: 3.5 }}>
              Trusted supplier delivering quality products at competitive prices. Get the best deals with reliable service and fast response.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: badges.length > 0 ? 3.5 : 0 }}>
              <Button variant="contained" onClick={onInquiry} startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{ ...sxBtn(T.accent, T.white, T.accent2), px: { xs: 2.5, md: 3.5 }, py: { xs: 1.2, md: 1.4 }, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(26,77,255,0.35)' }}>
                Get Best Price
              </Button>
              {phone && (
                <Button variant="outlined" href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{ fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)', borderRadius: '11px', px: { xs: 2, md: 3 }, py: { xs: 1.2, md: 1.4 }, fontSize: '0.9rem', '&:hover': { borderColor: '#25d366', color: '#25d366', bgcolor: 'rgba(37,211,102,0.08)' } }}>
                  WhatsApp
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right — live rating card */}
          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '20px', overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', mb: 1 }}>
                  Overall Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '3rem', color: T.white, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {rating > 0 ? rating.toFixed(1) : '—'}
                  </Typography>
                  <StarRow value={rating} size={14} />
                </Box>
              </Box>

              {badges.length > 0 && (
                <Box sx={{ px: 3, py: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {badges.map(({ label, Icon }) => (
                    <Box key={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.25, py: 0.6, bgcolor: 'rgba(15,169,107,0.12)', border: `1px solid rgba(15,169,107,0.25)`, borderRadius: '8px' }}>
                      <Icon sx={{ fontSize: 13, color: T.emerald }} />
                      <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.02em' }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: STATS — Client Rating driven by live data
// ─────────────────────────────────────────────────────────────────────────────
function SellerStats({ store, rating }: { store: any; rating: number }) {
  const gstNumber: string = store?.gst_number || ''
  const years: number = store?.years_in_business || 0
  const projects: string = store?.completed_projects || ''

  const stats = [
    { value: years ? `${years}+` : '—', label: 'Years in Business', bg: '#eef2ff', color: T.accent, Icon: AccessTimeIcon },
    { value: rating > 0 ? rating.toFixed(1) : '—', label: 'Client Rating', bg: '#fef8ee', color: T.gold2, Icon: StarIcon },
    { value: projects || '—', label: 'Completed Projects', bg: '#edfaf5', color: T.emerald2, Icon: ReceiptLongIcon },
    { value: gstNumber ? gstNumber.slice(0, 6) + '…' : '—', label: 'GST Number', bg: '#f5f3ff', color: '#7c3aed', Icon: BadgeIcon },
  ]

  return (
    <Box sx={{ ...sxCard, mb: 3 }}>
      <Grid container sx={{ py: 1 }}>
        {stats.map(({ value, label, bg, color, Icon }, i) => (
          <Grid item xs={6} md={3} key={label}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: { xs: 2, md: 2.5 }, px: { xs: 1.5, md: 2 }, borderRight: i < 3 ? { xs: i % 2 === 0 ? `1px solid ${T.border}` : 'none', md: `1px solid ${T.border}` } : 'none', borderBottom: i < 2 ? { xs: `1px solid ${T.border}`, md: 'none' } : 'none' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.2, color }}>
                <Icon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.7rem' }, color, lineHeight: 1, letterSpacing: '-0.04em', mb: 0.4 }}>
                {value}
              </Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 600, color: T.muted, letterSpacing: '0.01em', lineHeight: 1.3 }}>
                {label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: ABOUT
// ─────────────────────────────────────────────────────────────────────────────
function SellerAbout({ store }: { store: any }) {
  const [expanded, setExpanded] = useState(false)
  const aboutUs: string = store?.about_us || ''

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#eef2ff', T.accent)}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>About Us</Typography>
      </Box>
      <Box sx={sxCardBody}>
        {aboutUs ? (
          <>
            <Box sx={{ maxHeight: expanded ? 'none' : '130px', overflow: 'hidden', position: 'relative', '&::after': !expanded ? { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: `linear-gradient(to top, ${T.white}, transparent)` } : {} }}>
              <Typography component="div" sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted, lineHeight: 1.85, '& p': { mb: 1.5 } }} dangerouslySetInnerHTML={{ __html: aboutUs }} />
            </Box>
            <Button size="small" onClick={() => setExpanded(!expanded)} sx={{ mt: 1, fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', color: T.accent, fontSize: '0.82rem', px: 0, '&:hover': { bgcolor: 'transparent', color: T.accent2 } }}>
              {expanded ? 'Show Less ↑' : 'Read More ↓'}
            </Button>
          </>
        ) : (
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted2, fontStyle: 'italic' }}>
            No description available for this seller yet.
          </Typography>
        )}

        <Grid container spacing={1.5} sx={{ mt: 2.5 }}>
          {[{ label: 'City', value: store?.city }, { label: 'State', value: store?.state }, { label: 'Pincode', value: store?.pincode }]
            .filter(f => f.value).map(({ label, value }) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', p: 1.5 }}>
                  <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, color: T.muted2, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.4 }}>{label}</Typography>
                  <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.83rem', fontWeight: 700, color: T.ink2 }}>{value}</Typography>
                </Box>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
function SellerProducts({ products }: { products: any[] }) {
  const [search, setSearch] = useState('')
  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#fef8ee', T.gold2)}><InventoryIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Products &amp; Services</Typography>
        <Chip label={`${products.length} items`} size="small" sx={{ ml: 'auto', bgcolor: T.surface, color: T.muted, fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
      </Box>
      <Box sx={sxCardBody}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2, py: 1.3, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', mb: 2.5 }}>
          <SearchIcon sx={{ fontSize: 16, color: T.muted2 }} />
          <Box component="input" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Search products and services…" sx={{ flex: 1, border: 'none', background: 'transparent', fontFamily: T.fontBody, fontSize: '0.86rem', color: T.ink, outline: 'none', '&::placeholder': { color: T.muted2 } }} />
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted2 }}>No products found</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((product) => {
              const price = product?.price_range?.minimum_price?.regular_price?.value
              const category = product?.categories?.[0]?.name || 'Product'
              return (
                <Grid item xs={12} sm={6} md={4} key={product.uid}>
                  <Box sx={{ border: `1.5px solid ${T.border}`, borderRadius: '14px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.22s', '&:hover': { borderColor: T.accent, boxShadow: '0 8px 28px rgba(26,77,255,0.10)', transform: 'translateY(-2px)' } }}>
                    <Box sx={{ aspectRatio: '4/3', bgcolor: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: `1px solid ${T.border}` }}>
                      {product?.small_image?.url ? (
                        <Box component="img" src={product.small_image.url} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 24, color: T.muted2 }} />
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', top: 10, left: 10, px: 1, py: 0.4, bgcolor: T.ink, borderRadius: '6px', fontFamily: T.fontBody, fontSize: '0.6rem', fontWeight: 700, color: T.white, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {category}
                      </Box>
                    </Box>
                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography component="a" href={`/${product.url_key}.html`} sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.85rem', color: T.ink, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textDecoration: 'none', mb: 1.2, minHeight: '2.4em', '&:hover': { color: T.accent } }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: `1px solid ${T.border}`, mt: 'auto' }}>
                        {price ? (
                          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, color: T.ink, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.75rem', color: T.muted2, fontStyle: 'italic' }}>Price on request</Typography>
                        )}
                        <Button variant="outlined" size="small" component="a" href={`/${product.url_key}.html`} endIcon={<OpenInNewIcon sx={{ fontSize: '10px !important' }} />}
                          sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.7rem', textTransform: 'none', borderRadius: '8px', px: 1.25, height: 28, borderColor: T.border2, color: T.accent, '&:hover': { borderColor: T.accent, bgcolor: 'rgba(26,77,255,0.05)' } }}>
                          View
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REVIEWS — fully dynamic, per-field validation
// ─────────────────────────────────────────────────────────────────────────────
function SellerReviewsSection({
  sellerId,
  averageRating,
  totalReviews,
  ratingDistribution,
  reviews,
  reviewsLoading,
  reviewsError,
  refetchReviews,
}: {
  sellerId: number
  averageRating: number
  totalReviews: number
  ratingDistribution: number[]
  reviews: any[]
  reviewsLoading: boolean
  reviewsError: any
  refetchReviews: () => void
}) {
  const [addSellerReview, { loading: submitting }] = useMutation(AddSellerReviewDocument)

  // form state
  const [userRating, setUserRating] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userMobile, setUserMobile] = useState('')
  const [userCompany, setUserCompany] = useState('')
  const [userComment, setUserComment] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({})

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>
    ({ open: false, message: '', severity: 'success' })

  // ── validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!userRating) e.userRating = 'Please select a star rating.'
    if (!userName.trim()) e.userName = 'Name is required.'
    else if (userName.trim().length < 2) e.userName = 'Name must be at least 2 characters.'
    if (!userMobile.trim()) e.userMobile = 'Mobile number is required.'
    else if (!MOBILE_RE.test(userMobile.trim())) e.userMobile = 'Enter a valid 10-digit mobile number (starts with 6–9).'
    if (!userComment.trim()) e.userComment = 'Review text is required.'
    else if (userComment.trim().length < 10) e.userComment = 'Review must be at least 10 characters.'
    return e
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    setFormErrors(validate())
  }

  const resetForm = () => {
    setUserRating(null); setUserName(''); setUserEmail(''); setUserMobile('')
    setUserCompany(''); setUserComment(''); setTouched({}); setFormErrors({})
  }

  const handleSubmit = async () => {
    const allTouched = { userRating: true, userName: true, userMobile: true, userComment: true }
    setTouched(allTouched)
    const errs = validate()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      const { data: mutData } = await addSellerReview({
        variables: { seller_id: sellerId, customer_name: userName.trim(), customer_email: userEmail.trim(), customer_mobile: userMobile.trim(), company_name: userCompany.trim() || undefined, rating: userRating!, review: userComment.trim() },
      })
      if (mutData?.addSellerReview?.success) {
        setSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' })
        resetForm()
        refetchReviews()
      } else {
        setSnackbar({ open: true, message: mutData?.addSellerReview?.message ?? 'Something went wrong.', severity: 'error' })
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit review. Please try again.', severity: 'error' })
    }
  }

  const distColors = ['#0fa96b', '#0fa96b', '#f59e0b', '#ef4444', '#ef4444']

  return (
    <>
      <Box sx={sxCard}>
        <Box sx={sxCardHeader}>
          <Box sx={sxCardIcon('#fef8ee', T.gold2)}><ReviewsOutlinedIcon sx={{ fontSize: 16 }} /></Box>
          <Typography sx={sxCardTitle}>Customer Reviews</Typography>

        </Box>

        <Box sx={sxCardBody}>
          {/* ── Loading / Error ── */}
          {reviewsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {reviewsError && !reviewsLoading && (
            <Alert severity="error" sx={{ mb: 2 }}>Failed to load reviews. Please refresh the page.</Alert>
          )}

          {!reviewsLoading && !reviewsError && (
            <>
              {/* ── Rating summary dark card ── */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, bgcolor: T.ink, borderRadius: '14px', p: { xs: 2, md: 2.5 }, mb: 3 }}>
                <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: { xs: '2.8rem', md: '3.5rem' }, color: T.white, lineHeight: 1, letterSpacing: '-0.05em' }}>
                    {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', my: 0.8 }}>
                    {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 13, color: s <= Math.round(averageRating) ? T.gold : 'rgba(255,255,255,0.15)' }} />)}
                  </Box>

                </Box>
                <Box sx={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8, '&:last-child': { mb: 0 } }}>
                      <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 10 }}>{star}</Typography>
                      <Box sx={{ flex: 1, height: 5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${ratingDistribution[idx]}%`, bgcolor: distColors[idx], borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </Box>
                      <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', width: 26, textAlign: 'right' }}>
                        {Math.round(ratingDistribution[idx])}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── Write review form ── */}
              <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 2.5, mb: 3 }}>
                <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.9rem', color: T.ink, mb: 1.75 }}>Write a Review</Typography>

                {/* Star picker */}
                <Box sx={{ mb: 1.75 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Box key={s} onClick={() => {
                        setUserRating(s)
                        if (touched.userRating) setFormErrors(prev => ({ ...prev, userRating: undefined }))
                      }}
                        onMouseEnter={() => { }} sx={{ cursor: 'pointer' }}>
                        <StarIcon sx={{ fontSize: 28, color: userRating !== null && s <= userRating ? T.gold : T.border2, transition: 'color 0.15s', '&:hover': { color: T.gold } }} />
                      </Box>
                    ))}
                  </Box>
                  {touched.userRating && formErrors.userRating && (
                    <FormHelperText error sx={{ fontFamily: T.fontBody, mt: 0.5, ml: 0 }}>
                      {formErrors.userRating}
                    </FormHelperText>
                  )}
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  {/* Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Your Name *" value={userName}
                      onChange={e => { setUserName(e.target.value); if (touched.userName) setFormErrors(prev => ({ ...prev, userName: !e.target.value.trim() ? 'Name is required.' : e.target.value.trim().length < 2 ? 'Name must be at least 2 characters.' : undefined })) }}
                      onBlur={() => handleBlur('userName')}
                      error={touched.userName && !!formErrors.userName}
                      helperText={touched.userName && formErrors.userName ? formErrors.userName : ' '}
                      sx={sxInput} />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Email Address " type="email" value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      onBlur={() => handleBlur('userEmail')}
                      sx={sxInput} />
                  </Grid>

                  {/* Mobile */}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Mobile Number *" type="tel" value={userMobile}
                      inputProps={{ maxLength: 10 }}
                      onChange={e => { const val = e.target.value.replace(/\D/g, ''); setUserMobile(val); if (touched.userMobile) setFormErrors(prev => ({ ...prev, userMobile: !val ? 'Mobile number is required.' : !MOBILE_RE.test(val) ? 'Enter a valid 10-digit mobile number (starts with 6–9).' : undefined })) }}
                      onBlur={() => handleBlur('userMobile')}
                      error={touched.userMobile && !!formErrors.userMobile}
                      helperText={touched.userMobile && formErrors.userMobile ? formErrors.userMobile : ' '}
                      sx={sxInput} />
                  </Grid>

                  {/* Company (optional) */}
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Company Name" value={userCompany}
                      onChange={e => setUserCompany(e.target.value)}
                      helperText=" "
                      sx={sxInput} />
                  </Grid>
                </Grid>

                {/* Review text */}
                <TextField fullWidth multiline rows={3} size="small"
                  placeholder="Share your experience with this seller… *"
                  value={userComment}
                  onChange={e => { setUserComment(e.target.value); if (touched.userComment) setFormErrors(prev => ({ ...prev, userComment: !e.target.value.trim() ? 'Review text is required.' : e.target.value.trim().length < 10 ? 'Review must be at least 10 characters.' : undefined })) }}
                  onBlur={() => handleBlur('userComment')}
                  error={touched.userComment && !!formErrors.userComment}
                  helperText={touched.userComment && formErrors.userComment ? formErrors.userComment : `${userComment.trim().length} / min 10 characters`}
                  sx={{ ...sxInput, mb: 1.5 }} />

                <Button variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={handleSubmit}
                  sx={{ ...sxBtn(T.ink, T.white, T.ink2), px: 3, py: 1.1, fontSize: '0.85rem' }}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </Button>
              </Box>

              {/* ── Review cards ── */}
              {reviews.length > 0 && (
                <>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2 }}>
                    Customer Feedback
                  </Typography>
                  <Grid container spacing={2}>
                    {reviews.map((r: any) => (
                      <Grid item xs={12} md={4} key={r.id}>
                        <Box sx={{ p: 2.5, border: `1.5px solid ${T.border}`, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { borderColor: T.border2, boxShadow: '0 6px 20px rgba(10,15,30,0.07)', transform: 'translateY(-2px)' } }}>
                          <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', lineHeight: 1, color: T.border2, mb: 0.5, mt: '-6px' }}>"</Typography>
                          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.83rem', color: T.muted, lineHeight: 1.75, flex: 1, mb: 2 }}>
                            {r.review}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.3, mb: 1.5 }}>
                            {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 12, color: s <= r.rating ? T.gold : T.border2 }} />)}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ width: 34, height: 34, fontSize: '0.72rem', fontWeight: 800, background: 'linear-gradient(135deg,#1a4dff,#7c3aed)', fontFamily: T.fontDisplay, flexShrink: 0 }}>
                              {initials(r.customer_name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.82rem', color: T.ink, lineHeight: 1.2 }}>{r.customer_name}</Typography>
                              {r.company_name && <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: T.muted2 }}>{r.company_name}</Typography>}
                            </Box>
                            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', color: T.muted2, fontWeight: 600 }}>
                              {formatDate(r.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {reviews.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <ReviewsOutlinedIcon sx={{ fontSize: 36, color: T.muted2, mb: 1 }} />
                  <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted2 }}>
                    No reviews yet — be the first to share your experience!
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Snackbar — success / server error only */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%', fontFamily: T.fontBody }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REACH US
// ─────────────────────────────────────────────────────────────────────────────
function SellerReachUs({ store }: { store: any }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter valid 10-digit phone'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSuccess(true)
    setForm({ name: '', phone: '', message: '' })
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#edfaf5', T.emerald2)}><LocationOnOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Reach Us</Typography>
      </Box>
      <Box sx={sxCardBody}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 2.5, mb: 2 }}>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted2, mb: 1.2 }}>Office Address</Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.88rem', color: T.ink2, lineHeight: 1.85, fontWeight: 500 }}>
                {[store?.address, store?.city, store?.state, store?.pincode].filter(Boolean).join(', ')}<br />
                {store?.country || 'India'}
              </Typography>
              {store?.gst_number && (
                <Box sx={{ mt: 1.5, display: 'inline-block', px: 1.25, py: 0.4, bgcolor: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '7px', fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: T.muted }}>
                  GST: {store.gst_number}
                </Box>
              )}
            </Box>
            <Box sx={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${T.border}`, height: 180, bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.82rem', color: T.muted2, fontWeight: 600 }}>Map View</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2.5 }}>Send an Inquiry</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Your Name *" value={form.name} onChange={e => handleChange('name', e.target.value)} error={!!errors.name} helperText={errors.name} sx={sxInput} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Phone Number *" value={form.phone} onChange={e => handleChange('phone', e.target.value)} error={!!errors.phone} helperText={errors.phone} sx={sxInput} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} size="small" label="Message *" value={form.message} onChange={e => handleChange('message', e.target.value)} error={!!errors.message} helperText={errors.message} sx={sxInput} />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={handleSubmit} startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{ ...sxBtn(T.accent, T.white, T.accent2), py: 1.3, fontSize: '0.9rem', boxShadow: '0 6px 20px rgba(26,77,255,0.25)' }}>
                  Submit Inquiry
                </Button>
              </Grid>
              {success && (
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(15,169,107,0.1)', border: '1px solid rgba(15,169,107,0.3)', color: T.emerald, fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.85rem' }}>
                    ✅ Inquiry submitted successfully! We will contact you soon.
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function SellerSidebar({
  store, rating, onInquiry, onOverview, onProducts, onReviews, onContact,
}: {
  store: any; rating: number
  onInquiry: () => void; onOverview: () => void; onProducts: () => void; onReviews: () => void; onContact: () => void
}) {
  const phone: string = store?.phone || ''
  const email: string = store?.email || ''

  return (
    <Box sx={{ position: 'sticky', top: 90 }}>
      {/* Quick Contact */}
      <Box sx={{ bgcolor: T.ink, borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.white, mb: 0.4 }}>Quick Contact</Typography>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store?.store_name}</Typography>
        </Box>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {(store?.city || store?.state) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {[store.city, store.state].filter(Boolean).join(', ')}, India
                </Typography>
              </Box>
            )}
            {/* Live rating in sidebar */}
            {rating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ fontSize: 14, color: T.gold, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {rating.toFixed(1)} / 5.0 Rating
                </Typography>
              </Box>
            )}
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth onClick={onInquiry} startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ ...sxBtn(T.white, T.ink, '#f0f2ff'), py: 1.2, fontSize: '0.85rem' }}>Send Inquiry</Button>
            {phone && (
              <Button fullWidth href={`tel:${phone}`} startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />}
                sx={{ ...sxBtn('rgba(26,77,255,0.1)', '#7aabff', 'rgba(26,77,255,0.18)'), border: `1px solid rgba(26,77,255,0.28)`, py: 1.2, fontSize: '0.85rem' }}>Call Now</Button>
            )}
            {phone && (
              <Button fullWidth href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" startIcon={<WhatsAppIcon sx={{ fontSize: '14px !important' }} />}
                sx={{ ...sxBtn('rgba(37,211,102,0.1)', '#25d366', 'rgba(37,211,102,0.18)'), border: `1px solid rgba(37,211,102,0.22)`, py: 1.2, fontSize: '0.85rem' }}>WhatsApp</Button>
            )}
            {email && (
              <Button fullWidth href={`mailto:${email}`} startIcon={<EmailIcon sx={{ fontSize: '14px !important' }} />}
                sx={{ fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', py: 1.2, fontSize: '0.85rem', borderRadius: '11px', bgcolor: 'transparent', color: 'rgba(255,255,255,0.5)', border: `1px solid rgba(255,255,255,0.09)`, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)' } }}>Email Us</Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Nav links */}
      <Box sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted2 }}>Our Company</Typography>
        </Box>
        {[{ label: 'About Us', fn: onOverview }, { label: 'Products & Services', fn: onProducts }, { label: 'Reviews & Rating', fn: onReviews }, { label: 'Reach Us', fn: onContact }].map(({ label, fn }, i, arr) => (
          <Box key={label} onClick={fn} sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'all 0.15s', '&:hover': { bgcolor: T.surface, '& .lbl': { color: T.accent }, '& .arr': { color: T.accent } } }}>
            <Typography className="lbl" sx={{ fontFamily: T.fontBody, fontSize: '0.85rem', fontWeight: 600, color: T.ink2, transition: 'color 0.15s' }}>{label}</Typography>
            <ChevronRightIcon className="arr" sx={{ fontSize: 16, color: T.muted2, transition: 'color 0.15s' }} />
          </Box>
        ))}
      </Box>

      {/* Certifications */}
      {(store?.gst_number || store?.certifications) && (
        <Box sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted2 }}>Certifications</Typography>
          </Box>
          {store?.gst_number && (
            <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: store?.certifications ? `1px solid ${T.border}` : 'none' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BadgeIcon sx={{ fontSize: 15, color: T.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.8rem', color: T.ink2 }}>GST Certificate</Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.gst_number}</Typography>
              </Box>
              <Box sx={{ px: 0.9, py: 0.25, bgcolor: T.emerald, borderRadius: '5px', fontFamily: T.fontBody, fontSize: '0.58rem', fontWeight: 800, color: T.white, letterSpacing: '0.04em', flexShrink: 0 }}>✓</Box>
            </Box>
          )}
          {store?.certifications && (
            <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <WorkspacePremiumIcon sx={{ fontSize: 15, color: T.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.8rem', color: T.ink2 }}>{store.certifications}</Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', color: T.muted2 }}>Quality Certification</Typography>
              </Box>
              <Box sx={{ px: 0.9, py: 0.25, bgcolor: T.emerald, borderRadius: '5px', fontFamily: T.fontBody, fontSize: '0.58rem', fontWeight: 800, color: T.white, letterSpacing: '0.04em', flexShrink: 0 }}>✓</Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function SellerFooter({ storeName }: { storeName: string }) {
  return (
    <Box component="footer" sx={{ bgcolor: T.ink, borderTop: `1px solid rgba(255,255,255,0.07)` }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box sx={{ py: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, color: T.white, fontSize: '0.95rem' }}>{storeName}</Typography>
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', mt: 0.3 }}>© {new Date().getFullYear()} All rights reserved.</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {['Verified Supplier', 'Secure', 'Trusted Marketplace'].map(label => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.65, bgcolor: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.09)`, borderRadius: '8px' }}>
                <CheckCircleIcon sx={{ fontSize: 11, color: T.emerald }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SellerPage() {
  const router = useRouter()
  const { store_code } = router.query

  const overviewRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const sectionRefs = [overviewRef, productsRef, reviewsRef, contactRef]
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120
      let active = 0
      sectionRefs.forEach((ref, idx) => {
        if (ref.current && ref.current.offsetTop <= scrollY) active = idx
      })
      setActiveSection(active)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (index: number) => {
    const ref = sectionRefs[index]
    if (!ref.current) return
    window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
  }

  // ── Seller data ────────────────────────────────────────────────────────────
  const { data: storeData, loading: storeLoading } = useQuery(VendorStoresDocument, {
    variables: { store_code: String(store_code), status: 1 },
    skip: !store_code,
  })
  const store = storeData?.vendorStores?.[0]

  const { data: productData, loading: productsLoading } = useQuery(SellerProductsDocument, {
    variables: { seller: String(store?.customer_id) },
    skip: !store?.customer_id,
  })
  const products: any[] = productData?.products?.items || []

  // ── Reviews — single source of truth for ALL rating displays ───────────────
  const {
    reviews, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews,
    averageRating, totalReviews, ratingDistribution,
  } = useSellerReviews(store?.customer_id ? Number(store.customer_id) : undefined)

  // ── Loading ────────────────────────────────────────────────────────────────
  if (storeLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.surface }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <InventoryIcon sx={{ color: T.white, fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: T.fontBody, color: T.muted, fontSize: '0.9rem' }}>Loading seller profile…</Typography>
        </Box>
      </Box>
    )
  }

  if (!store) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.surface }}>
        <Box sx={{ textAlign: 'center', maxWidth: 380, px: 3 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 28, color: T.muted2 }} />
          </Box>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.4rem', color: T.ink, mb: 1 }}>Seller Not Found</Typography>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted, lineHeight: 1.7 }}>
            The seller you're looking for doesn't exist or may have been removed.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>{store.store_name} | Marketplace</title>
        <meta name="description" content={`${store.store_name} — Verified Supplier`} />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: T.surface, fontFamily: T.fontBody }}>

        <SellerHeader
          storeName={store.store_name || ''}
          logoUrl={store.logo || ''}
          city={store.city || ''}
          state={store.state || ''}
          gstNumber={store.gst_number || ''}
          rating={averageRating}
          trustSeal={!!store.trust_seal}
          phone={store.phone || ''}
          activeSection={activeSection}
          onNavClick={scrollToSection}
        />

        <SellerHero
          store={store}
          rating={averageRating}
          onInquiry={() => scrollToSection(3)}
        />

        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>

            {/* LEFT */}
            <Grid item xs={12} md={9}>
              <div ref={overviewRef}>
                <SellerStats store={store} rating={averageRating} />
                <SellerAbout store={store} />
              </div>

              <div ref={productsRef}>
                {productsLoading ? (
                  <Box sx={{ ...sxCard, p: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: T.fontBody, color: T.muted }}>Loading products…</Typography>
                  </Box>
                ) : products.length > 0 ? (
                  <SellerProducts products={products} />
                ) : (
                  <Box sx={{ ...sxCard, p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 36, color: T.muted2, mb: 1.5 }} />
                    <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.ink2, mb: 0.5 }}>No Products Listed</Typography>
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.85rem', color: T.muted }}>This seller hasn't listed any products yet.</Typography>
                  </Box>
                )}
              </div>

              <div ref={reviewsRef}>
                <SellerReviewsSection
                  sellerId={Number(store.customer_id)}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                  ratingDistribution={ratingDistribution}
                  reviews={reviews}
                  reviewsLoading={reviewsLoading}
                  reviewsError={reviewsError}
                  refetchReviews={refetchReviews}
                />
              </div>

              <div ref={contactRef}>
                <SellerReachUs store={store} />
              </div>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={12} md={3}>
              <SellerSidebar
                store={store}
                rating={averageRating}
                onInquiry={() => scrollToSection(3)}
                onOverview={() => scrollToSection(0)}
                onProducts={() => scrollToSection(1)}
                onReviews={() => scrollToSection(2)}
                onContact={() => scrollToSection(3)}
              />
            </Grid>

          </Grid>
        </Container>

        <SellerFooter storeName={store.store_name || ''} />
      </Box>
    </>
  )
}