import {
  AccountMenu,
  AccountMenuItem,
  SignOutForm,
} from '@graphcommerce/magento-customer'
import {
  LayoutHeader,
  LayoutTitle,
  iconBox,
  iconEmailOutline,
  iconHome,
  iconId,
  iconLock,
  iconPerson,
  iconShutdown,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import { Container, Grid, Paper, Box, Typography, alpha } from '@mui/material'
import { useRouter } from 'next/router'

type Props = {
  children: React.ReactNode
}

export function AccountLayout({ children }: Props) {
  const router = useRouter()
  const currentPath = router.pathname

  // Function to check if a menu item is active
  const isActive = (path: string) => currentPath === path

  return (
    <>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* LEFT SIDEBAR */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                position: { md: 'sticky' },
                top: 20,
              }}
            >
              {/* Header */}
              <Box sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
                <Typography
                  variant='overline'
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  <Trans id='Account Settings' />
                </Typography>
              </Box>

              {/* Menu Items */}
              <Box sx={{ py: 0.5 }}>
                <AccountMenu>
                  <AccountMenuItem
                    href='/account/name'
                    iconSrc={iconId}
                    title={<Trans id='Name' />}
                    sx={{
                      py: 1.25,
                      px: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                        mr: 1.5,
                      },
                      ...(isActive('/account/name') && {
                        bgcolor: alpha('#1976d2', 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 'calc(16px - 3px)',
                      }),
                      '&:hover': {
                        bgcolor: isActive('/account/name')
                          ? alpha('#1976d2', 0.12)
                          : alpha('#000', 0.04),
                      },
                    }}
                  />

                  <AccountMenuItem
                    href='/account/contact'
                    iconSrc={iconEmailOutline}
                    title={<Trans id='Contact' />}
                    sx={{
                      py: 1.25,
                      px: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                        mr: 1.5,
                      },
                      ...(isActive('/account/contact') && {
                        bgcolor: alpha('#1976d2', 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 'calc(16px - 3px)',
                      }),
                      '&:hover': {
                        bgcolor: isActive('/account/contact')
                          ? alpha('#1976d2', 0.12)
                          : alpha('#000', 0.04),
                      },
                    }}
                  />

                  <AccountMenuItem
                    href='/account/authentication'
                    iconSrc={iconLock}
                    title={<Trans id='Authentication' />}
                    sx={{
                      py: 1.25,
                      px: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                        mr: 1.5,
                      },
                      ...(isActive('/account/authentication') && {
                        bgcolor: alpha('#1976d2', 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 'calc(16px - 3px)',
                      }),
                      '&:hover': {
                        bgcolor: isActive('/account/authentication')
                          ? alpha('#1976d2', 0.12)
                          : alpha('#000', 0.04),
                      },
                    }}
                  />

                  <AccountMenuItem
                    href='/account/orders'
                    iconSrc={iconBox}
                    title={<Trans id='Orders' />}
                    sx={{
                      py: 1.25,
                      px: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                        mr: 1.5,
                      },
                      ...(isActive('/account/orders') && {
                        bgcolor: alpha('#1976d2', 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 'calc(16px - 3px)',
                      }),
                      '&:hover': {
                        bgcolor: isActive('/account/orders')
                          ? alpha('#1976d2', 0.12)
                          : alpha('#000', 0.04),
                      },
                    }}
                  />

                  {/* <AccountMenuItem
                    href='/account/addresses'
                    iconSrc={iconHome}
                    title={<Trans id='Addresses' />}
                    sx={{
                      py: 1.25,
                      px: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                        mr: 1.5,
                      },
                      '&:hover': {
                        bgcolor: alpha('#000', 0.04),
                      },
                      '&.active': {
                        bgcolor: alpha('#1976d2', 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                      },
                    }}
                  /> */}
                </AccountMenu>
              </Box>

              {/* Divider before sign out */}
              <Box sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                mt: 0.5,
              }}>
                {/* SIGN OUT */}
                <SignOutForm
                  button={({ formState }) => (
                    <AccountMenuItem
                      iconSrc={iconShutdown}
                      loading={formState.isSubmitting}
                      type='submit'
                      title={<Trans id='Sign out' />}
                      noBorderBottom
                      sx={{
                        py: 1.25,
                        px: 2,
                        fontSize: '0.9375rem',
                        color: 'error.main',
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.25rem',
                          mr: 1.5,
                        },
                        '&:hover': {
                          bgcolor: alpha('#d32f2f', 0.08),
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT CONTENT */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                minHeight: '500px',
              }}
            >
              {children}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}