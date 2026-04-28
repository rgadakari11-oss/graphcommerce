import {
  AccountMenu,
  AccountMenuItem,
} from '@graphcommerce/magento-customer'
import {
  iconEmailOutline,
  iconShutdown,
  iconShoppingBag,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  Badge,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from '@mui/material'
import { useRouter } from 'next/router'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountCircle from '@mui/icons-material/AccountCircle'
import StorefrontIcon from '@mui/icons-material/Storefront'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import InventoryIcon from '@mui/icons-material/Inventory'
import LogoutIcon from '@mui/icons-material/Logout'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { IdentifyCustomerDocument } from '../../graphql/account/IdentifyCustomer.gql'
import { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { CustomSignOutForm } from './CustomSignOutForm'


// 🔐 Seller auth localStorage helpers
const SELLER_AUTH_KEY = 'seller-auth'

type SellerAuth = {
  email: string
  is_seller: boolean
  entity_id: string
}

const getSellerAuth = (): SellerAuth | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SELLER_AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const setSellerAuth = (data: SellerAuth) => {
  localStorage.setItem(SELLER_AUTH_KEY, JSON.stringify(data))
}

const clearSellerAuth = () => {
  localStorage.removeItem(SELLER_AUTH_KEY)
}

type Props = {
  children: React.ReactNode
}

const getCustomerEmailFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const cache = localStorage.getItem('apollo-cache-persist')
    if (!cache) return null
    const parsed = JSON.parse(cache)
    return (
      parsed?.ROOT_QUERY?.customer?.__ref &&
      parsed?.[parsed.ROOT_QUERY.customer.__ref]?.email
    ) || null
  } catch (e) {
    console.error('Failed to read customer email', e)
    return null
  }
}

export function SellerAccountLayout({ children }: Props) {
  const router = useRouter()
  const currentPath = router.pathname
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [identifyCustomer] = useMutation(IdentifyCustomerDocument)

  useEffect(() => {
    const email = getCustomerEmailFromLocalStorage()
    if (!email) {
      router.replace('/account')
      return
    }

    const storedSellerAuth = getSellerAuth()

    if (storedSellerAuth && storedSellerAuth.email === email && storedSellerAuth.is_seller === true) return

    if (storedSellerAuth && storedSellerAuth.email === email && storedSellerAuth.is_seller === false) {
      router.replace('/account')
      return
    }

    identifyCustomer({ variables: { email } })
      .then((res) => {
        const result = res.data?.identifyCustomer
        if (!result?.success || result.is_seller !== true) {
          router.replace('/account')
        }
        const isSeller = result?.is_seller === true
        setSellerAuth({ email, is_seller: isSeller, entity_id: result?.entity_id ?? '' })
      })
      .catch((error) => {
        console.error('IdentifyCustomer error', error)
        router.replace('/account')
      })
  }, [identifyCustomer, router])

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/')

  const menuItems = [
    { href: '/seller/profile', icon: AccountCircle, title: 'Profile', badge: null },
    { href: '/seller/inquiries', icon: MailOutlineIcon, title: 'Inquiries', badge: null },
    { href: '/seller/quotes', icon: RequestQuoteIcon, title: 'Quotes', badge: null },
    { href: '/seller/products', icon: InventoryIcon, title: 'Products', badge: null },
  ]

  // The currently active menu item (for the dropdown label)
  const activeItem = menuItems.find((item) => isActive(item.href)) ?? menuItems[0]

  // ── Mobile top dropdown nav ───────────────────────────────────────────────
  const MobileNav = () => (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha('#e2e8f0', 0.8),
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      {/* Brand strip */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderBottom: '1px solid',
          borderColor: alpha('#3b82f6', 0.1),
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
            flexShrink: 0,
          }}
        >
          <StorefrontIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.2 }}>
            <Trans id='Seller Hub' />
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Trans id='Pro Dashboard' />
          </Typography>
        </Box>
      </Box>

      {/* Dropdown selector */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <FormControl fullWidth size='small'>
          <Select
            value={activeItem.href}
            onChange={(e) => router.push(e.target.value as string)}
            displayEmpty
            IconComponent={ExpandMoreIcon}
            renderValue={(value) => {
              const item = menuItems.find((m) => m.href === value) ?? menuItems[0]
              const Icon = item.icon
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 17, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                    <Trans id={item.title} />
                  </Typography>
                  {item.badge && (
                    <Box
                      sx={{
                        ml: 'auto',
                        px: 0.75,
                        py: 0.1,
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        lineHeight: 1.6,
                        minWidth: 20,
                        textAlign: 'center',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </Box>
              )
            }}
            sx={{
              borderRadius: 2,
              bgcolor: '#f8fafc',
              border: '1px solid',
              borderColor: alpha('#3b82f6', 0.2),
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-icon': { color: '#3b82f6', mr: 0.5 },
              '& .MuiSelect-select': { py: 1, pl: 1.5, pr: '36px !important' },
              '&:hover': { borderColor: alpha('#3b82f6', 0.4) },
              '&.Mui-focused': { borderColor: '#3b82f6', boxShadow: `0 0 0 3px ${alpha('#3b82f6', 0.12)}` },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2.5,
                  mt: 0.75,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: alpha('#e2e8f0', 0.8),
                  overflow: 'hidden',
                },
              },
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <MenuItem
                  key={item.href}
                  value={item.href}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    mx: 0.75,
                    my: 0.25,
                    borderRadius: 1.5,
                    background: active ? alpha('#dbeafe', 0.7) : 'transparent',
                    '&:hover': { background: active ? alpha('#bfdbfe', 0.7) : alpha('#f1f5f9', 0.8) },
                    '&.Mui-selected': { background: alpha('#dbeafe', 0.7) },
                    '&.Mui-selected:hover': { background: alpha('#bfdbfe', 0.7) },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: active
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          : alpha('#94a3b8', 0.12),
                        boxShadow: active ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: active ? '#fff' : '#64748b' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: active ? 700 : 600,
                        color: active ? '#1e293b' : '#475569',
                        fontSize: '0.9rem',
                        flex: 1,
                      }}
                    >
                      <Trans id={item.title} />
                    </Typography>
                    {item.badge && (
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.1,
                          borderRadius: 999,
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          lineHeight: 1.6,
                          minWidth: 20,
                          textAlign: 'center',
                          boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </Box>
                </MenuItem>
              )
            })}

            {/* Sign out inside dropdown on mobile */}
            <Divider sx={{ my: 0.5, mx: 0.75, borderColor: alpha('#cbd5e1', 0.6) }} />
            <Box sx={{ px: 0.75, pb: 0.5 }}>
              <CustomSignOutForm
                button={({ formState }) => (
                  <Box
                    component='button'
                    type='submit'
                    disabled={formState.isSubmitting}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'background 0.2s ease',
                      '&:hover': { background: alpha('#fef2f2', 0.8) },
                      '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha('#fef2f2', 0.8),
                        flexShrink: 0,
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: '#ef4444', fontSize: '0.9rem' }}>
                      <Trans id='Sign out' />
                    </Typography>
                  </Box>
                )}
              />
            </Box>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )

  // ── Desktop sidebar (unchanged) ───────────────────────────────────────────
  const DesktopSidebar = () => (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'sticky',
        top: 20,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        border: '1px solid',
        borderColor: alpha('#e2e8f0', 0.8),
      }}
    >
      {/* Header with Brand */}
      <Box
        sx={{
          px: 2.5,
          py: 3.5,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderBottom: '1px solid',
          borderColor: alpha('#3b82f6', 0.1),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 2.5,
                padding: '2px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(37,99,235,0.4))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              },
            }}
          >
            <StorefrontIcon sx={{ color: '#fff', fontSize: 26, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          </Box>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.125rem', letterSpacing: '0.01em', lineHeight: 1.2 }}>
              <Trans id='Seller Hub' />
            </Typography>
            <Typography variant='caption' sx={{
              color: '#64748b', fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 0.5,
            }}>
              <TrendingUpIcon sx={{ fontSize: 12, color: '#3b82f6' }} />
              <Trans id='Pro Dashboard' />
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha('#cbd5e1', 0.6) }} />

      {/* Menu Items */}
      <Box sx={{ py: 2, px: 1.5 }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Box
              key={index}
              component='a'
              href={item.href}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2, py: 1.75, mb: 0.75,
                borderRadius: 2,
                textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: active ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)' : 'none',
                border: '1px solid',
                borderColor: active ? alpha('#3b82f6', 0.2) : 'transparent',
                '&::before': active ? {
                  content: '""',
                  position: 'absolute',
                  left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4, height: '60%',
                  background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
                } : {},
                '&:hover': {
                  background: active
                    ? 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)'
                    : alpha('#f1f5f9', 0.8),
                  transform: 'translateX(4px)',
                  borderColor: alpha('#3b82f6', 0.15),
                },
              }}
            >
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : alpha('#94a3b8', 0.12),
                  transition: 'all 0.3s ease',
                  boxShadow: active ? '0 4px 12px rgba(59, 130, 246, 0.25)' : 'none',
                }}
              >
                <Icon sx={{ fontSize: 20, color: active ? '#fff' : '#64748b', transition: 'all 0.3s ease' }} />
              </Box>

              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{
                  fontSize: '0.9375rem',
                  fontWeight: active ? 700 : 600,
                  color: active ? '#1e293b' : '#475569',
                  letterSpacing: '0.01em',
                }}>
                  <Trans id={item.title} />
                </Typography>
                {item.badge && (
                  <Badge badgeContent={item.badge} sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#fff', fontWeight: 700, fontSize: '0.65rem',
                      height: 20, minWidth: 20, padding: '0 6px',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                      border: '2px solid #fff',
                    },
                  }} />
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ borderColor: alpha('#cbd5e1', 0.6), mx: 1.5 }} />

      {/* Sign Out */}
      <Box sx={{ p: 1.5, pb: 2 }}>
        <CustomSignOutForm
          button={({ formState }) => (
            <Box
              component='button'
              type='submit'
              disabled={formState.isSubmitting}
              sx={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.75,
                borderRadius: 2,
                textDecoration: 'none', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'transparent',
                border: '1px solid',
                borderColor: alpha('#ef4444', 0.2),
                '&:hover': {
                  background: alpha('#fef2f2', 0.8),
                  borderColor: alpha('#ef4444', 0.3),
                  transform: 'translateX(4px)',
                },
                '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
              }}
            >
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: alpha('#fef2f2', 0.8),
                  transition: 'all 0.3s ease',
                }}
              >
                <LogoutIcon sx={{ fontSize: 20, color: '#ef4444' }} />
              </Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ef4444', letterSpacing: '0.01em' }}>
                <Trans id='Sign out' />
              </Typography>
            </Box>
          )}
        />
      </Box>

      {/* Decorative bottom gradient */}
      <Box sx={{ height: 6, background: 'linear-gradient(90deg, #dbeafe 0%, #bfdbfe 50%, #dbeafe 100%)' }} />
    </Paper>
  )

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <Container maxWidth='xl' sx={{ py: { xs: 2, md: 4 } }}>
      {isMobile ? (
        /* Mobile: dropdown nav above content, no sidebar column */
        <Box>
          <MobileNav />
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              minHeight: '400px',
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {children}
          </Paper>
        </Box>
      ) : (
        /* Desktop: original two-column layout */
        <Grid container spacing={3}>
          <Grid item md={2.5} lg={2}>
            <DesktopSidebar />
          </Grid>
          <Grid item md={9.5} lg={10}>
            <Paper
              elevation={0}
              sx={{
                p: { sm: 3, md: 4 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                minHeight: '600px',
                bgcolor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 4,
                },
              }}
            >
              {children}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}