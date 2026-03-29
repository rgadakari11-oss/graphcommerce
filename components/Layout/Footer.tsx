import { useQuery } from '@graphcommerce/graphql'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
} from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import VerifiedIcon from '@mui/icons-material/Verified'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'

const marketplaceLinks = [
  { label: 'Browse all categories', href: '/categories' },
  { label: 'Find verified suppliers', href: '/suppliers' },
  { label: 'Submit a requirement', href: '/rfq' },
  { label: 'Bulk enquiries', href: '/bulk-orders' },
  { label: 'New listings', href: '/new-arrivals' },
  { label: 'Featured sellers', href: '/featured' },
]

const sellerLinks = [
  { label: 'Register as a seller', href: '/seller/register' },
  { label: 'Seller dashboard', href: '/seller/dashboard' },
  { label: 'List your products', href: '/seller/addproduct' },
  { label: 'Manage catalogue', href: '/seller/products' },
  { label: 'Seller guidelines', href: '/seller/guidelines' },
  { label: 'Grow your business', href: '/seller/partner' },
]

const supportLinks = [
  { label: 'Help centre', href: '/service' },
  { label: 'Contact us', href: '/service/contact-us' },
  { label: 'How QTYBiz works', href: '/service/how-it-works' },
  { label: 'Buyer protection', href: '/service/buyer-protection' },
  { label: 'Report a listing', href: '/service/report' },
  { label: 'Sitemap', href: '/sitemap' },
]

const bottomLinks = [
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of use', href: '/terms' },
  { label: 'Cookie settings', href: '/cookies' },
]

const trustBadges = [
  {
    icon: <VerifiedIcon sx={{ fontSize: 13, color: '#1976d2' }} />,
    label: 'GST verified sellers',
  },
  {
    icon: <HandshakeOutlinedIcon sx={{ fontSize: 13, color: '#1976d2' }} />,
    label: 'Genuine trade leads',
  },
  {
    icon: <StorefrontOutlinedIcon sx={{ fontSize: 13, color: '#1976d2' }} />,
    label: 'No middlemen',
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 13, color: '#1976d2' }} />,
    label: 'Direct from manufacturer',
  },
]

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: '#111827',
        mb: 2,
      }}
    >
      {children}
    </Typography>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      underline="none"
      sx={{
        display: 'block',
        fontSize: '13px',
        color: '#6b7280',
        mb: 1.25,
        transition: 'color 0.15s',
        '&:hover': { color: '#1976d2' },
      }}
    >
      {label}
    </Link>
  )
}

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        pt: 6,
        pb: 0,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">

        {/* ── Main grid ── */}
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ mb: 5 }}>

          {/* Brand column */}
          <Grid item xs={12} md={3.5}>
            {/* Logo / wordmark */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#1976d2',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  Q
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  letterSpacing: '-0.02em',
                }}
              >
                QTYBiz
              </Typography>
            </Box>



            {/* Trust badges */}
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2.5 }}>
              {trustBadges.map((badge) => (
                <Box
                  key={badge.label}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    bgcolor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '20px',
                    px: 1.25,
                    py: 0.5,
                  }}
                >
                  {badge.icon}
                  <Typography sx={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 500 }}>
                    {badge.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Social */}
            <Stack direction="row" gap={1}>
              {[
                { icon: <LinkedInIcon sx={{ fontSize: 16 }} />, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: <TwitterIcon sx={{ fontSize: 15 }} />, label: 'Twitter', href: 'https://x.com' },
                { icon: <WhatsAppIcon sx={{ fontSize: 16 }} />, label: 'WhatsApp', href: 'https://wa.me' },
              ].map(({ icon, label, href }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#6b7280',
                    '&:hover': {
                      bgcolor: '#eff6ff',
                      borderColor: '#bfdbfe',
                      color: '#1976d2',
                    },
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Marketplace */}
          <Grid item xs={6} sm={4} md={2.5}>
            <ColTitle>Marketplace</ColTitle>
            {marketplaceLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </Grid>

          {/* Sell */}
          <Grid item xs={6} sm={4} md={3}>
            <ColTitle>Sell on QTYBiz</ColTitle>
            {sellerLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </Grid>

          {/* Support */}
          <Grid item xs={6} sm={4} md={3}>
            <ColTitle>Support</ColTitle>
            {supportLinks.map((l) => <FooterLink key={l.href} {...l} />)}

            {/* WhatsApp support CTA */}
            <Box
              component="a"
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                mt: 1,
                px: 1.5,
                py: 0.75,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac' },
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 14, color: '#16a34a' }} />
              <Typography sx={{ fontSize: '12px', color: '#15803d', fontWeight: 500 }}>
                Chat with us on WhatsApp
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── Stats bar ── */}
        <Box
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            px: 4,
            py: 2.5,
            mb: 4,
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {[
            { value: '10,00+', label: 'Verified suppliers' },
            { value: '10K+', label: 'Products listed' },
            { value: '20+', label: 'Industries covered' },
            { value: '30+', label: 'Cities across India' },
          ].map(({ value, label }) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#1976d2', lineHeight: 1.2 }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#9ca3af', mt: 0.25 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#e5e7eb' }} />

        {/* ── Bottom bar ── */}
        <Box
          sx={{
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '12px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} QTYBiz · Made in India 🇮🇳 · Connecting businesses, one deal at a time.
          </Typography>

          <Stack direction="row" gap={2.5} flexWrap="wrap">
            {bottomLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                underline="none"
                sx={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  '&:hover': { color: '#1976d2' },
                }}
              >
                {l.label}
              </Link>
            ))}
          </Stack>
        </Box>

      </Container>
    </Box>
  )
}