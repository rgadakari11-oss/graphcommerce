import {
  AccountMenu,
  AccountMenuItem,
} from '@graphcommerce/magento-customer'
import {
  iconBox,
  iconEmailOutline,
  iconLock,
  iconId,
  iconShutdown,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  alpha,
  Divider,
  Avatar,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { IdentifyCustomerDocument } from '../../graphql/account/IdentifyCustomer.gql'
import { CustomSignOutForm } from './CustomSignOutForm'

// MUI Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'

/* ──────────────────────────────────────────────
   🔐 Seller auth localStorage helpers
────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   📧 Read customer email from Apollo cache
────────────────────────────────────────────── */
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
  } catch {
    return null
  }
}

const formatEmailAsPhone = (email: string | null): string | null => {
  if (!email) return null
  const match = email.match(/^(\d+)@/)
  return match ? match[1] : null
}

const getCustomerNameFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const cache = localStorage.getItem('apollo-cache-persist')
    if (!cache) return null
    const parsed = JSON.parse(cache)
    const ref = parsed?.ROOT_QUERY?.customer?.__ref
    if (!ref) return null
    const customer = parsed?.[ref]
    return customer?.firstname
      ? `${customer.firstname}${customer.lastname ? ' ' + customer.lastname : ''}`
      : null
  } catch {
    return null
  }
}

type Props = {
  children: React.ReactNode
}

const menuItems = [
  {
    href: '/account/name',
    icon: PersonOutlineIcon,
    iconSrc: iconId,
    title: 'Name',
  },
  {
    href: '/account/contact',
    icon: MailOutlineIcon,
    iconSrc: iconEmailOutline,
    title: 'Contact',
  },
  {
    href: '/account/authentication',
    icon: ShieldOutlinedIcon,
    iconSrc: iconLock,
    title: 'Authentication',
  },
  {
    href: '/account/inquiries',
    icon: MailOutlineIcon,
    iconSrc: null,
    title: 'Inquiries',
  },
  {
    href: '/account/quotes',
    icon: RequestQuoteOutlinedIcon,
    iconSrc: null,
    title: 'My Quotes',
  },
]

export function AccountLayout({ children }: Props) {
  const router = useRouter()
  const currentPath = router.pathname
  const [identifyCustomer] = useMutation(IdentifyCustomerDocument)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)

  /* ──────────────────────────────────────────────
     🔐 Seller guard (INVERSE of SellerLayout)
  ────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const MAX_RETRIES = 5
      const RETRY_DELAY_MS = 600

      // Retry reading email — Apollo cache-persist may not be hydrated yet on first render
      let email: string | null = null
      let attempts = 0

      while (!email && attempts < MAX_RETRIES) {
        if (attempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
        email = getCustomerEmailFromLocalStorage()
        attempts++
      }

      if (cancelled) return

      const name = getCustomerNameFromLocalStorage()
      setCustomerEmail(email)
      setCustomerName(name)

      if (!email) {
        // Exhausted all retries — redirect to sign-in
        router.replace('/account/name')
        return
      }

      const storedSellerAuth = getSellerAuth()

      // ❌ Case 1: Known seller → redirect away from account
      if (
        storedSellerAuth &&
        storedSellerAuth.email === email &&
        storedSellerAuth.is_seller === true
      ) {
        router.replace('/seller/profile')
        return
      }

      // ✅ Case 2: Known non-seller → allow
      if (
        storedSellerAuth &&
        storedSellerAuth.email === email &&
        storedSellerAuth.is_seller === false
      ) {
        return
      }

      // 🔁 Case 3: Unknown → check via GraphQL
      identifyCustomer({ variables: { email } })
        .then((res) => {
          if (cancelled) return
          const result = res.data?.identifyCustomer
          const isSeller = result?.success === true && result.is_seller === true

          setSellerAuth({
            email,
            is_seller: isSeller,
            entity_id: result?.entity_id ?? '',
          })

          if (isSeller) {
            router.replace('/seller/profile')
          }
        })
        .catch(() => {
          // On error → stay in account
        })
    }

    run()

    return () => {
      cancelled = true
    }
  }, [identifyCustomer, router])

  const isActive = (itemPath: string) => {
    if (itemPath === '/account/name' && (currentPath === '/account' || currentPath === '/account/')) return true
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/')
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>

        {/* ─── LEFT SIDEBAR ─── */}
        <Grid item xs={12} md={2}>
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 3,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: 20,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0,0,0,0.04)',
              border: '1px solid',
              borderColor: alpha('#e2e8f0', 0.8),
            }}
          >
            {/* ── Profile Header ── */}
            <Box
              sx={{
                px: 2.5,
                py: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: '1px solid',
                borderColor: alpha('#22c55e', 0.12),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.08) 0%, transparent 60%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, position: 'relative', zIndex: 1 }}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.6)',
                  }}
                >
                  {customerName ? getInitials(customerName) : <AccountCircleOutlinedIcon sx={{ fontSize: 22 }} />}
                </Avatar>

                {/* Name + Email */}
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: '#1e293b',
                      fontSize: '0.8rem',
                      letterSpacing: '0.01em',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {customerName ?? <Trans id='My Account' />}
                  </Typography>
                  {customerEmail && (
                    <Typography
                      sx={{
                        color: '#64748b',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        mt: 0.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {formatEmailAsPhone(customerEmail) ?? customerEmail}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.4,
                      mt: 0.5,
                      px: 1,
                      py: 0.3,
                      borderRadius: 10,
                      background: alpha('#22c55e', 0.12),
                      border: '1px solid',
                      borderColor: alpha('#22c55e', 0.2),
                    }}
                  >
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 11, color: '#16a34a' }} />
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      <Trans id='Verified' />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ── Section label ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                <Trans id='My Account' />
              </Typography>
            </Box>

            {/* ── Menu Items ── */}
            <Box sx={{ py: 1.5, px: 1.5 }}>
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
                      px: 2,
                      py: 1.5,
                      mb: 0.5,
                      borderRadius: 2,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: active
                        ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                        : 'transparent',
                      boxShadow: active
                        ? '0 2px 8px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
                        : 'none',
                      border: '1px solid',
                      borderColor: active ? alpha('#22c55e', 0.25) : 'transparent',
                      '&::before': active ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '0 4px 4px 0',
                        boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
                      } : {},
                      '&:hover': {
                        background: active
                          ? 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)'
                          : alpha('#f1f5f9', 0.8),
                        transform: 'translateX(4px)',
                        borderColor: alpha('#22c55e', 0.15),
                      },
                    }}
                  >
                    {/* Icon Box */}
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: active
                          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                          : alpha('#94a3b8', 0.1),
                        transition: 'all 0.25s ease',
                        boxShadow: active ? '0 4px 12px rgba(34, 197, 94, 0.25)' : 'none',
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 17,
                          color: active ? '#fff' : '#64748b',
                          transition: 'all 0.25s ease',
                        }}
                      />
                    </Box>

                    {/* Text */}
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: active ? 700 : 600,
                        color: active ? '#1e293b' : '#475569',
                        lineHeight: 1.2,
                        letterSpacing: '0.01em',
                      }}
                    >
                      <Trans id={item.title} />
                    </Typography>
                  </Box>
                )
              })}
            </Box>

            <Divider sx={{ borderColor: alpha('#cbd5e1', 0.6), mx: 1.5 }} />

            {/* ── Sign Out ── */}
            <Box sx={{ p: 1.5, pb: 2 }}>
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
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textDecoration: 'none',
                      cursor: formState.isSubmitting ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'transparent',
                      border: '1px solid',
                      borderColor: alpha('#ef4444', 0.18),
                      opacity: formState.isSubmitting ? 0.5 : 1,
                      '&:hover': {
                        background: alpha('#fef2f2', 0.8),
                        borderColor: alpha('#ef4444', 0.3),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha('#fef2f2', 0.9),
                        flexShrink: 0,
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: 17, color: '#ef4444' }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#ef4444',
                        letterSpacing: '0.01em',
                      }}
                    >
                      <Trans id='Sign out' />
                    </Typography>
                  </Box>
                )}
              />
            </Box>

            {/* Decorative bottom bar */}
            <Box
              sx={{
                height: 5,
                background: 'linear-gradient(90deg, #dcfce7 0%, #86efac 50%, #dcfce7 100%)',
              }}
            />
          </Paper>
        </Grid>

        {/* ─── RIGHT CONTENT AREA ─── */}
        <Grid item xs={12} md={10}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              border: '1px solid',
              borderColor: alpha('#e2e8f0', 0.8),
              borderRadius: 3,
              minHeight: { xs: '400px', md: '560px' },
              bgcolor: '#ffffff',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
              },
            }}
          >
            {children}
          </Paper>
        </Grid>

      </Grid>
    </Container>
  )
}