// pages/seller/[store_code].tsx
// ─────────────────────────────────────────────────────────────────────────────
// ALL SELLER COMPONENTS ARE INLINED — single file, no external component deps
// Brand palette: Navy #0c1e3c · Mid-blue #1a3a6b · Orange #f97316 · White #fff
// Font: DM Sans (add to _document.tsx):
//   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  TextField,
  Rating,
  LinearProgress,
  Divider,
  InputBase,
  Tab,
  Tabs,
  useScrollTrigger,
  IconButton,
  Tooltip,
} from '@mui/material'

// Icons
import VerifiedIcon from '@mui/icons-material/Verified'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimelineIcon from '@mui/icons-material/Timeline'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import ShareIcon from '@mui/icons-material/Share'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InventoryIcon from '@mui/icons-material/Inventory'
import BusinessIcon from '@mui/icons-material/Business'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { VendorStoresDocument } from '../../graphql/vendorstore.gql'
import { SellerProductsDocument } from '../../graphql/sellerProducts.gql'

// ─────────────────────────────────────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const B = {
  navy: '#0c1e3c',
  navyMid: '#1a3a6b',
  navyLight: '#254d8f',
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fed7aa',
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate600: '#475569',
  slate800: '#1e293b',
  green: '#16a34a',
  greenLight: '#dcfce7',
  font: '"DM Sans", system-ui, sans-serif',
}

const NAV_ITEMS = ['Overview', 'Products & Services', 'Reviews', 'Reach Us']

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HEADER
// ─────────────────────────────────────────────────────────────────────────────
interface HeaderData {
  storeName: string
  gstNumber?: string
  yearsInBusiness: number
  trustSeal?: boolean
  phone?: string
  email?: string
  logoUrl?: string
  rating: number
  ratingCount: number
  responseRate: number
  city?: string
  state?: string
}

function SellerHeader({
  data,
  activeSection,
  onNavClick,
}: {
  data: HeaderData
  activeSection: number
  onNavClick: (i: number) => void
}) {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 60 })
  const {
    storeName, gstNumber, yearsInBusiness, trustSeal,
    phone, email, logoUrl, rating, ratingCount, responseRate,
    city, state,
  } = data

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: B.white,
        transition: 'box-shadow 0.25s ease',
        boxShadow: trigger
          ? '0 4px 24px rgba(12,30,60,0.14)'
          : '0 1px 0 rgba(12,30,60,0.08)',
      }}
    >
      {/* ── TOP STRIP ── */}
      <Box
        sx={{
          background: trigger
            ? B.white
            : `linear-gradient(118deg, ${B.navy} 0%, ${B.navyMid} 100%)`,
          transition: 'background 0.3s ease',
          py: { xs: 1.5, md: 2 },
          borderBottom: `1px solid ${trigger ? B.slate200 : 'rgba(255,255,255,.12)'}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* LOGO */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={logoUrl}
                sx={{
                  width: { xs: 56, md: 68 },
                  height: { xs: 56, md: 68 },
                  bgcolor: B.orange,
                  color: B.white,
                  fontSize: '1.7rem',
                  fontWeight: 800,
                  fontFamily: B.font,
                  border: `3px solid ${trigger ? B.slate200 : 'rgba(255,255,255,.25)'}`,
                  boxShadow: `0 0 0 4px ${trigger ? 'transparent' : 'rgba(249,115,22,.25)'}`,
                  transition: 'all 0.3s',
                }}
              >
                {!logoUrl && storeName?.[0]}
              </Avatar>
              {trustSeal && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    bgcolor: B.green,
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${B.white}`,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 12, color: B.white }} />
                </Box>
              )}
            </Box>

            {/* STORE INFO */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                <Typography
                  sx={{
                    fontFamily: B.font,
                    fontWeight: 800,
                    fontSize: { xs: '1.05rem', md: '1.25rem' },
                    color: trigger ? B.navy : B.white,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    transition: 'color 0.3s',
                  }}
                >
                  {storeName}
                </Typography>
                {trustSeal && (
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: `${B.white} !important` }} />}
                    label="TrustSEAL Verified"
                    size="small"
                    sx={{
                      bgcolor: B.green,
                      color: B.white,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 22,
                      fontFamily: B.font,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                {(city || state) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <LocationOnOutlinedIcon
                      sx={{ fontSize: 13, color: trigger ? B.slate400 : 'rgba(255,255,255,.6)' }}
                    />
                    <Typography
                      sx={{
                        fontFamily: B.font,
                        fontSize: '0.78rem',
                        color: trigger ? B.slate600 : 'rgba(255,255,255,.75)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {[city, state].filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                )}
                {gstNumber && (
                  <Chip
                    label={`GST ${gstNumber}`}
                    size="small"
                    sx={{
                      bgcolor: trigger ? B.slate100 : 'rgba(255,255,255,.1)',
                      color: trigger ? B.slate600 : 'rgba(255,255,255,.8)',
                      fontFamily: B.font,
                      fontWeight: 600,
                      fontSize: '0.68rem',
                      height: 20,
                      border: `1px solid ${trigger ? B.slate200 : 'rgba(255,255,255,.2)'}`,
                    }}
                  />
                )}
                {yearsInBusiness > 0 && (
                  <Chip
                    label={`${yearsInBusiness} yrs`}
                    size="small"
                    sx={{
                      bgcolor: trigger ? B.slate100 : 'rgba(255,255,255,.1)',
                      color: trigger ? B.slate600 : 'rgba(255,255,255,.8)',
                      fontFamily: B.font,
                      fontWeight: 600,
                      fontSize: '0.68rem',
                      height: 20,
                      border: `1px solid ${trigger ? B.slate200 : 'rgba(255,255,255,.2)'}`,
                    }}
                  />
                )}
                {responseRate > 0 && (
                  <Chip
                    label={`${responseRate}% Response`}
                    size="small"
                    sx={{
                      bgcolor: trigger ? B.greenLight : 'rgba(22,163,74,.2)',
                      color: trigger ? B.green : '#86efac',
                      fontFamily: B.font,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 20,
                      border: `1px solid ${trigger ? '#bbf7d0' : 'rgba(22,163,74,.35)'}`,
                    }}
                  />
                )}
                {rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <StarIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                    <Typography
                      sx={{
                        fontFamily: B.font,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: trigger ? B.slate800 : B.white,
                      }}
                    >
                      {rating}
                    </Typography>
                    {ratingCount > 0 && (
                      <Typography sx={{ fontSize: '0.72rem', color: trigger ? B.slate400 : 'rgba(255,255,255,.55)' }}>
                        ({ratingCount})
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* CTAs */}
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center', ml: 'auto' }}>
              <Tooltip title="Save">
                <IconButton
                  size="small"
                  sx={{
                    color: trigger ? B.slate400 : 'rgba(255,255,255,.6)',
                    '&:hover': { color: B.orange },
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  <BookmarkBorderIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton
                  size="small"
                  sx={{
                    color: trigger ? B.slate400 : 'rgba(255,255,255,.6)',
                    '&:hover': { color: B.orange },
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  <ShareIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              {phone && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />}
                  href={`tel:${phone}`}
                  sx={{
                    fontFamily: B.font,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: B.orange,
                    boxShadow: 'none',
                    textTransform: 'none',
                    '&:hover': { bgcolor: B.orangeDark, boxShadow: 'none' },
                  }}
                >
                  Call Now
                </Button>
              )}
              {email && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EmailIcon sx={{ fontSize: '14px !important' }} />}
                  href={`mailto:${email}`}
                  sx={{
                    fontFamily: B.font,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2,
                    height: 36,
                    borderRadius: '10px',
                    textTransform: 'none',
                    borderColor: trigger ? B.navyMid : 'rgba(255,255,255,.4)',
                    color: trigger ? B.navyMid : B.white,
                    '&:hover': {
                      borderColor: B.orange,
                      color: B.orange,
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  Email
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── NAV TABS ── */}
      <Box sx={{ bgcolor: B.white, borderBottom: `1px solid ${B.slate200}` }}>
        <Container maxWidth="lg" disableGutters>
          <Tabs
            value={activeSection}
            onChange={(_, v) => onNavClick(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 46,
              '& .MuiTab-root': {
                minHeight: 46,
                fontFamily: B.font,
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                color: B.slate600,
                px: { xs: 2, md: 3 },
                '&.Mui-selected': { color: B.navy, fontWeight: 700 },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: B.orange,
              },
            }}
          >
            {NAV_ITEMS.map((label) => (
              <Tab key={label} label={label} disableRipple />
            ))}
          </Tabs>
        </Container>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO BANNER (below header, above stats)
// ─────────────────────────────────────────────────────────────────────────────
function SellerHeroBanner({
  storeName,
  tagline,
  phone,
  onInquiry,
}: {
  storeName: string
  tagline?: string
  phone?: string
  onInquiry: () => void
}) {
  return (
    <Box
      sx={{
        background: `lightslategrey`,
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 5 },
        mb: 4,
      }}
    >
      {/* Decorative bg circles */}
      {[
        { size: 420, top: -160, right: -80, op: 0.05 },
        { size: 220, top: 20, right: 260, op: 0.04 },
        { size: 160, bottom: -50, left: -40, op: 0.04 },
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
            opacity: c.op,
            pointerEvents: 'none',
          }}
        />
      ))}
      {/* Orange glow top-right */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Chip
              icon={<BusinessIcon sx={{ fontSize: '13px !important', color: `${B.orange} !important` }} />}
              label="Verified Supplier"
              size="small"
              sx={{
                bgcolor: 'rgba(249,115,22,.12)',
                color: B.orangeLight,
                fontFamily: B.font,
                fontWeight: 600,
                fontSize: '0.72rem',
                border: `1px solid rgba(249,115,22,.3)`,
                mb: 2,
              }}
            />
            <Typography
              sx={{
                fontFamily: B.font,
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                color: B.white,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                mb: 1.5,
              }}
            >
              {storeName}
            </Typography>
            {tagline && (
              <Typography
                sx={{
                  fontFamily: B.font,
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,.7)',
                  mb: 3,
                  maxWidth: 520,
                  lineHeight: 1.6,
                }}
              >
                {tagline}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={onInquiry}
                startIcon={<SendOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  fontFamily: B.font,
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: B.orange,
                  borderRadius: '10px',
                  px: 3,
                  py: 1.1,
                  boxShadow: '0 4px 16px rgba(249,115,22,.35)',
                  '&:hover': { bgcolor: B.orangeDark, boxShadow: '0 6px 20px rgba(249,115,22,.4)' },
                }}
              >
                Send Inquiry
              </Button>
              {phone && (
                <Button
                  variant="outlined"
                  href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                  target="_blank"
                  startIcon={<WhatsAppIcon sx={{ fontSize: '16px !important' }} />}
                  sx={{
                    fontFamily: B.font,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: 'rgba(255,255,255,.35)',
                    color: B.white,
                    borderRadius: '10px',
                    px: 3,
                    py: 1.1,
                    '&:hover': { borderColor: '#4ade80', color: '#4ade80', bgcolor: 'transparent' },
                  }}
                >
                  WhatsApp
                </Button>
              )}
            </Box>
          </Grid>

          {/* Quick info pills */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                p: 2.5,
              }}
            >
              {[
                { icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />, text: 'KYC Verified Supplier' },
                { icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />, text: 'Secure Transactions' },
                { icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />, text: 'Quality Assured Products' },
                { icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#4ade80' }} />, text: '24/7 Trade Support' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: i < 3 ? 1.5 : 0 }}>
                  {item.icon}
                  <Typography sx={{ fontFamily: B.font, fontSize: '0.88rem', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
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
interface StatsProps {
  yearsInBusiness: number
  clientRating: number | string
  completedProjects: string
  certifications: string
  awards: string
}

const STAT_CFG = [
  { key: 'yearsInBusiness', label: 'Years in Business', icon: <TimelineIcon sx={{ fontSize: 20 }} />, color: B.navyMid, bg: '#e8eef7' },
  { key: 'clientRating', label: 'Client Rating', icon: <StarHalfIcon sx={{ fontSize: 20 }} />, color: '#d97706', bg: '#fef3c7' },
  { key: 'completedProjects', label: 'Completed Projects', icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />, color: B.green, bg: B.greenLight },
  { key: 'certifications', label: 'Certifications', icon: <WorkspacePremiumIcon sx={{ fontSize: 20 }} />, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'awards', label: 'Awards Won', icon: <EmojiEventsIcon sx={{ fontSize: 20 }} />, color: B.orange, bg: '#fff7ed' },
]

function SellerStats({ yearsInBusiness, clientRating, completedProjects, certifications, awards }: StatsProps) {
  const values: Record<string, string | number> = {
    yearsInBusiness: yearsInBusiness ? `${yearsInBusiness}+` : '—',
    clientRating: clientRating || '—',
    completedProjects: completedProjects || '—',
    certifications: certifications || '—',
    awards: awards || '—',
  }

  return (
    <Box
      sx={{
        bgcolor: B.white,
        border: `1px solid ${B.slate200}`,
        borderRadius: '16px',
        p: { xs: 2, md: 2.5 },
        mb: 3,
        boxShadow: '0 2px 12px rgba(12,30,60,.05)',
      }}
    >
      <Grid container spacing={0}>
        {STAT_CFG.map(({ key, label, icon, color, bg }, i) => (
          <Grid item xs={6} sm={4} md key={key}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: { xs: 1.5, md: 2 },
                position: 'relative',
                '&::after': i < STAT_CFG.length - 1
                  ? {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '20%',
                    height: '60%',
                    width: '1px',
                    bgcolor: B.slate200,
                    display: { xs: 'none', md: 'block' },
                  }
                  : {},
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  mb: 1.2,
                }}
              >
                {icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: B.font,
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  color,
                  lineHeight: 1,
                  mb: 0.4,
                }}
              >
                {values[key]}
              </Typography>
              <Typography sx={{ fontFamily: B.font, fontSize: '0.72rem', color: B.slate400, fontWeight: 500, lineHeight: 1.3 }}>
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
function SellerAbout({ aboutUs }: { aboutUs?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!aboutUs) return null

  return (
    <Box
      sx={{
        bgcolor: B.white,
        border: `1px solid ${B.slate200}`,
        borderRadius: '16px',
        p: { xs: 2.5, md: 3 },
        mb: 3,
        boxShadow: '0 2px 12px rgba(12,30,60,.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: '#e8eef7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: B.navyMid,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: B.font, fontWeight: 800, fontSize: '1.05rem', color: B.navy }}>
          About Us
        </Typography>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: B.slate100 }} />

      <Box
        sx={{
          maxHeight: expanded ? 'none' : '140px',
          overflow: 'hidden',
          position: 'relative',
          '&::after': !expanded
            ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: `linear-gradient(to top, ${B.white}, transparent)`,
            }
            : {},
        }}
      >
        <Typography
          component="div"
          sx={{
            fontFamily: B.font,
            fontSize: '0.9rem',
            color: B.slate600,
            lineHeight: 1.85,
            '& p': { mb: 1.5 },
            '& ul, & ol': { pl: 2.5, mb: 1.5 },
            '& li': { mb: 0.5 },
          }}
          dangerouslySetInnerHTML={{ __html: aboutUs }}
        />
      </Box>

      <Button
        size="small"
        onClick={() => setExpanded(!expanded)}
        sx={{
          mt: 1.5,
          fontFamily: B.font,
          fontWeight: 700,
          textTransform: 'none',
          color: B.navyMid,
          fontSize: '0.82rem',
          px: 0,
          '&:hover': { bgcolor: 'transparent', color: B.orange },
        }}
      >
        {expanded ? 'Show Less ↑' : 'Read More ↓'}
      </Button>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PRODUCTS & SERVICES
// ─────────────────────────────────────────────────────────────────────────────
function SellerServices({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null

  return (
    <Box
      sx={{
        bgcolor: B.white,
        border: `1px solid ${B.slate200}`,
        borderRadius: '16px',
        p: { xs: 2.5, md: 3 },
        mb: 3,
        boxShadow: '0 2px 12px rgba(12,30,60,.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: B.orange,
          }}
        >
          <InventoryIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: B.font, fontWeight: 800, fontSize: '1.05rem', color: B.navy }}>
          Products & Services
        </Typography>
        <Chip
          label={`${products.length} items`}
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: B.slate100,
            color: B.slate600,
            fontFamily: B.font,
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
          }}
        />
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: B.slate100 }} />

      <Grid container spacing={2}>
        {products.map((product) => {
          const price = product?.price_range?.minimum_price?.regular_price?.value
          return (
            <Grid item xs={12} sm={6} md={4} key={product.uid}>
              <Box
                sx={{
                  border: `1.5px solid ${B.slate200}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.24s ease',
                  '&:hover': {
                    borderColor: B.orange,
                    boxShadow: `0 8px 28px rgba(249,115,22,.12)`,
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: B.slate50,
                    borderBottom: `1px solid ${B.slate100}`,
                  }}
                >
                  <Box
                    component="img"
                    src={product?.small_image?.url || '/images/placeholder-product.png'}
                    alt={product?.name}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'contain',
                      p: 1.5,
                    }}
                  />
                  {product?.categories?.length > 0 && (
                    <Chip
                      label={product.categories[0].name}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: B.navy,
                        color: B.white,
                        fontFamily: B.font,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20,
                        borderRadius: '6px',
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component="a"
                    href={`/${product.url_key}.html`}
                    sx={{
                      fontFamily: B.font,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: B.navy,
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.55em',
                      textDecoration: 'none',
                      mb: 0.75,
                      '&:hover': { color: B.orange },
                    }}
                  >
                    {product.name}
                  </Typography>

                  {product.location && (
                    <Typography
                      sx={{
                        fontFamily: B.font,
                        fontSize: '0.75rem',
                        color: B.slate400,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                      }}
                    >
                      <LocationOnOutlinedIcon sx={{ fontSize: 13 }} /> {product.location}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `1px solid ${B.slate100}`,
                    }}
                  >
                    {price ? (
                      <Typography sx={{ fontFamily: B.font, fontWeight: 800, color: B.green, fontSize: '1rem' }}>
                        ₹{price.toLocaleString('en-IN')}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontFamily: B.font, fontSize: '0.78rem', color: B.slate400, fontStyle: 'italic' }}>
                        Price on request
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
                      sx={{
                        fontFamily: B.font,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 1.5,
                        height: 30,
                        borderColor: B.navyMid,
                        color: B.navyMid,
                        '&:hover': { borderColor: B.orange, color: B.orange, bgcolor: '#fff7ed' },
                      }}
                    >
                      Get Price
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_REVIEWS = [
  {
    name: 'Robert Karmazov',
    company: 'TechBridge Solutions',
    rating: 5,
    comment: 'Exceptional quality and timely delivery. Their team was highly professional throughout the project lifecycle. Would strongly recommend for B2B procurement.',
    date: '20 days ago',
  },
  {
    name: 'Nilesh Shah',
    company: 'Apex Industries',
    rating: 5,
    comment: 'Outstanding experience. Their product range is comprehensive and the support team resolved our queries promptly. Excellent after-sales service.',
    date: '1 month ago',
  },
  {
    name: 'Edna Watson',
    company: 'Global Trade Co.',
    rating: 4,
    comment: 'Very reliable vendor. Products meet our quality standards. Minor delays in one shipment, but communication was transparent throughout.',
    date: '8 months ago',
  },
]

function SellerReviews({ averageRating, totalReviews }: { averageRating: number; totalReviews: number }) {
  const [userRating, setUserRating] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userComment, setUserComment] = useState('')

  const ratingDist = [5, 4, 3, 2, 1].map(
    (star) => (SAMPLE_REVIEWS.filter((r) => r.rating === star).length / SAMPLE_REVIEWS.length) * 100
  )

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const AVATAR_COLORS = [B.navyMid, '#7c3aed', B.orange, B.green, '#be185d']

  return (
    <Box
      sx={{
        bgcolor: B.white,
        border: `1px solid ${B.slate200}`,
        borderRadius: '16px',
        p: { xs: 2.5, md: 3 },
        mb: 3,
        boxShadow: '0 2px 12px rgba(12,30,60,.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: '#fef3c7', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#d97706',
          }}
        >
          <ReviewsOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: B.font, fontWeight: 800, fontSize: '1.05rem', color: B.navy }}>
          Customer Reviews
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, borderColor: B.slate100 }} />

      <Grid container spacing={3}>
        {/* Rating summary */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyMid} 100%)`,
              mb: 2,
            }}
          >
            <Typography sx={{ fontFamily: B.font, fontWeight: 800, fontSize: '3.5rem', color: B.white, lineHeight: 1 }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating
              value={averageRating}
              precision={0.5}
              readOnly
              sx={{
                mt: 0.5, mb: 0.5,
                '& .MuiRating-iconFilled': { color: '#fbbf24' },
                '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,.25)' },
              }}
            />
            <Typography sx={{ fontFamily: B.font, fontSize: '0.78rem', color: 'rgba(255,255,255,.65)' }}>
              Based on {totalReviews} verified reviews
            </Typography>
          </Box>

          <Box sx={{ px: 0.5 }}>
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9 }}>
                <Typography sx={{ fontFamily: B.font, fontSize: '0.75rem', fontWeight: 700, color: B.slate600, width: 10 }}>
                  {star}
                </Typography>
                <StarIcon sx={{ fontSize: 12, color: '#fbbf24' }} />
                <LinearProgress
                  variant="determinate"
                  value={ratingDist[idx]}
                  sx={{
                    flex: 1, height: 7, borderRadius: 4, bgcolor: B.slate100,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: star >= 4 ? B.green : star === 3 ? '#f59e0b' : '#ef4444',
                    },
                  }}
                />
                <Typography sx={{ fontFamily: B.font, fontSize: '0.72rem', color: B.slate400, width: 28 }}>
                  {Math.round(ratingDist[idx])}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Write review */}
        <Grid item xs={12} md={8}>
          <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.95rem', color: B.navy, mb: 2 }}>
            Write a Review
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography sx={{ fontFamily: B.font, fontSize: '0.85rem', color: B.slate600 }}>Your Rating</Typography>
            <Rating
              value={userRating}
              onChange={(_, v) => setUserRating(v)}
              sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }}
            />
          </Box>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Name" value={userName}
                onChange={(e) => setUserName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: B.font } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Email" type="email" value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: B.font } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={3} size="small" value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your experience with this seller…"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: B.font } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                  borderRadius: '10px', px: 3, bgcolor: B.navy, boxShadow: 'none',
                  '&:hover': { bgcolor: B.navyMid, boxShadow: 'none' },
                }}
              >
                Submit Review
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Review cards */}
      <Box mt={3.5}>
        <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.95rem', color: B.navy, mb: 2 }}>
          Customer Feedback
        </Typography>
        <Grid container spacing={2}>
          {SAMPLE_REVIEWS.map((r, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box
                sx={{
                  p: 2.5,
                  border: `1.5px solid ${B.slate200}`,
                  borderRadius: '14px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: B.navyMid,
                    boxShadow: `0 6px 20px rgba(12,30,60,.08)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <FormatQuoteIcon sx={{ color: B.orangeLight, fontSize: 30, mb: 0.5 }} />
                <Typography
                  sx={{ fontFamily: B.font, fontSize: '0.85rem', color: B.slate600, flex: 1, lineHeight: 1.75, mb: 2 }}
                >
                  {r.comment}
                </Typography>
                <Rating value={r.rating} readOnly size="small" sx={{ mb: 1.2, '& .MuiRating-iconFilled': { color: '#fbbf24' } }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 34, height: 34, fontSize: '0.72rem', fontWeight: 700,
                      bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      fontFamily: B.font,
                    }}
                  >
                    {initials(r.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.82rem', color: B.navy, display: 'block' }}>
                      {r.name}
                    </Typography>
                    {r.company && (
                      <Typography sx={{ fontFamily: B.font, fontSize: '0.72rem', color: B.slate400 }}>
                        {r.company}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontFamily: B.font, fontSize: '0.7rem', color: B.slate400 }}>{r.date}</Typography>
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
interface ReachUsProps {
  address: string; city: string; state: string
  country: string; pincode: string; gstNumber?: string
  googleMapUrl?: string; directionsUrl?: string
}

function SellerReachUs({ address, city, state, country, pincode, gstNumber, googleMapUrl, directionsUrl }: ReachUsProps) {
  return (
    <Box
      sx={{
        bgcolor: B.white, border: `1px solid ${B.slate200}`,
        borderRadius: '16px', p: { xs: 2.5, md: 3 }, mb: 3,
        boxShadow: '0 2px 12px rgba(12,30,60,.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '10px', bgcolor: '#e8eef7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: B.navyMid,
          }}
        >
          <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: B.font, fontWeight: 800, fontSize: '1.05rem', color: B.navy }}>
          Reach Us
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, borderColor: B.slate100 }} />

      <Grid container spacing={3}>
        {/* Address + Map */}
        <Grid item xs={12} md={5}>
          <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.9rem', color: B.navy, mb: 1.5 }}>
            Office Address
          </Typography>
          <Box
            sx={{
              p: 2, bgcolor: B.slate50, borderRadius: '12px',
              border: `1px solid ${B.slate200}`, mb: 2,
            }}
          >
            <Typography sx={{ fontFamily: B.font, fontSize: '0.88rem', color: B.slate600, lineHeight: 1.9 }}>
              {address}<br />{city}, {state}<br />{country} – {pincode}
            </Typography>
            {gstNumber && (
              <Chip
                label={`GST: ${gstNumber}`}
                size="small"
                variant="outlined"
                sx={{ mt: 1.5, fontFamily: B.font, fontSize: '0.7rem', fontWeight: 600, borderColor: B.slate200 }}
              />
            )}
          </Box>

          {directionsUrl && (
            <Button
              variant="outlined"
              startIcon={<DirectionsOutlinedIcon />}
              href={directionsUrl}
              target="_blank"
              sx={{
                fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                borderRadius: '10px', mb: 2, borderColor: B.navyMid, color: B.navyMid,
                '&:hover': { borderColor: B.orange, color: B.orange, bgcolor: '#fff7ed' },
              }}
            >
              Get Directions
            </Button>
          )}

          <Box
            sx={{
              width: '100%', height: 190, borderRadius: '12px',
              border: `1px solid ${B.slate200}`, overflow: 'hidden',
              bgcolor: B.slate100,
            }}
          >
            {googleMapUrl ? (
              <iframe
                title="Seller Location" src={googleMapUrl}
                width="100%" height="190" style={{ border: 0 }}
                allowFullScreen loading="lazy"
              />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontFamily: B.font, fontSize: '0.82rem', color: B.slate400 }}>
                  Map not available
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Inquiry form */}
        <Grid item xs={12} md={7}>
          <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.9rem', color: B.navy, mb: 2 }}>
            Send an Inquiry
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { label: 'Your Name *', type: 'text', sm: 6 },
              { label: 'Email Address', type: 'email', sm: 6 },
              { label: 'Phone Number', type: 'tel', sm: 6 },
              { label: 'Subject', type: 'text', sm: 6 },
            ].map(({ label, type, sm }) => (
              <Grid item xs={12} sm={sm} key={label}>
                <TextField
                  fullWidth size="small" label={label} type={type}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: B.font } }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={4} size="small" label="Message"
                placeholder="Describe your requirement in detail…"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: B.font } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                  borderRadius: '10px', px: 3.5, py: 1.1,
                  bgcolor: B.orange, boxShadow: '0 4px 14px rgba(249,115,22,.3)',
                  '&:hover': { bgcolor: B.orangeDark, boxShadow: '0 6px 18px rgba(249,115,22,.35)' },
                }}
              >
                Submit Inquiry
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SIDEBAR (sticky right column)
// ─────────────────────────────────────────────────────────────────────────────
function SellerSidebar({
  storeName, phone, email, gstNumber, location,
  onInquiry, onAbout, onProducts, onReviews, onReachUs,
}: {
  storeName: string; phone?: string; email?: string
  gstNumber?: string; location?: string
  onInquiry: () => void; onAbout: () => void
  onProducts: () => void; onReviews: () => void; onReachUs: () => void
}) {
  return (
    <Box sx={{ position: 'sticky', top: 110 }}>
      {/* Quick Contact */}
      <Box
        sx={{
          bgcolor: B.white, border: `1px solid ${B.slate200}`,
          borderRadius: '16px', overflow: 'hidden', mb: 2,
          boxShadow: '0 2px 12px rgba(12,30,60,.06)',
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(118deg, ${B.navy} 0%, ${B.navyMid} 100%)`,
            px: 2.5, py: 2,
          }}
        >
          <Typography sx={{ fontFamily: B.font, fontWeight: 800, color: B.white, fontSize: '0.95rem' }}>
            Quick Contact
          </Typography>
          <Typography sx={{ fontFamily: B.font, fontSize: '0.75rem', color: 'rgba(255,255,255,.6)', mt: 0.3 }}>
            {storeName}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 15, color: B.slate400, mt: 0.15, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: B.font, fontSize: '0.8rem', color: B.slate600, lineHeight: 1.5 }}>
                {location}
              </Typography>
            </Box>
          )}
          {gstNumber && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontFamily: B.font, fontSize: '0.72rem', color: B.slate400, mb: 0.3 }}>
                GST Number
              </Typography>
              <Typography sx={{ fontFamily: B.font, fontSize: '0.82rem', color: B.navy, fontWeight: 600 }}>
                {gstNumber}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2, borderColor: B.slate100 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              onClick={onInquiry}
              startIcon={<SendOutlinedIcon sx={{ fontSize: '15px !important' }} />}
              sx={{
                fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                borderRadius: '10px', py: 1.1, bgcolor: B.orange, color: B.white,
                boxShadow: 'none',
                '&:hover': { bgcolor: B.orangeDark, boxShadow: 'none' },
              }}
            >
              Send Inquiry
            </Button>
            {phone && (
              <Button
                fullWidth variant="contained"
                startIcon={<PhoneIcon sx={{ fontSize: '15px !important' }} />}
                href={`tel:${phone}`}
                sx={{
                  fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                  borderRadius: '10px', py: 1.1, bgcolor: B.navy, boxShadow: 'none',
                  '&:hover': { bgcolor: B.navyMid, boxShadow: 'none' },
                }}
              >
                Call Now
              </Button>
            )}
            {email && (
              <Button
                fullWidth variant="outlined"
                startIcon={<EmailIcon sx={{ fontSize: '15px !important' }} />}
                href={`mailto:${email}`}
                sx={{
                  fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                  borderRadius: '10px', py: 1.1, borderColor: B.slate200, color: B.navy,
                  '&:hover': { borderColor: B.navyMid, bgcolor: B.slate50 },
                }}
              >
                Email Us
              </Button>
            )}
            {phone && (
              <Button
                fullWidth variant="outlined"
                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                target="_blank"
                startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  fontFamily: B.font, fontWeight: 700, textTransform: 'none',
                  borderRadius: '10px', py: 1.1, borderColor: '#dcfce7', color: B.green,
                  bgcolor: '#f0fdf4',
                  '&:hover': { borderColor: B.green, bgcolor: B.greenLight },
                }}
              >
                WhatsApp
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          bgcolor: B.white, border: `1px solid ${B.slate200}`,
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(12,30,60,.06)',
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${B.slate100}` }}>
          <Typography sx={{ fontFamily: B.font, fontWeight: 700, fontSize: '0.85rem', color: B.navy }}>
            Our Company
          </Typography>
        </Box>
        {[
          { label: 'About Us', fn: onAbout },
          { label: 'Products & Services', fn: onProducts },
          { label: 'Reviews & Rating', fn: onReviews },
          { label: 'Reach Us', fn: onReachUs },
        ].map(({ label, fn }, i, arr) => (
          <Box
            key={label}
            onClick={fn}
            sx={{
              px: 2.5, py: 1.4,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: i < arr.length - 1 ? `1px solid ${B.slate100}` : 'none',
              '&:hover': { bgcolor: B.slate50, color: B.orange },
              transition: 'all 0.15s',
            }}
          >
            <Typography sx={{ fontFamily: B.font, fontSize: '0.85rem', fontWeight: 500, color: 'inherit' }}>
              {label}
            </Typography>
            <Box component="span" sx={{ fontSize: '1rem', color: B.slate400 }}>›</Box>
          </Box>
        ))}
        <Divider sx={{ borderColor: B.slate100 }} />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth variant="outlined"
            sx={{
              fontFamily: B.font, fontWeight: 700, textTransform: 'none',
              borderRadius: '10px', borderColor: B.orange, color: B.orange,
              '&:hover': { bgcolor: '#fff7ed', borderColor: B.orangeDark },
            }}
          >
            Download Brochure
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function SellerFooter({ storeName }: { storeName: string }) {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        background: `linear-gradient(118deg, ${B.navy} 0%, ${B.navyMid} 100%)`,
        borderTop: `1px solid rgba(255,255,255,.08)`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: B.font, fontWeight: 700, color: B.white, fontSize: '0.9rem' }}>
              {storeName}
            </Typography>
            <Typography sx={{ fontFamily: B.font, fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', mt: 0.3 }}>
              © {new Date().getFullYear()} All rights reserved.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedIcon sx={{ fontSize: 16, color: B.green }} />
            <Typography sx={{ fontFamily: B.font, fontSize: '0.8rem', color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>
              Verified B2B Marketplace
            </Typography>
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
  const reachUsRef = useRef<HTMLDivElement>(null)

  const sectionRefs = [overviewRef, productsRef, reviewsRef, reachUsRef]
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const offset = 130
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
    const top = ref.current.getBoundingClientRect().top + window.scrollY - 120
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const { data: storeData, loading: storeLoading, error: storeError } = useQuery(
    VendorStoresDocument,
    { variables: { store_code: String(store_code), status: 1 } }
  )

  const store = storeData?.vendorStores?.[0]

  const { data: productData, loading: productsLoading } = useQuery(
    SellerProductsDocument,
    { variables: { seller: String(store?.customer_id) }, skip: !store?.customer_id }
  )

  if (storeLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: B.slate50 }}>
        <Typography sx={{ fontFamily: B.font, color: B.slate400 }}>Loading seller profile…</Typography>
      </Box>
    )
  }
  if (storeError || !store) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: B.slate50 }}>
        <Typography sx={{ fontFamily: B.font, color: B.slate400 }}>
          {storeError ? 'Error loading seller' : 'Seller not found'}
        </Typography>
      </Box>
    )
  }

  const location = [store.city, store.state].filter(Boolean).join(', ')

  return (
    <>
      <Head>
        <title>{store.store_name} | QTYBID B2B Marketplace</title>
        <meta name="description" content={`${store.store_name} — Verified B2B Supplier on QTYBID`} />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: B.slate50, fontFamily: B.font }}>

        {/* ══ STICKY HEADER ══ */}
        <SellerHeader
          data={{
            storeName: store.store_name || '',
            gstNumber: store.gst_number || '',
            yearsInBusiness: store.years_in_business || 0,
            trustSeal: store.trust_seal || false,
            phone: store.phone || '',
            email: store.email || '',
            logoUrl: store.logo || '',
            rating: 4.5,
            ratingCount: 93,
            responseRate: 71,
            city: store.city || '',
            state: store.state || '',
          }}
          activeSection={activeSection}
          onNavClick={scrollToSection}
        />

        {/* ══ HERO BANNER ══ */}
        <SellerHeroBanner
          storeName={store.store_name || ''}
          tagline='Quality products. Reliable supply. Trusted by businesses.'
          phone={store.phone || ''}
          onInquiry={() => scrollToSection(3)}
        />

        {/* ══ MAIN LAYOUT ══ */}
        <Container maxWidth="lg" sx={{ pb: 6 }}>
          <Grid container spacing={3}>

            {/* ── LEFT: main content ── */}
            <Grid item xs={12} md={9}>

              {/* OVERVIEW: Stats + About */}
              <div ref={overviewRef}>
                <SellerStats
                  yearsInBusiness={store.years_in_business || 0}
                  clientRating="4.5"
                  completedProjects={store.completed_projects || '500+'}
                  certifications={store.certifications || 'ISO 9001'}
                  awards={store.awards || '3'}
                />
                <SellerAbout aboutUs={store.about_us} />
              </div>

              {/* PRODUCTS */}
              <div ref={productsRef}>
                {productsLoading ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: B.font, color: B.slate400 }}>Loading products…</Typography>
                  </Box>
                ) : productData?.products?.items?.length ? (
                  <SellerServices products={productData.products.items} />
                ) : (
                  <Box
                    sx={{
                      bgcolor: B.white, border: `1px solid ${B.slate200}`,
                      borderRadius: '16px', p: 4, mb: 3, textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontFamily: B.font, color: B.slate400 }}>
                      No products listed yet.
                    </Typography>
                  </Box>
                )}
              </div>

              {/* REVIEWS */}
              <div ref={reviewsRef}>
                <SellerReviews averageRating={4.5} totalReviews={93} />
              </div>

              {/* REACH US */}
              <div ref={reachUsRef}>
                <SellerReachUs
                  address={store.address || ''}
                  city={store.city || ''}
                  state={store.state || ''}
                  country={store.country || 'India'}
                  pincode={store.pincode || ''}
                  gstNumber={store.gst_number || ''}
                  googleMapUrl=''
                  directionsUrl=''
                />
              </div>
            </Grid>

            {/* ── RIGHT: sticky sidebar ── */}
            <Grid item xs={12} md={3}>
              <SellerSidebar
                storeName={store.store_name || ''}
                phone={store.phone || ''}
                email={store.email || ''}
                gstNumber={store.gst_number || ''}
                location={location}
                onInquiry={() => scrollToSection(3)}
                onAbout={() => scrollToSection(0)}
                onProducts={() => scrollToSection(1)}
                onReviews={() => scrollToSection(2)}
                onReachUs={() => scrollToSection(3)}
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