import * as React from 'react'
import { useQuery } from '@graphcommerce/graphql'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
  { label: 'How QtyBiz works', href: '/service/how-it-works' },
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
    icon: <VerifiedIcon sx={{ fontSize: 12, color: '#1976d2' }} />,
    label: 'GST verified sellers',
  },
  {
    icon: <HandshakeOutlinedIcon sx={{ fontSize: 12, color: '#1976d2' }} />,
    label: 'Genuine trade leads',
  },
  {
    icon: <StorefrontOutlinedIcon sx={{ fontSize: 12, color: '#1976d2' }} />,
    label: 'No middlemen',
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 12, color: '#1976d2' }} />,
    label: 'Direct from manufacturer',
  },
]

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#111827',
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
        fontSize: '12px',
        color: '#6b7280',
        mb: 0.8,
        '&:hover': { color: '#1976d2' },
      }}
    >
      {label}
    </Link>
  )
}

export function Footer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [expanded, setExpanded] = React.useState<string | false>('marketplace')

  const handleChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        pt: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>

          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Typography sx={{ fontSize: '16px', fontWeight: 700, mb: 1 }}>
              QtyBiz
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
              {trustBadges.map((badge) => (
                <Box
                  key={badge.label}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    bgcolor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '16px',
                    px: 1,
                    py: 0.4,
                  }}
                >
                  {badge.icon}
                  <Typography sx={{ fontSize: '11px', color: '#1d4ed8' }}>
                    {badge.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" gap={0.75}>
              {[
                { icon: <LinkedInIcon sx={{ fontSize: 14 }} />, href: 'https://linkedin.com' },
                { icon: <TwitterIcon sx={{ fontSize: 14 }} />, href: 'https://x.com' },
                { icon: <WhatsAppIcon sx={{ fontSize: 14 }} />, href: 'https://wa.me' },
              ].map((s, i) => (
                <IconButton key={i} component="a" href={s.href} size="small">
                  {s.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Mobile Accordion */}
          {isMobile ? (
            <Grid item xs={12}>

              <Accordion expanded={expanded === 'marketplace'} onChange={handleChange('marketplace')} elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ColTitle>Marketplace</ColTitle>
                </AccordionSummary>
                <AccordionDetails>
                  {marketplaceLinks.map((l) => <FooterLink key={l.href} {...l} />)}
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === 'sell'} onChange={handleChange('sell')} elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ColTitle>Sell on QtyBiz</ColTitle>
                </AccordionSummary>
                <AccordionDetails>
                  {sellerLinks.map((l) => <FooterLink key={l.href} {...l} />)}
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === 'support'} onChange={handleChange('support')} elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ColTitle>Support</ColTitle>
                </AccordionSummary>
                <AccordionDetails>
                  {supportLinks.map((l) => <FooterLink key={l.href} {...l} />)}
                </AccordionDetails>
              </Accordion>

            </Grid>
          ) : (
            <>
              <Grid item xs={6} sm={4} md={2.5}>
                <ColTitle>Marketplace</ColTitle>
                {marketplaceLinks.map((l) => <FooterLink key={l.href} {...l} />)}
              </Grid>

              <Grid item xs={6} sm={4} md={3}>
                <ColTitle>Sell</ColTitle>
                {sellerLinks.map((l) => <FooterLink key={l.href} {...l} />)}
              </Grid>

              <Grid item xs={6} sm={4} md={3}>
                <ColTitle>Support</ColTitle>
                {supportLinks.map((l) => <FooterLink key={l.href} {...l} />)}
              </Grid>
            </>
          )}
        </Grid>

        {/* Bottom */}
        <Box
          sx={{
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>
            © {new Date().getFullYear()} QtyBiz, All rights reserved.
          </Typography>

          <Stack direction="row" gap={1.5}>
            {bottomLinks.map((l) => (
              <Link key={l.href} href={l.href} sx={{ fontSize: '11px', color: '#9ca3af' }}>
                {l.label}
              </Link>
            ))}
          </Stack>
        </Box>

      </Container>
    </Box>
  )
}