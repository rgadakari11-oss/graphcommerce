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
import { Box, Container, Grid, Typography, Button, Chip, Avatar, Rating, LinearProgress, Divider, TextField, IconButton, Tooltip } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import ShareIcon from '@mui/icons-material/Share'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DirectionsIcon from '@mui/icons-material/Directions'
import DownloadIcon from '@mui/icons-material/Download'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

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
// STATIC FALLBACK DATA
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_STORE = {
  customer_id: 0,
  store_name: 'Sree Balaji Exports',
  gst_number: '33CRFPK2110G1ZT',
  years_in_business: 19,
  trust_seal: true,
  phone: '+914333433600',
  email: 'kalpana.s@sreebalaji.com',
  logo: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  pincode: '600077',
  address: 'SF No. 372/41/1, Street 7, EJHL Nagar, Ayappakkam, Tiruvallur',
  about_us: `<p>Sree Balaji Exports is a premier manufacturer, exporter, and supplier of high-quality human hair products headquartered in Chennai, Tamil Nadu. With 19+ years of deep-rooted expertise, we have established ourselves as one of India's most trusted hair exporters, supplying to premium buyers across North America, Europe, the Middle East, and Southeast Asia.</p><p>Our vertically integrated operations — from raw hair sourcing to final processing — ensure uncompromised quality at every step. We specialize in virgin hair, Remy hair extensions, closures, wigs, and custom bulk orders. Our state-of-the-art facility in Chennai handles over 2,000 kg of hair monthly, with strict quality protocols and full traceability.</p>`,
  completed_projects: '500+',
  certifications: 'ISO 9001',
  awards: '3',
}

const STATIC_PRODUCTS = [
  { uid: '1', name: '30 Inch Double Drawn - Remy Grade Hair', categories: [{ name: 'Human Hair' }], price_range: { minimum_price: { regular_price: { value: 9000 } } }, small_image: { url: '' }, url_key: 'remy-grade-hair', moq: '1 kg' },
  { uid: '2', name: 'Raw Human Hair Extensions - Black Color', categories: [{ name: 'Virgin Hair' }], price_range: { minimum_price: { regular_price: { value: 25000 } } }, small_image: { url: '' }, url_key: 'raw-hair-extensions', moq: '1 box' },
  { uid: '3', name: 'Remy Wavy Hair - New Style Premium Grade', categories: [{ name: 'Remy Hair' }], price_range: { minimum_price: { regular_price: { value: 8000 } } }, small_image: { url: '' }, url_key: 'remy-wavy-hair', moq: '10 kg' },
  { uid: '4', name: 'Full Lace Virgin Human Hair Wig - Natural', categories: [{ name: 'Hair Wig' }], price_range: { minimum_price: { regular_price: { value: 12000 } } }, small_image: { url: '' }, url_key: 'full-lace-wig', moq: '5 pcs' },
  { uid: '5', name: 'Brazilian Virgin Human Hair 100% Natural Body Wave', categories: [{ name: 'Brazilian' }], price_range: { minimum_price: { regular_price: { value: 10000 } } }, small_image: { url: '' }, url_key: 'brazilian-virgin-hair', moq: '1 kg' },
  { uid: '6', name: '18 Inch Hair Closure - Double Drawn Premium', categories: [{ name: 'Closure' }], price_range: { minimum_price: { regular_price: { value: 7500 } } }, small_image: { url: '' }, url_key: 'hair-closure', moq: '1 kg' },
]

const STATIC_REVIEWS = [
  { name: 'Robert Karmazov', company: 'TechBridge Solutions', rating: 5, comment: 'Exceptional quality and timely delivery. Their team was highly professional throughout the project lifecycle. Would strongly recommend for B2B procurement.', date: '20 days ago', avatarBg: 'linear-gradient(135deg,#1a4dff,#7c3aed)' },
  { name: 'Nilesh Shah', company: 'Apex Industries', rating: 5, comment: 'Outstanding experience. Their product range is comprehensive and the support team resolved our queries promptly. Excellent after-sales service.', date: '1 month ago', avatarBg: 'linear-gradient(135deg,#0fa96b,#059669)' },
  { name: 'Edna Watson', company: 'Global Trade Co.', rating: 4, comment: 'Very reliable vendor. Products meet our quality standards. Minor delays in one shipment, but communication was transparent throughout.', date: '8 months ago', avatarBg: 'linear-gradient(135deg,#e8a020,#c47d00)' },
]

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
  px: { xs: 2.5, md: 3.5 },
  py: 2.5,
  borderBottom: `1px solid ${T.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
}

const sxCardBody = { px: { xs: 2.5, md: 3.5 }, py: 3 }

const sxCardIcon = (bg: string, color: string) => ({
  width: 36, height: 36, borderRadius: '10px',
  bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
})

const sxCardTitle = {
  fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.ink, letterSpacing: '-0.01em',
}

const sxBtn = (bg: string, color: string, hoverBg: string) => ({
  fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none',
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
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TOPBAR / HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SellerHeader({
  storeName, logoUrl, city, state, gstNumber, rating, ratingCount, trustSeal,
  phone, email, activeSection, onNavClick,
}: {
  storeName: string; logoUrl?: string; city?: string; state?: string
  gstNumber?: string; rating: number; ratingCount: number; trustSeal?: boolean
  phone?: string; email?: string; activeSection: number; onNavClick: (i: number) => void
}) {
  const initials = storeName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky', top: 0, zIndex: 1100,
        bgcolor: T.ink,
        boxShadow: '0 2px 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* ── MAIN STRIP ── */}
      <Box sx={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0, minHeight: 72 }}>

            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 4, mr: 2, borderRight: `1px solid rgba(255,255,255,0.08)` }}>
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={logoUrl}
                  sx={{
                    width: 46, height: 46, borderRadius: '12px',
                    background: `linear-gradient(135deg, ${T.accent} 0%, #7c3aed 100%)`,
                    fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.1rem', color: T.white,
                  }}
                >
                  {!logoUrl && initials}
                </Avatar>
                {trustSeal && (
                  <Box sx={{
                    position: 'absolute', bottom: -3, right: -3,
                    width: 16, height: 16, bgcolor: T.emerald,
                    borderRadius: '50%', border: `2.5px solid ${T.ink}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 9, color: T.white }} />
                  </Box>
                )}
              </Box>
              <Box>
                <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.white, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  {storeName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                  {(city || state) && (
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                      {[city, state].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                  {gstNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                      <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontFamily: T.fontBody, fontWeight: 600 }}>
                        GST Verified
                      </Typography>
                    </Box>
                  )}
                  {rating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                      <StarIcon sx={{ fontSize: 11, color: T.gold }} />
                      <Typography sx={{ fontSize: '0.72rem', color: T.white, fontFamily: T.fontBody, fontWeight: 700 }}>
                        {rating}
                      </Typography>
                      {/* {ratingCount > 0 && (
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontFamily: T.fontBody }}>
                          ({ratingCount})
                        </Typography>
                      )} */}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Nav */}
            <Box sx={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
              {NAV_ITEMS.map((label, i) => (
                <Box
                  key={label}
                  onClick={() => onNavClick(i)}
                  sx={{
                    px: 2.5,
                    display: 'flex', alignItems: 'center',
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: '0.78rem',
                    color: activeSection === i ? T.white : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    position: 'relative',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'rgba(255,255,255,0.8)' },
                    '&::after': activeSection === i ? {
                      content: '""', position: 'absolute', bottom: 0, left: '50%',
                      transform: 'translateX(-50%)', width: 28, height: 2,
                      bgcolor: T.accent, borderRadius: '2px 2px 0 0',
                    } : {},
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', py: 1.5 }}>
              {phone && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhoneIcon sx={{ fontSize: '13px !important' }} />}
                  href={`tel:${phone}`}
                  sx={{
                    fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.78rem',
                    textTransform: 'none', borderRadius: '9px', px: 2, height: 34,
                    borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)',
                    '&:hover': { borderColor: T.accent, color: T.white, bgcolor: 'rgba(26,77,255,0.15)' },
                  }}
                >
                  Call Now
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                startIcon={<SendOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                onClick={() => onNavClick(3)}
                sx={{
                  fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.78rem',
                  textTransform: 'none', borderRadius: '9px', px: 2.5, height: 34,
                  bgcolor: T.accent, boxShadow: 'none',
                  '&:hover': { bgcolor: T.accent2, boxShadow: 'none' },
                }}
              >
                Send Inquiry
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO
// ─────────────────────────────────────────────────────────────────────────────
function SellerHero({
  storeName, city, state, phone, rating, ratingCount,
  onInquiry,
}: {
  storeName: string; city?: string; state?: string
  phone?: string; rating: number; ratingCount: number; onInquiry: () => void
}) {
  return (
    <Box
      sx={{
        bgcolor: T.ink,
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 3, md: 3 },
        pb: { xs: 1, md: 1 },
      }}
    >
      {/* Background effects */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 20% 50%, rgba(26,77,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.10) 0%, transparent 50%), radial-gradient(circle at 60% 85%, rgba(15,169,107,0.08) 0%, transparent 40%)',
      }} />
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={5} alignItems="center">

          {/* Left */}
          <Grid item xs={12} md={7}>
            {/* Animated badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 1.75, py: 0.75,
              bgcolor: 'rgba(26,77,255,0.15)', border: `1px solid rgba(26,77,255,0.35)`,
              borderRadius: '100px', mb: 3,
            }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', bgcolor: '#4d8fff',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
              }} />
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', fontWeight: 700, color: '#7aabff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Verified Exporter &amp; Manufacturer
              </Typography>
            </Box>

            <Typography sx={{
              fontFamily: T.fontDisplay, fontWeight: 800, fontSize: { xs: '2.4rem', md: '3.2rem' },
              color: T.white, lineHeight: 1.1, letterSpacing: '-0.03em', mb: 2,
            }}>
              {storeName.split(' ').slice(0, -1).join(' ')}{' '}
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #4d8fff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {storeName.split(' ').slice(-1)[0]}
              </Box>
            </Typography>

            <Typography sx={{ fontFamily: T.fontBody, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.75, mb: 4 }}>
              Trusted supplier delivering quality products at competitive prices.
              Get the best deals with reliable service and fast response.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 4 }}>
              <Button
                variant="contained"
                onClick={onInquiry}
                startIcon={<SendOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  ...sxBtn(T.accent, T.white, T.accent2),
                  px: 3.5, py: 1.4, fontSize: '0.9rem',
                  boxShadow: '0 8px 24px rgba(26,77,255,0.35)',
                }}
              >
                Get Best Price
              </Button>
              {phone && (
                <Button
                  variant="outlined"
                  href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                  target="_blank"
                  startIcon={<WhatsAppIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{
                    fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none',
                    borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)',
                    borderRadius: '11px', px: 3, py: 1.4, fontSize: '0.9rem',
                    '&:hover': { borderColor: '#25d366', color: '#25d366', bgcolor: 'rgba(37,211,102,0.08)' },
                  }}
                >
                  WhatsApp
                </Button>
              )}
            </Box>


          </Grid>

          {/* Right — rating card */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: '20px', overflow: 'hidden',
            }}>
              {/* Rating header */}
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1 }}>
                  Overall Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '3rem', color: T.white, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {rating.toFixed(1)}
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 0.3, mb: 0.4 }}>
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 14, color: T.gold }} />)}
                    </Box>
                    {/* <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                      Based on {ratingCount} reviews
                    </Typography> */}
                  </Box>
                </Box>
              </Box>

              {/* Rating bars */}
              {/* <Box sx={{ px: 3, py: 2, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                {[
                  { star: 5, pct: 75 },
                  { star: 4, pct: 18 },
                  { star: 3, pct: 5 },
                  { star: 2, pct: 1 },
                  { star: 1, pct: 1 },
                ].map(({ star, pct }) => (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.9 }}>
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: 10 }}>{star}</Typography>
                    <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: star >= 4 ? T.gold : star === 3 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
                    </Box>
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', width: 28, textAlign: 'right' }}>{pct}%</Typography>
                  </Box>
                ))}
              </Box> */}

              {/* Trust items */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: 'flex',
                  flexWrap: 'wrap', // This allows items to move to the next line instead of overflowing
                  gap: 2,           // Standardizes spacing between rows and columns
                }}
              >
                {[
                  { label: 'GST Verified Supplier', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  { label: 'Secure', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  { label: 'On-Time Delivery', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  // { label: 'Star Supplier', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  // { label: 'Buyer Protected', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  // { label: 'Legacy Partner', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                  { label: 'TrustSEAL', color: T.emerald, bg: 'rgba(15,169,107,0.15)' },
                ].map(({ label, color, bg }) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      // Removed mb: 1.2 because gap handles it now
                    }}
                  >
                    <Box
                      sx={{
                        width: 24, // Slightly smaller to save more space
                        height: 24,
                        borderRadius: '6px',
                        bgcolor: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 13, color }} />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: T.fontBody,
                        fontSize: '0.75rem', // Slightly smaller for better fit
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.6)',
                        whiteSpace: 'nowrap' // Prevents a single tag from breaking into two lines
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: STATS
// ─────────────────────────────────────────────────────────────────────────────
function SellerStats({
  yearsInBusiness, rating, clients, employees,
}: {
  yearsInBusiness: number; rating: number; clients: string; employees: string
}) {
  const stats = [
    { value: yearsInBusiness ? `${yearsInBusiness}+` : '19+', label: 'Years in Business', bg: '#eef2ff', color: T.accent },
    { value: String(rating) || '4.8', label: 'Client Rating', bg: '#fef8ee', color: T.gold2 },
    { value: clients || '500+', label: 'Global Clients', bg: '#edfaf5', color: T.emerald2 },
    { value: employees || '50', label: 'Employees', bg: '#f5f3ff', color: '#7c3aed' },
  ]

  return (
    <Box sx={{ ...sxCard, mb: 3 }}>
      <Grid container sx={{ py: 1 }}>
        {stats.map(({ value, label, bg, color }, i) => (
          <Grid item xs={6} md={3} key={label}>
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              py: 2.5, px: 2,
              borderRight: i < 3 ? { xs: 'none', md: `1px solid ${T.border}` } : 'none',
              borderBottom: i < 2 ? { xs: `1px solid ${T.border}`, md: 'none' } : 'none',
              position: 'relative',
            }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.2, color }}>
                {i === 0 && <AccessTimeIcon sx={{ fontSize: 20 }} />}
                {i === 1 && <StarIcon sx={{ fontSize: 20 }} />}
                {i === 2 && <CheckCircleIcon sx={{ fontSize: 20 }} />}
                {i === 3 && <PeopleOutlineIcon sx={{ fontSize: 20 }} />}
              </Box>
              <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.7rem', color, lineHeight: 1, letterSpacing: '-0.04em', mb: 0.5 }}>
                {value}
              </Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', fontWeight: 600, color: T.muted, letterSpacing: '0.01em' }}>
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
function SellerAbout({
  aboutUs, gstNumber, businessType, established, paymentMode, workingDays, inquiryType, employees,
}: {
  aboutUs?: string | null; gstNumber?: string; businessType?: string
  established?: string; paymentMode?: string; workingDays?: string; inquiryType?: string; employees?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const facts = [
    { label: 'Business Type', value: businessType || 'Exporter, Manufacturer, Supplier' },
    { label: 'GST Number', value: gstNumber || 'N/A' },
    { label: 'Established', value: established || '2005, Chennai' },
  ]

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#eef2ff', T.accent)}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>About Us</Typography>
      </Box>
      <Box sx={sxCardBody}>
        {aboutUs && (
          <>
            <Box sx={{
              maxHeight: expanded ? 'none' : '130px', overflow: 'hidden',
              position: 'relative',
              '&::after': !expanded ? {
                content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
                background: `linear-gradient(to top, ${T.white}, transparent)`,
              } : {},
            }}>
              <Typography
                component="div"
                sx={{ fontFamily: T.fontBody, fontSize: '0.9rem', color: T.muted, lineHeight: 1.85, '& p': { mb: 1.5 } }}
                dangerouslySetInnerHTML={{ __html: aboutUs }}
              />
            </Box>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ mt: 1, fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', color: T.accent, fontSize: '0.82rem', px: 0, '&:hover': { bgcolor: 'transparent', color: T.accent2 } }}
            >
              {expanded ? 'Show Less ↑' : 'Read More ↓'}
            </Button>
          </>
        )}

        {/* Facts grid */}
        {/* <Grid container spacing={1.75} sx={{ mt: 2 }}>
          {facts.map(({ label, value }) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 1.75 }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: T.muted2, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.85rem', fontWeight: 700, color: T.ink2 }}>
                  {value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid> */}
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PRODUCTS & SERVICES
// ─────────────────────────────────────────────────────────────────────────────

function SellerProducts({ products }: { products: any[] }) {
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const cat = p?.categories?.[0]?.name || ''
    const matchCat = activeCat === 'All' || cat === activeCat
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#fef8ee', T.gold2)}><InventoryIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Products &amp; Services</Typography>
        <Chip label={`${products.length} items`} size="small" sx={{ ml: 'auto', bgcolor: T.surface, color: T.muted, fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
      </Box>
      <Box sx={sxCardBody}>
        {/* Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2, py: 1.4, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', mb: 2.5 }}>
          <SearchIcon sx={{ fontSize: 17, color: T.muted2 }} />
          <Box
            component="input"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search products and services…"
            sx={{ flex: 1, border: 'none', background: 'transparent', fontFamily: T.fontBody, fontSize: '0.88rem', color: T.ink, outline: 'none', '&::placeholder': { color: T.muted2 } }}
          />
        </Box>

        {/* Category pills */}

        {/* Products grid */}
        <Grid container spacing={2}>
          {(filtered.length > 0 ? filtered : products).map((product) => {
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
                      <Typography sx={{ fontSize: '2.5rem' }}>💆</Typography>
                    )}
                    <Box sx={{
                      position: 'absolute', top: 10, left: 10,
                      px: 1, py: 0.4, bgcolor: T.ink, borderRadius: '6px',
                      fontFamily: T.fontBody, fontSize: '0.62rem', fontWeight: 700, color: T.white, letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {category}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      component="a"
                      href={`/${product.url_key}.html`}
                      sx={{
                        fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.85rem', color: T.ink,
                        lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        textDecoration: 'none', mb: 1.2, minHeight: '2.4em',
                        '&:hover': { color: T.accent },
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: `1px solid ${T.border}`, mt: 'auto' }}>
                      {price ? (
                        <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, color: T.ink, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                          ₹{price.toLocaleString('en-IN')}
                        </Typography>
                      ) : (
                        <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.78rem', color: T.muted2, fontStyle: 'italic' }}>Price on request</Typography>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={`/${product.url_key}.html`}
                        endIcon={<OpenInNewIcon sx={{ fontSize: '11px !important' }} />}
                        sx={{
                          fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.72rem', textTransform: 'none',
                          borderRadius: '8px', px: 1.5, height: 28,
                          borderColor: T.border2, color: T.accent,
                          '&:hover': { borderColor: T.accent, bgcolor: 'rgba(26,77,255,0.05)' },
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>


      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
function SellerReviews({ averageRating, totalReviews }: { averageRating: number; totalReviews: number }) {
  const [userRating, setUserRating] = useState<number | null>(null)

  const dist = [
    { star: 5, pct: 75, color: T.emerald },
    { star: 4, pct: 18, color: T.emerald },
    { star: 3, pct: 5, color: '#f59e0b' },
    { star: 2, pct: 1, color: '#ef4444' },
    { star: 1, pct: 1, color: '#ef4444' },
  ]

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Box sx={sxCard}>
      <Box sx={sxCardHeader}>
        <Box sx={sxCardIcon('#fef8ee', T.gold2)}><ReviewsOutlinedIcon sx={{ fontSize: 16 }} /></Box>
        <Typography sx={sxCardTitle}>Customer Reviews</Typography>
        <Typography sx={{ ml: 'auto', fontFamily: T.fontBody, fontSize: '0.75rem', color: T.muted, fontWeight: 500 }}>
          {totalReviews} verified reviews
        </Typography>
      </Box>
      <Box sx={sxCardBody}>

        {/* Rating summary — dark card */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 4,
          bgcolor: T.ink, borderRadius: '14px', p: 2.5, mb: 3,
        }}>
          <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '3.5rem', color: T.white, lineHeight: 1, letterSpacing: '-0.05em' }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', my: 0.8 }}>
              {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 15, color: T.gold }} />)}
            </Box>
            {/* <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              {totalReviews} reviews
            </Typography> */}
          </Box>
          <Box sx={{ flex: 1 }}>
            {dist.map(({ star, pct, color }) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8, '&:last-child': { mb: 0 } }}>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: 10 }}>{star}</Typography>
                <Box sx={{ flex: 1, height: 5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: '4px' }} />
                </Box>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', width: 28, textAlign: 'right' }}>{pct}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Write review */}
        <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', p: 2.5, mb: 3 }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.9rem', color: T.ink, mb: 1.75 }}>
            Write a Review
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.75 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <Box key={s} onClick={() => setUserRating(s)} sx={{ cursor: 'pointer' }}>
                <StarIcon sx={{ fontSize: 26, color: userRating !== null && s <= userRating ? T.gold : T.border2, transition: 'color 0.15s' }} />
              </Box>
            ))}
          </Box>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Your Name" sx={sxInput} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Email Address" type="email" sx={sxInput} />
            </Grid>
          </Grid>
          <TextField
            fullWidth multiline rows={3} size="small"
            placeholder="Share your experience with this seller…"
            sx={{ ...sxInput, mb: 1.5 }}
          />
          <Button
            variant="contained"
            startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ ...sxBtn(T.ink, T.white, T.ink2), px: 3, py: 1.1, fontSize: '0.85rem' }}
          >
            Submit Review
          </Button>
        </Box>

        {/* Review cards */}
        <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2 }}>
          Customer Feedback
        </Typography>
        <Grid container spacing={2}>
          {STATIC_REVIEWS.map((r, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box sx={{
                p: 2.5, border: `1.5px solid ${T.border}`, borderRadius: '14px',
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': { borderColor: T.border2, boxShadow: '0 6px 20px rgba(10,15,30,0.07)', transform: 'translateY(-2px)' },
              }}>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', lineHeight: 1, color: T.border2, mb: 0.5, mt: '-6px' }}>"</Typography>
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.83rem', color: T.muted, lineHeight: 1.75, flex: 1, mb: 2 }}>
                  {r.comment}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.3, mb: 1.5 }}>
                  {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} sx={{ fontSize: 12, color: s <= r.rating ? T.gold : T.border2 }} />)}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: '0.72rem', fontWeight: 800, background: r.avatarBg, fontFamily: T.fontDisplay, flexShrink: 0 }}>
                    {initials(r.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.82rem', color: T.ink, lineHeight: 1.2 }}>{r.name}</Typography>
                    <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: T.muted2 }}>{r.company}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', color: T.muted2, fontWeight: 600 }}>{r.date}</Typography>
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
// SECTION: REACH US / CONTACT
// ─────────────────────────────────────────────────────────────────────────────


function SellerReachUs({
  address, city, state, country, pincode, gstNumber, googleMapUrl, directionsUrl,
}: {
  address: string; city: string; state: string; country: string; pincode: string
  gstNumber?: string; googleMapUrl?: string; directionsUrl?: string

}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
  })

  const [errors, setErrors] = useState<any>({})
  const [success, setSuccess] = useState(false)
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const newErrors: any = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = 'Enter valid 10-digit phone'
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = () => {
    if (!validate()) return

    console.log('Form Data:', form)

    setSuccess(true)

    // Reset form
    setForm({ name: '', phone: '', message: '' })

    // Hide success after 3 sec
    setTimeout(() => setSuccess(false), 3000)
  }
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
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted2, mb: 1.2 }}>
                Office Address
              </Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.88rem', color: T.ink2, lineHeight: 1.85, fontWeight: 500 }}>
                {address}<br />{city}, {state}<br />{country} – {pincode}
              </Typography>
              {gstNumber && (
                <Box sx={{ mt: 1.5, display: 'inline-block', px: 1.25, py: 0.4, bgcolor: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '7px', fontFamily: T.fontBody, fontSize: '0.7rem', fontWeight: 700, color: T.muted }}>
                  GST: {gstNumber}
                </Box>
              )}
            </Box>

            {directionsUrl && (
              <Button
                variant="outlined"
                startIcon={<DirectionsIcon />}
                href={directionsUrl}
                target="_blank"
                sx={{ fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', borderRadius: '10px', mb: 2, borderColor: T.border2, color: T.ink2, '&:hover': { borderColor: T.accent, color: T.accent } }}
              >
                Get Directions
              </Button>
            )}

            <Box sx={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${T.border}`, height: 190, bgcolor: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {googleMapUrl ? (
                <Box component="iframe" title="Seller Location" src={googleMapUrl} sx={{ width: '100%', height: '100%', border: 0 }} allowFullScreen loading="lazy" />
              ) : (
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.82rem', color: T.muted2, fontWeight: 600 }}>Map View</Typography>
              )}
            </Box>
          </Grid>

          {/* Inquiry form */}
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '0.95rem', color: T.ink, mb: 2.5 }}>
              Send an Inquiry
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Your Name *"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={sxInput}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number *"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  sx={sxInput}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  label="Message *"
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={sxInput}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                  sx={{
                    ...sxBtn(T.accent, T.white, T.accent2),
                    px: 4,
                    py: 1.3,
                    fontSize: '0.9rem',
                  }}
                >
                  Submit Inquiry
                </Button>
              </Grid>

              {/* ✅ Success Message */}
              {success && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: 'rgba(15,169,107,0.1)',
                      border: '1px solid rgba(15,169,107,0.3)',
                      color: '#0fa96b',
                      fontFamily: T.fontBody,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
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
  storeName, phone, email, gstNumber, city, state,
  onInquiry, onOverview, onProducts, onReviews, onContact,
}: {
  storeName: string; phone?: string; email?: string; gstNumber?: string; city?: string; state?: string
  onInquiry: () => void; onOverview: () => void; onProducts: () => void; onReviews: () => void; onContact: () => void
}) {
  return (
    <Box sx={{ position: 'sticky', top: 86 }}>

      {/* Quick Contact Card — dark */}
      <Box sx={{ bgcolor: T.ink, borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', color: T.white, mb: 0.5 }}>
            Quick Contact
          </Typography>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
            {storeName}
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          {/* Meta */}
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {(city || state) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  {[city, state].filter(Boolean).join(', ')} India
                </Typography>
              </Box>
            )}

          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />

          {/* Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth onClick={onInquiry}
              startIcon={<SendOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ ...sxBtn(T.white, T.ink, '#f0f2ff'), py: 1.2, fontFamily: T.fontBody, justifyContent: 'center', fontSize: '0.85rem' }}
            >
              Send Inquiry
            </Button>
            {phone && (
              <Button
                fullWidth href={`tel:${phone}`}
                startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  ...sxBtn('rgba(26,77,255,0.1)', '#7aabff', 'rgba(26,77,255,0.18)'),
                  border: `1px solid rgba(26,77,255,0.3)`, py: 1.2, fontFamily: T.fontBody, fontSize: '0.85rem',
                }}
              >
                Call Now
              </Button>
            )}
            {email && (
              <Button
                fullWidth href={`mailto:${email}`}
                startIcon={<EmailIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none', py: 1.2, fontSize: '0.85rem',
                  borderRadius: '11px', bgcolor: 'transparent', color: 'rgba(255,255,255,0.55)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' },
                }}
              >
                Email Us
              </Button>
            )}
            {phone && (
              <Button
                fullWidth
                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                target="_blank"
                startIcon={<WhatsAppIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  ...sxBtn('rgba(37,211,102,0.1)', '#25d366', 'rgba(37,211,102,0.18)'),
                  border: `1px solid rgba(37,211,102,0.25)`, py: 1.2, fontFamily: T.fontBody, fontSize: '0.85rem',
                }}
              >
                WhatsApp
              </Button>
            )}
          </Box>
        </Box>
      </Box>



      {/* Certifications */}
      {/* <Box sx={{ bgcolor: T.white, border: `1px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted2 }}>
            Certifications
          </Typography>
        </Box>
        {[
          { name: 'ISO 9001:2015', sub: 'Quality Management' },
          { name: 'TrustSEAL', sub: 'Verified' },
          { name: 'GST Certificate', sub: gstNumber || 'Verified' },
        ].map(({ name, sub }, i, arr) => (
          <Box key={name} sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WorkspacePremiumIcon sx={{ fontSize: 16, color: T.accent }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: T.fontBody, fontWeight: 700, fontSize: '0.82rem', color: T.ink2 }}>{name}</Typography>
              <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.7rem', color: T.muted2 }}>{sub}</Typography>
            </Box>
            <Box sx={{ px: 1, py: 0.3, bgcolor: T.emerald, borderRadius: '6px', fontFamily: T.fontBody, fontSize: '0.6rem', fontWeight: 800, color: T.white, letterSpacing: '0.04em' }}>
              ✓ Valid
            </Box>
          </Box>
        ))}
      </Box> */}

      {/* Download brochure */}
      {/* <Button
        fullWidth
        startIcon={<DownloadIcon />}
        variant="outlined"
        sx={{
          fontFamily: T.fontBody, fontWeight: 700, textTransform: 'none',
          borderRadius: '14px', borderColor: T.border2, color: T.ink2, py: 1.4, fontSize: '0.88rem',
          '&:hover': { borderColor: T.accent, color: T.accent, bgcolor: 'rgba(26,77,255,0.04)' },
        }}
      >
        Download Brochure
      </Button> */}
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
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, color: T.white, fontSize: '0.95rem' }}>
              {storeName}
            </Typography>
            <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>
              © {new Date().getFullYear()} All rights reserved. Chennai, Tamil Nadu, India.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {['Verified Exporter', 'GST Verified', 'Secure B2B'].map(label => (
              <Box key={label} sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.75, py: 0.7, bgcolor: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '8px',
              }}>
                <CheckCircleIcon sx={{ fontSize: 12, color: T.emerald }} />
                <Typography sx={{ fontFamily: T.fontBody, fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{label}</Typography>
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
      const offset = 100
      const scrollY = window.scrollY + offset
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
    const top = ref.current.getBoundingClientRect().top + window.scrollY - 86
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // GraphQL queries — fall back to static data if unavailable
  const { data: storeData, loading: storeLoading, error: storeError } = useQuery(
    VendorStoresDocument,
    { variables: { store_code: String(store_code), status: 1 }, skip: !store_code }
  )

  const store = storeData?.vendorStores?.[0] || STATIC_STORE

  const { data: productData, loading: productsLoading } = useQuery(
    SellerProductsDocument,
    { variables: { seller: String(store?.customer_id) }, skip: !store?.customer_id }
  )

  const products = productData?.products?.items?.length ? productData.products.items : STATIC_PRODUCTS

  // Loading state
  if (storeLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.surface }}>
        <Typography sx={{ fontFamily: T.fontBody, color: T.muted }}>Loading seller profile…</Typography>
      </Box>
    )
  }

  const location = [store.city, store.state].filter(Boolean).join(', ')

  return (
    <>
      <Head>
        <title>{store.store_name} | B2B Marketplace</title>
        <meta name="description" content={`${store.store_name} — Verified B2B Supplier`} />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: T.surface, fontFamily: T.fontBody }}>

        {/* ══ TOPBAR ══ */}
        <SellerHeader
          storeName={store.store_name || ''}
          logoUrl={store.logo || ''}
          city={store.city || ''}
          state={store.state || ''}
          gstNumber={store.gst_number || ''}
          rating={4.8}
          ratingCount={312}
          trustSeal={store.trust_seal || true}
          phone={store.phone || ''}
          email={store.email || ''}
          activeSection={activeSection}
          onNavClick={scrollToSection}
        />

        {/* ══ HERO ══ */}
        <SellerHero
          storeName={store.store_name || ''}
          city={store.city || ''}
          state={store.state || ''}
          phone={store.phone || ''}
          rating={4.8}
          ratingCount={312}
          onInquiry={() => scrollToSection(3)}
        />

        {/* ══ MAIN LAYOUT ══ */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 5 }}>
          <Grid container spacing={3.5}>

            {/* ── LEFT main content ── */}
            <Grid item xs={12} md={9}>

              {/* OVERVIEW */}
              <div ref={overviewRef}>
                <SellerStats
                  yearsInBusiness={store.years_in_business || 19}
                  rating={4.8}
                  clients={store.completed_projects || '500+'}
                  employees="50"
                />
                <SellerAbout
                  aboutUs={store.about_us}
                  gstNumber={store.gst_number || ''}
                  businessType="Exporter, Manufacturer, Supplier"
                  established="2005, Chennai"
                  paymentMode="Cash in Advance (CID), T/T, LC"
                  workingDays="Monday – Sunday"
                  inquiryType="Foreign Inquiries Only"
                  employees="50"
                />
              </div>

              {/* PRODUCTS */}
              <div ref={productsRef}>
                {productsLoading ? (
                  <Box sx={{ ...sxCard, p: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: T.fontBody, color: T.muted }}>Loading products…</Typography>
                  </Box>
                ) : (
                  <SellerProducts products={products} />
                )}
              </div>

              {/* REVIEWS */}
              <div ref={reviewsRef}>
                <SellerReviews averageRating={4.8} totalReviews={312} />
              </div>

              {/* CONTACT */}
              <div ref={contactRef}>
                <SellerReachUs
                  address={store.address || ''}
                  city={store.city || ''}
                  state={store.state || ''}
                  country={store.country || 'India'}
                  pincode={store.pincode || ''}
                  gstNumber={store.gst_number || ''}
                  googleMapUrl=""
                  directionsUrl=""
                />
              </div>
            </Grid>

            {/* ── RIGHT sidebar ── */}
            <Grid item xs={12} md={3}>
              <SellerSidebar
                storeName={store.store_name || ''}
                phone={store.phone || ''}
                email={store.email || ''}
                gstNumber={store.gst_number || ''}
                city={store.city || ''}
                state={store.state || ''}
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