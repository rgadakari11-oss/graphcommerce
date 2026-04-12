import {
  Paper,
  Avatar,
  Typography,
  Button,
  Chip,
  Box,
  Container,
  Tab,
  Tabs,
  useTheme,
  useScrollTrigger,
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import StarIcon from '@mui/icons-material/Star'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import { SellerHeaderData } from './types'

interface Props {
  data: SellerHeaderData
  activeSection: number
  onNavClick: (index: number) => void
}

const NAV_ITEMS = ['Overview', 'Products & Services', 'Reviews', 'Reach Us']

export default function SellerHeader({ data, activeSection, onNavClick }: Props) {
  const theme = useTheme()
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 80 })

  const {
    storeName,
    gstNumber,
    yearsInBusiness,
    trustSeal,
    phone,
    email,
    logoUrl,
    rating,
    ratingCount,
    responseRate,
  } = data

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'background.paper',
        boxShadow: trigger
          ? '0 2px 12px rgba(0,0,0,0.10)'
          : '0 1px 0 rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* ── TOP STRIP ── */}
      <Box
        sx={{
          borderBottom: `1px solid`,
          borderColor: 'divider',
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, md: 2.5 },
              flexWrap: 'wrap',
            }}
          >
            {/* LOGO */}
            <Avatar
              src={logoUrl}
              sx={{
                width: { xs: 52, md: 64 },
                height: { xs: 52, md: 64 },
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                fontSize: '1.6rem',
                fontWeight: 700,
                border: `2px solid ${theme.palette.primary.light}`,
                flexShrink: 0,
              }}
            >
              {!logoUrl && storeName?.[0]}
            </Avatar>

            {/* STORE INFO */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: 'text.primary',
                    lineHeight: 1.2,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }}
                >
                  {storeName}
                </Typography>
                {trustSeal && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <VerifiedIcon
                      sx={{ fontSize: 18, color: theme.palette.primary.main }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      TrustSEAL Verified
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* META CHIPS */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mt: 0.5,
                }}
              >
                {gstNumber && (
                  <Chip
                    label={`GST: ${gstNumber}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500, fontSize: '0.7rem', height: 22 }}
                  />
                )}
                {yearsInBusiness > 0 && (
                  <Chip
                    label={`${yearsInBusiness} yrs in business`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500, fontSize: '0.7rem', height: 22 }}
                  />
                )}
                {responseRate > 0 && (
                  <Chip
                    label={`${responseRate}% Response Rate`}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 22,
                      bgcolor: 'success.50',
                      color: 'success.dark',
                      border: '1px solid',
                      borderColor: 'success.light',
                    }}
                  />
                )}
                {rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <StarIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight={600}>
                      {rating}
                    </Typography>
                    {ratingCount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ({ratingCount} reviews)
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* CTA BUTTONS */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexShrink: 0,
                ml: 'auto',
              }}
            >
              {phone && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PhoneIcon sx={{ fontSize: '14px !important' }} />}
                  href={`tel:${phone}`}
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    px: 2,
                    height: 36,
                    borderRadius: 1.5,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
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
                    fontWeight: 700,
                    fontSize: 13,
                    px: 2,
                    height: 36,
                    borderRadius: 1.5,
                  }}
                >
                  Email
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── STICKY NAV TABS ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Tabs
            value={activeSection}
            onChange={(_, v) => onNavClick(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: 0.3,
                textTransform: 'none',
                color: 'text.secondary',
                px: { xs: 2, md: 3 },
                '&.Mui-selected': { color: 'primary.main' },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
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