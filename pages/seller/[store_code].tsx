// pages/seller/[store_code].tsx
// ─────────────────────────────────────────────────────────────────────────────
// Design: Dark premium B2B — Syne + Manrope fonts
// Palette: Ink #0a0f1e · Accent #1a4dff · Gold #e8a020 · Emerald #0fa96b
// Add fonts to _document.tsx:
//   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import {
  Box, Container, Grid, Typography, Button, Chip, Avatar,
  Divider, TextField, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText,
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
import DirectionsIcon from '@mui/icons-material/Directions'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import BadgeIcon from '@mui/icons-material/Badge'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ShieldIcon from '@mui/icons-material/Shield'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import GradeIcon from '@mui/icons-material/Grade'

import { VendorStoresDocument } from '../../graphql/vendorstore.gql'
import { SellerProductsDocument } from '../../graphql/sellerProducts.gql'

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
// STATIC REVIEWS (always shown)
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_REVIEWS = [
  { name: 'Robert Karmazov', company: 'TechBridge Solutions', rating: 5, comment: 'Exceptional quality and timely delivery. Their team was highly professional throughout the project lifecycle. Would strongly recommend for B2B procurement.', date: '20 days ago', avatarBg: 'linear-gradient(135deg,#1a4dff,#7c3aed)' },
  { name: 'Nilesh Shah', company: 'Apex Industries', rating: 5, comment: 'Outstanding experience. Their product range is comprehensive and the support team resolved our queries promptly. Excellent after-sales service.', date: '1 month ago', avatarBg: 'linear-gradient(135deg,#0fa96b,#059669)' },
  { name: 'Edna Watson', company: 'Global Trade Co.', rating: 4, comment: 'Very reliable vendor. Products meet our quality standards. Minor delays in one shipment, but communication was transparent throughout.', date: '8 months ago', avatarBg: 'linear-gradient(135deg,#e8a020,#c47d00)' },
]

// ─────────────────────────────────────────────────────────────────────────────
// BADGE CONFIG — maps API field → display label + icon
// ─────────────────────────────────────────────────────────────────────────────
interface BadgeDef { label: string; Icon: React.ElementType }
const BADGE_MAP: Record<string, BadgeDef> = {
  gst_number: { label: 'GST Verified', Icon: VerifiedUserIcon },
  trust_seal: { label: 'TrustSEAL', Icon: VerifiedUserIcon },
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
  bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
})

const sxCardTitle = {
  fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.ink, letterSpacing: '-0.01em',
}

const sxBtn = (bg: string, color: string, hoverBg: string) => ({
  fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none' as const,
  bgcolor: bg, color, borderRadius: '11px', boxShadow: 'none',
  '&:hover': { bgcolor: hoverBg, boxShadow: 'none', transform: 'translateY(-1px)' },
  transition: 'all 0.18s',
})

const sxInput = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: T.fontBody,
    '& fieldset': { borderColor: T.border2 },
    '&:hover fieldset': { borderColor: T.accent },
    '&.Mui-focused fieldset': { borderColor: T.accent },
  },
  '& .MuiInputLabel-root': { fontFamily: T.fontBody },
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
  const initials = storeName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SL'

  const handleNav = (i: number) => {
    setMobileOpen(false)
    onNavClick(i)
  }

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 1100,
          bgcolor: T.ink,
          boxShadow: '0 2px 24px rgba(0,0,0,0.25)',
        }}
      >
        <Box sx={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, minHeight: { xs: 60, md: 72 } }}>

              {/* Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: { xs: 2, md: 4 }, mr: { xs: 0, md: 2 }, borderRight: { xs: 'none', md: `1px solid rgba(255,255,255,0.08)` }, minWidth: 0 }}>
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={logoUrl || undefined}
                    sx={{
                      width: { xs: 38, md: 46 }, height: { xs: 38, md: 46 }, borderRadius: '10px',
                      background: `linear-gradient(135deg, ${T.accent} 0%, #7c3aed 100%)`,
                      fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1rem', color: T.white,
                    }}
                  >
                    {!logoUrl && initials}
                  </Avatar>
                  {trustSeal && (
                    <Box sx={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 14, height: 14, bgcolor: T.emerald,
                      borderRadius: '50%', border: `2px solid ${T.ink}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 8, color: T.white }} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{
                    fontFamily: T.fontDisplay, fontWeight: 700,
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    color: T.white, lineHeight: 1.2, letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 160, sm: 220, md: 'none' },
                  }}>
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
                          <Typography sx={{ fontSize: '0.68rem', color: T.white, fontFamily: T.fontBody, fontWeight: 700 }}>{rating}</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Desktop Nav */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', flex: 1 }}>
                {NAV_ITEMS.map((label, i) => (
                  <Box
                    key={label}
                    onClick={() => handleNav(i)}
                    sx={{
                      px: 2.5,
                      display: 'flex', alignItems: 'center',
                      fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.75rem',
                      color: activeSection === i ? T.white : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', position: 'relative',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'rgba(255,255,255,0.8)' },
                      '&::after': activeSection === i ? {
                        content: '""', position: 'absolute', bottom: 0, left: '50%',
                        transform: 'translateX(-50%)', width: 24, height: 2,
                        bgcolor: T.accent, borderRadius: '2px 2px 0 0',
                      } : {},
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>

              {/* Desktop Actions */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 'auto', py: 1.5 }}>
                {phone && (
                  <Button
                    variant="outlined" size="small"
                    startIcon={<PhoneIcon sx={{ fontSize: '13px !important' }} />}
                    href={`tel:${phone}`}
                    sx={{
                      fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.75rem',
                      textTransform: 'none', borderRadius: '9px', px: 2, height: 34,
                      borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)',
                      '&:hover': { borderColor: T.accent, color: T.white, bgcolor: 'rgba(26,77,255,0.15)' },
                    }}
                  >
                    Call Now
                  </Button>
                )}
                <Button
                  variant="contained" size="small"
                  startIcon={<SendOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                  onClick={() => handleNav(3)}
                  sx={{
                    fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.75rem',
                    textTransform: 'none', borderRadius: '9px', px: 2.5, height: 34,
                    bgcolor: T.accent, boxShadow: 'none',
                    '&:hover': { bgcolor: T.accent2, boxShadow: 'none' },
                  }}
                >
                  Send Inquiry
                </Button>
              </Box>

              {/* Mobile Actions */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.75, ml: 'auto' }}>
                {phone && (
                  <IconButton
                    href={`tel:${phone}`}
                    size="small"
                    sx={{ color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '9px', width: 36, height: 36 }}
                  >
                    <PhoneIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                )}
                <Button
                  size="small"
                  onClick={() => handleNav(3)}
                  sx={{
                    fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'none', borderRadius: '9px', px: 1.5, height: 34,
                    bgcolor: T.accent, color: T.white, boxShadow: 'none',
                    '&:hover': { bgcolor: T.accent2 },
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  Inquiry
                </Button>
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>

            </Box>
          </Container>
        </Box>

        {/* Mobile tab strip */}
        <Box sx={{
          display: { xs: 'flex', md: 'none' },
          overflowX: 'auto', borderTop: `1px solid rgba(255,255,255,0.06)`,
          '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {NAV_ITEMS.map((label, i) => (
            <Box
              key={label}
              onClick={() => handleNav(i)}
              sx={{
                px: 2.5, py: 1.2, flexShrink: 0,
                fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.72rem',
                color: activeSection === i ? T.white : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', position: 'relative',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                '&::after': activeSection === i ? {
                  content: '""', position: 'absolute', bottom: 0, left: '50%',
                  transform: 'translateX(-50%)', width: 20, height: 2,
                  bgcolor: T.accent, borderRadius: '2px 2px 0 0',
                } : {},
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: T.ink, color: T.white } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.9rem', color: T.white }}>Menu</Typography>
          <IconButton size="small" onClick={() => setMobileOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <List disablePadding>
          {NAV_ITEMS.map((label, i) => (
            <ListItem key={label} disablePadding>
              <ListItemButton
                onClick={() => handleNav(i)}
                sx={{
                  px: 2.5, py: 1.6,
                  borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.9rem',
                    color: activeSection === i ? T.white : 'rgba(255,255,255,0.55)',
                  }}
                />
                {activeSection === i && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: T.accent }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2.5, mt: 'auto', borderTop: `1px solid rgba(255,255,255,0.07)` }}>
          {phone && (
            <Button
              fullWidth href={`tel:${phone}`}
              startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ ...sxBtn('rgba(26,77,255,0.12)', '#7aabff', 'rgba(26,77,255,0.2)'), border: `1px solid rgba(26,77,255,0.3)`, py: 1.2, mb: 1, fontSize: '0.85rem' }}
            >
              Call Now
            </Button>
          )}
          <Button
            fullWidth onClick={() => handleNav(3)}
            startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ ...sxBtn(T.accent, T.white, T.accent2), py: 1.2, fontSize: '0.85rem' }}
          >
            Send Inquiry
          </Button>
        </Box>
      </Drawer>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO
// ─────────────────────────────────────────────────────────────────────────────
function SellerHero({
  store, rating, onInquiry,
}: {
  store: any; rating: number; onInquiry: () => void
}) {
  const badges = getActiveBadges(store)
  const storeName: string = store?.store_name || ''
  const phone: string = store?.whatsapp_number || store?.phone || ''

  return (
    <Box sx={{ bgcolor: T.ink, position: 'relative', overflow: 'hidden', pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 } }}>
      {/* BG */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 50%, rgba(26,77,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.10) 0%, transparent 50%)' }} />
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">

          {/* Left */}
          <Grid item xs={12} md={7}>
            {/* Live badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.75, bgcolor: 'rgba(26,77,255,0.15)', border: `1px solid rgba(26,77,255,0.35)`, borderRadius: '100px', mb: 2.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4d8fff', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: '#7aabff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Verified Supplier
              </Typography>
            </Box>

            {/* Title */}
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

            {/* CTAs */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: badges.length > 0 ? 3.5 : 0 }}>
              <Button
                variant="contained" onClick={onInquiry}
                startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{ ...sxBtn(T.accent, T.white, T.accent2), px: { xs: 2.5, md: 3.5 }, py: { xs: 1.2, md: 1.4 }, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(26,77,255,0.35)' }}
              >
                Get Best Price
              </Button>
              {phone && (
                <Button
                  variant="outlined"
                  href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                  target="_blank"
                  startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{ fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)', borderRadius: '11px', px: { xs: 2, md: 3 }, py: { xs: 1.2, md: 1.4 }, fontSize: '0.9rem', '&:hover': { borderColor: '#25d366', color: '#25d366', bgcolor: 'rgba(37,211,102,0.08)' } }}
                >
                  WhatsApp
                </Button>
              )}
            </Box>


          </Grid>

          {/* Right — rating card */}
          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '20px', overflow: 'hidden' }}>
              {/* Rating */}
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', mb: 1 }}>
                  Overall Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '3rem', color: T.white, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {rating.toFixed(1)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 14, color: T.gold }} />)}
                  </Box>
                </Box>
              </Box>
              {/* Rating bars */}

              {/* Dynamic badges */}
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
// SECTION: STATS  (years in business · rating · completed projects · gst)
// ─────────────────────────────────────────────────────────────────────────────
function SellerStats({ store, rating }: { store: any; rating: number }) {
  const gstNumber: string = store?.gst_number || ''
  const years: number = store?.years_in_business || 0
  const projects: string = store?.completed_projects || ''

  const stats = [
    {
      value: years ? `${years}+` : '—',
      label: 'Years in Business',
      bg: '#eef2ff', color: T.accent,
      Icon: AccessTimeIcon,
      show: true,
    },
    {
      value: rating.toFixed(1),
      label: 'Client Rating',
      bg: '#fef8ee', color: T.gold2,
      Icon: StarIcon,
      show: true,
    },
    {
      value: projects || '—',
      label: 'Completed Projects',
      bg: '#edfaf5', color: T.emerald2,
      Icon: ReceiptLongIcon,
      show: true,
    },
    {
      value: gstNumber ? gstNumber.slice(0, 6) + '…' : '—',
      label: 'GST Number',
      bg: '#f5f3ff', color: '#7c3aed',
      Icon: BadgeIcon,
      show: true,
    },
  ]

  return (
    <Box sx={{ ...sxCard, mb: 3 }}>
      <Grid container sx={{ py: 1 }}>
        {stats.map(({ value, label, bg, color, Icon }, i) => (
          <Grid item xs={6} md={3} key={label}>
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              py: { xs: 2, md: 2.5 }, px: { xs: 1.5, md: 2 },
              borderRight: i < 3 ? { xs: i % 2 === 0 ? `1px solid ${T.border}` : 'none', md: `1px solid ${T.border}` } : 'none',
              borderBottom: i < 2 ? { xs: `1px solid ${T.border}`, md: 'none' } : 'none',
            }}>
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
  const gstNumber: string = store?.gst_number || ''

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#eef2ff', T.accent)}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>About Us</Typography>
      </Box>
      <Box sx={sxCardBody}>
        {aboutUs ? (
          <>
            <Box sx={{
              maxHeight: expanded ? 'none' : '130px', overflow: 'hidden', position: 'relative',
              '&::after': !expanded ? { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: `linear-gradient(to top, ${T.white}, transparent)` } : {},
            }}>
              <Typography component="div" sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted, lineHeight: 1.85, '& p': { mb: 1.5 } }} dangerouslySetInnerHTML={{ __html: aboutUs }} />
            </Box>
            <Button size="small" onClick={() => setExpanded(!expanded)}
              sx={{ mt: 1, fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', color: T.accent, fontSize: '0.82rem', px: 0, '&:hover': { bgcolor: 'transparent', color: T.accent2 } }}
            >
              {expanded ? 'Show Less ↑' : 'Read More ↓'}
            </Button>
          </>
        ) : (
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted2, fontStyle: 'italic' }}>
            No description available for this seller yet.
          </Typography>
        )}

        {/* Compact facts row */}
        <Grid container spacing={1.5} sx={{ mt: 2.5 }}>
          {[
            { label: 'City', value: store?.city },
            { label: 'State', value: store?.state },
            { label: 'Pincode', value: store?.pincode },

          ].filter(f => f.value).map(({ label, value }) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', p: 1.5 }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, color: T.muted2, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.4 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.83rem', fontWeight: 700, color: T.ink2 }}>
                  {value}
                </Typography>
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

  const filtered = products.filter(p => {
    return !search || p.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#fef8ee', T.gold2)}><InventoryIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Products &amp; Services</Typography>
        <Chip label={`${products.length} items`} size="small" sx={{ ml: 'auto', bgcolor: T.surface, color: T.muted, fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
      </Box>
      <Box sx={sxCardBody}>
        {/* Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2, py: 1.3, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', mb: 2.5 }}>
          <SearchIcon sx={{ fontSize: 16, color: T.muted2 }} />
          <Box
            component="input" value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search products and services…"
            sx={{ flex: 1, border: 'none', background: 'transparent', fontFamily: T.fontBody, fontSize: '0.86rem', color: T.ink, outline: 'none', '&::placeholder': { color: T.muted2 } }}
          />
        </Box>

        {/* Grid */}
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
                  <Box sx={{
                    border: `1.5px solid ${T.border}`, borderRadius: '14px',
                    overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                    transition: 'all 0.22s',
                    '&:hover': { borderColor: T.accent, boxShadow: '0 8px 28px rgba(26,77,255,0.10)', transform: 'translateY(-2px)' },
                  }}>
                    {/* Image */}
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
                    {/* Content */}
                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        component="a" href={`/${product.url_key}.html`}
                        sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.85rem', color: T.ink, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textDecoration: 'none', mb: 1.2, minHeight: '2.4em', '&:hover': { color: T.accent } }}
                      >
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
                        <Button
                          variant="outlined" size="small" component="a" href={`/${product.url_key}.html`}
                          endIcon={<OpenInNewIcon sx={{ fontSize: '10px !important' }} />}
                          sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.7rem', textTransform: 'none', borderRadius: '8px', px: 1.25, height: 28, borderColor: T.border2, color: T.accent, '&:hover': { borderColor: T.accent, bgcolor: 'rgba(26,77,255,0.05)' } }}
                        >
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
// SECTION: REVIEWS (always static)
// ─────────────────────────────────────────────────────────────────────────────
function SellerReviews({ averageRating, totalReviews }: { averageRating: number; totalReviews: number }) {
  const [userRating, setUserRating] = useState<number | null>(null)
  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const dist = [
    { star: 5, pct: 75, color: T.emerald },
    { star: 4, pct: 18, color: T.emerald },
    { star: 3, pct: 5, color: '#f59e0b' },
    { star: 2, pct: 1, color: '#ef4444' },
    { star: 1, pct: 1, color: '#ef4444' },
  ]

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#fef8ee', T.gold2)}><ReviewsOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Customer Reviews</Typography>
        <Typography sx={{ ml: 'auto', fontFamily: T.fontBody, fontSize: '0.72rem', color: T.muted, fontWeight: 500 }}>
          {totalReviews} verified reviews
        </Typography>
      </Box>
      <Box sx={sxCardBody}>
        {/* Rating summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, bgcolor: T.ink, borderRadius: '14px', p: { xs: 2, md: 2.5 }, mb: 3 }}>
          <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: { xs: '2.8rem', md: '3.5rem' }, color: T.white, lineHeight: 1, letterSpacing: '-0.05em' }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', my: 0.8 }}>
              {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 13, color: T.gold }} />)}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            {dist.map(({ star, pct, color }) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8, '&:last-child': { mb: 0 } }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 10 }}>{star}</Typography>
                <Box sx={{ flex: 1, height: 5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: '4px' }} />
                </Box>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', width: 26, textAlign: 'right' }}>{pct}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Write review */}
        <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 2.5, mb: 3 }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.9rem', color: T.ink, mb: 1.75 }}>Write a Review</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.75 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <Box key={s} onClick={() => setUserRating(s)} sx={{ cursor: 'pointer' }}>
                <StarIcon sx={{ fontSize: 26, color: userRating !== null && s <= userRating ? T.gold : T.border2, transition: 'color 0.15s' }} />
              </Box>
            ))}
          </Box>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Your Name" sx={sxInput} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Email Address" type="email" sx={sxInput} /></Grid>
          </Grid>
          <TextField fullWidth multiline rows={3} size="small" placeholder="Share your experience with this seller…" sx={{ ...sxInput, mb: 1.5 }} />
          <Button variant="contained" startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ ...sxBtn(T.ink, T.white, T.ink2), px: 3, py: 1.1, fontSize: '0.85rem' }}>
            Submit Review
          </Button>
        </Box>

        {/* Review cards */}
        <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2 }}>Customer Feedback</Typography>
        <Grid container spacing={2}>
          {STATIC_REVIEWS.map((r, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box sx={{ p: 2.5, border: `1.5px solid ${T.border}`, borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { borderColor: T.border2, boxShadow: '0 6px 20px rgba(10,15,30,0.07)', transform: 'translateY(-2px)' } }}>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', lineHeight: 1, color: T.border2, mb: 0.5, mt: '-6px' }}>"</Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.83rem', color: T.muted, lineHeight: 1.75, flex: 1, mb: 2 }}>{r.comment}</Typography>
                <Box sx={{ display: 'flex', gap: 0.3, mb: 1.5 }}>
                  {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 12, color: s <= r.rating ? T.gold : T.border2 }} />)}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: '0.72rem', fontWeight: 800, background: r.avatarBg, fontFamily: T.fontDisplay, flexShrink: 0 }}>{initials(r.name)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.82rem', color: T.ink, lineHeight: 1.2 }}>{r.name}</Typography>
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: T.muted2 }}>{r.company}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', color: T.muted2, fontWeight: 600 }}>{r.date}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
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
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter valid 10-digit phone'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSuccess(true)
    setForm({ name: '', phone: '', message: '' })
    setTimeout(() => setSuccess(false), 4000)
  }

  const address = store?.address || ''
  const city = store?.city || ''
  const state = store?.state || ''
  const country = store?.country || 'India'
  const pincode = store?.pincode || ''
  const gstNumber = store?.gst_number || ''

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#edfaf5', T.emerald2)}><LocationOnOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Reach Us</Typography>
      </Box>
      <Box sx={sxCardBody}>
        <Grid container spacing={3}>
          {/* Address */}
          <Grid item xs={12} md={5}>
            <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 2.5, mb: 2 }}>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted2, mb: 1.2 }}>
                Office Address
              </Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.88rem', color: T.ink2, lineHeight: 1.85, fontWeight: 500 }}>
                {[address, city, state, pincode].filter(Boolean).join(', ')}<br />
                {country}
              </Typography>
              {gstNumber && (
                <Box sx={{ mt: 1.5, display: 'inline-block', px: 1.25, py: 0.4, bgcolor: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '7px', fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: T.muted }}>
                  GST: {gstNumber}
                </Box>
              )}
            </Box>
            <Box sx={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${T.border}`, height: 180, bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.82rem', color: T.muted2, fontWeight: 600 }}>Map View</Typography>
            </Box>
          </Grid>

          {/* Form */}
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2.5 }}>
              Send an Inquiry
            </Typography>
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
                <Button fullWidth variant="contained" onClick={handleSubmit}
                  startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
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
  store, onInquiry, onOverview, onProducts, onReviews, onContact,
}: {
  store: any
  onInquiry: () => void; onOverview: () => void; onProducts: () => void; onReviews: () => void; onContact: () => void
}) {
  const storeName: string = store?.store_name || ''
  const phone: string = store?.phone || ''
  const email: string = store?.email || ''
  const city: string = store?.city || ''
  const state: string = store?.state || ''
  const gstNumber: string = store?.gst_number || ''

  return (
    <Box sx={{ position: 'sticky', top: 90 }}>
      {/* Quick Contact */}
      <Box sx={{ bgcolor: T.ink, borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.white, mb: 0.4 }}>Quick Contact</Typography>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeName}</Typography>
        </Box>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {(city || state) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{[city, state].filter(Boolean).join(', ')}, India</Typography>
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
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted2 }}>
            Our Company
          </Typography>
        </Box>
        {[
          { label: 'About Us', fn: onOverview },
          { label: 'Products & Services', fn: onProducts },
          { label: 'Reviews & Rating', fn: onReviews },
          { label: 'Reach Us', fn: onContact },
        ].map(({ label, fn }, i, arr) => (
          <Box key={label} onClick={fn} sx={{
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
            transition: 'all 0.15s',
            '&:hover': { bgcolor: T.surface, '& .lbl': { color: T.accent }, '& .arr': { color: T.accent } },
          }}>
            <Typography className="lbl" sx={{ fontFamily: T.fontBody, fontSize: '0.85rem', fontWeight: 600, color: T.ink2, transition: 'color 0.15s' }}>{label}</Typography>
            <ChevronRightIcon className="arr" sx={{ fontSize: 16, color: T.muted2, transition: 'color 0.15s' }} />
          </Box>
        ))}
      </Box>

      {/* Certifications — only if store has them */}
      {(gstNumber || store?.certifications) && (
        <Box sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted2 }}>Certifications</Typography>
          </Box>
          {gstNumber && (
            <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: store?.certifications ? `1px solid ${T.border}` : 'none' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BadgeIcon sx={{ fontSize: 15, color: T.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.8rem', color: T.ink2 }}>GST Certificate</Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gstNumber}</Typography>
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
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', mt: 0.3 }}>
              © {new Date().getFullYear()} All rights reserved.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {['Verified Supplier', 'Secure B2B', 'Trusted Marketplace'].map(label => (
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
    const top = ref.current.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const { data: storeData, loading: storeLoading } = useQuery(
    VendorStoresDocument,
    { variables: { store_code: String(store_code), status: 1 }, skip: !store_code }
  )

  const store = storeData?.vendorStores?.[0]

  const { data: productData, loading: productsLoading } = useQuery(
    SellerProductsDocument,
    { variables: { seller: String(store?.customer_id) }, skip: !store?.customer_id }
  )

  const products: any[] = productData?.products?.items || []

  // ── Loading
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

  // ── Not found — no static fallback
  if (!store) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.surface }}>
        <Box sx={{ textAlign: 'center', maxWidth: 380, px: 3 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 28, color: T.muted2 }} />
          </Box>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.4rem', color: T.ink, mb: 1 }}>Seller Not Found</Typography>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted, lineHeight: 1.7 }}>
            The seller you're looking for doesn't exist or may have been removed. Please check the URL and try again.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>{store.store_name} | B2B Marketplace</title>
        <meta name="description" content={`${store.store_name} — Verified B2B Supplier`} />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: T.surface, fontFamily: T.fontBody }}>

        {/* ══ HEADER ══ */}
        <SellerHeader
          storeName={store.store_name || ''}
          logoUrl={store.logo || ''}
          city={store.city || ''}
          state={store.state || ''}
          gstNumber={store.gst_number || ''}
          rating={4.8}
          trustSeal={!!store.trust_seal}
          phone={store.phone || ''}
          activeSection={activeSection}
          onNavClick={scrollToSection}
        />

        {/* ══ HERO ══ */}
        <SellerHero
          store={store}
          rating={4.8}
          onInquiry={() => scrollToSection(3)}
        />

        {/* ══ MAIN LAYOUT ══ */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>

            {/* LEFT */}
            <Grid item xs={12} md={9}>
              <div ref={overviewRef}>
                <SellerStats store={store} rating={4.8} />
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
                <SellerReviews averageRating={4.8} totalReviews={312} />
              </div>

              <div ref={contactRef}>
                <SellerReachUs store={store} />
              </div>
            </Grid>

            {/* RIGHT */}
            <Grid item xs={12} md={3}>
              <SellerSidebar
                store={store}
                onInquiry={() => scrollToSection(3)}
                onOverview={() => scrollToSection(0)}
                onProducts={() => scrollToSection(1)}
                onReviews={() => scrollToSection(2)}
                onContact={() => scrollToSection(3)}
              />
            </Grid>

          </Grid>
        </Container>

        {/* ══ FOOTER ══ */}
        <SellerFooter storeName={store.store_name || ''} />
      </Box>
    </>
  )
}