import { ActionCardListForm, EmailElement, FormAutoSubmit } from '@graphcommerce/ecommerce-ui'
import { useApolloClient } from '@graphcommerce/graphql'
import {
  ActionCard,
  Button,
  extendableComponent,
  FormDiv,
  FormRow,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import type { SxProps, Theme } from '@mui/material'
import {
  Alert,
  Box,
  CircularProgress,
  Link,
  Typography,
  Avatar,
  InputAdornment,
  TextField,
  Paper,
} from '@mui/material'
import { useRouter } from 'next/router'
import {
  CustomerDocument,
  useAccountSignInUpForm,
  useCustomerAccountCanSignUp,
  UseCustomerValidateTokenDocument,
} from '@graphcommerce/magento-customer/hooks'
import { useCustomerQuery } from '@graphcommerce/magento-customer/hooks/useCustomerQuery'
import { ApolloCustomerErrorAlert } from '@graphcommerce/magento-customer/components/ApolloCustomerError'
import { CustomSignInForm } from './CustomSignInForm'
import { signOut } from '@graphcommerce/magento-customer/components/SignOutForm/signOut'
import { CustomSignUpForm } from './CustomSignUpForm'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useState } from 'react'

export type CustomAccountSignInUpFormProps = {
  sx?: SxProps<Theme>
  signUpDisabled?: React.ReactNode
}

const parts = ['root', 'header', 'body'] as const
const { classes } = extendableComponent('CustomAccountSignInUpForm', parts)

export function CustomAccountSignInUpForm(props: CustomAccountSignInUpFormProps) {
  const { sx = [], signUpDisabled } = props
  const customerEmailQuery = useCustomerQuery(UseCustomerValidateTokenDocument)
  const customerQuery = useCustomerQuery(CustomerDocument)

  const { email } = customerEmailQuery.data?.customer ?? {}

  const { mode, form, submit } = useAccountSignInUpForm()
  const { formState, control, error, setError, clearErrors, watch, setValue } = form
  const router = useRouter()

  const client = useApolloClient()
  const canSignUp = useCustomerAccountCanSignUp()
  const isToggleMethod = !import.meta.graphCommerce.enableGuestCheckoutLogin || !canSignUp

  // OTP verification state - only for signup
  const [otpVerified, setOtpVerified] = useState(false)

  const showEmail =
    mode === 'email' ||
    mode === 'session-expired' ||
    mode === 'signin' ||
    (mode === 'signup' && canSignUp)

  // Display-only mobile number (strip @gmail.com)
  const rawEmail = watch('email') || ''
  const displayMobile = rawEmail.replace('@gmail.com', '')

  return (
    <Paper
      elevation={0}
      sx={[
        {
          maxWidth: 480,
          mx: 'auto',
          borderRadius: 5,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid',
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      className={classes.root}
    >
      {/* ================= HEADER ================= */}
      <Box
        className={classes.header}
        sx={{
          position: 'relative',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: '64px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: mode === 'signedin' ? '#10B981' : '#1976D2',
            flexShrink: 0,
          }}
        >
          {mode === 'signedin' ? (
            <CheckCircleIcon sx={{ fontSize: 20 }} />
          ) : (
            <LockOutlinedIcon sx={{ fontSize: 20 }} />
          )}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.5px',
              fontSize: '1.125rem',
              lineHeight: 1.2,
            }}
          >
            {mode === 'signedin' ? (
              <Trans id="Welcome Back!" />
            ) : (
              <Trans id="YourBrand" />
            )}
          </Typography>

          {mode !== 'signedin' && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              <Trans id="Welcome to our B2B platform" />
            </Typography>
          )}
        </Box>
      </Box>

      {/* ================= BODY ================= */}
      <Box className={classes.body} sx={{ p: 2.5 }}>
        {/* Modern Tab Toggle */}
        {isToggleMethod && (mode === 'signin' || mode === 'signup' || mode === 'email') && (
          <Box sx={{ mb: 2 }}>
            <ActionCardListForm
              control={form.control}
              name="requestedMode"
              layout="grid"
              size="medium"
              render={ActionCard}
              sx={(theme) => ({
                '&.layoutGrid': {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 0.5,
                  backgroundColor: '#F8FAFC',
                  padding: 0.5,
                  borderRadius: 2.5,
                  position: 'relative',
                },
                '& .ActionCard-root': {
                  borderRadius: 2,
                  border: 'none',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: theme.palette.text.secondary,
                  zIndex: 2,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                },
                '& .ActionCard-root.checked': {
                  backgroundColor: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                  background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                  color: 'white',
                  transform: 'translateY(-1px)',
                },
              })}
              items={[
                { value: 'signin', title: <Trans id="Sign In" /> },
                { value: 'signup', title: <Trans id="Sign Up" /> },
              ]}
            />
          </Box>
        )}

        {/* Mobile Number Input (EMAIL UNDER THE HOOD) */}
        {showEmail && (
          <form onSubmit={submit}>
            <FormAutoSubmit {...form} submit={submit} />

            <FormRow>
              <TextField
                fullWidth
                size="medium"
                label={<Trans id="Mobile Number" />}
                value={displayMobile}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '')
                  setValue('email', `${onlyDigits}@gmail.com`, { shouldValidate: true })
                }}
                InputLabelProps={{
                  shrink: Boolean(displayMobile),
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        ml: 0.5,
                      }}
                    >
                      +91
                    </InputAdornment>
                  ),
                  endAdornment:
                    mode === 'session-expired' ? (
                      <Button
                        type="submit"
                        variant="text"
                        color="primary"
                        loading={formState.isSubmitting}
                        sx={{
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                        onClick={() => {
                          signOut(client)
                          form.resetField('email')
                        }}
                      >
                        <Trans id="Sign out" />
                      </Button>
                    ) : (
                      formState.isSubmitting && <CircularProgress size={20} />
                    ),
                  readOnly: !!email || (mode === 'signup' && otpVerified),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused': {
                      borderColor: '#1976D2',
                      boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                    },
                    '& fieldset': {
                      border: 'none',
                    },

                    // 👇 KEY FIX #1 — push input text after +91
                    '& input': {
                      paddingLeft: '6px', // spacing between +91 and text
                    },
                  },

                  // 👇 KEY FIX #2 — shift label to align with text
                  '& .MuiInputLabel-root': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    px: 0.5,
                    transform: 'translate(52px, 21px) scale(1)', // initial label position
                    '&.Mui-focused': {
                      color: '#1976D2',
                    },
                  },

                  // 👇 KEY FIX #3 — shift floating label too
                  '& .MuiInputLabel-shrink': {
                    transform: 'translate(48px, -9px) scale(0.75)',
                  },
                }}
              />

            </FormRow>

            <ApolloCustomerErrorAlert error={error} />

            {mode === 'email' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  loading={formState.isSubmitting}
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.25,
                    fontSize: '0.875rem',
                    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.45)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  <Trans id="Continue" />
                </Button>
              </Box>
            )}
          </form>
        )}

        {/* Sign In Form */}
        {(mode === 'signin' || mode === 'session-expired') && (
          <Box sx={{ mt: showEmail ? 1.5 : 0 }}>
            <CustomSignInForm
              email={rawEmail}
              setError={setError}
              clearErrors={clearErrors}
            />
          </Box>
        )}

        {/* Sign Up Form - with OTP verification */}
        {mode === 'signup' && canSignUp && (
          <Box sx={{ mt: showEmail ? 1.5 : 0 }}>
            <CustomSignUpForm
              email={rawEmail}
              setError={setError}
              clearErrors={clearErrors}
              otpVerified={otpVerified}
              onOtpVerified={() => setOtpVerified(true)}
            />
          </Box>
        )}

        {mode === 'signup' && !canSignUp && (
          <Box sx={{ mt: 2 }}>
            {signUpDisabled || (
              <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                <Trans id="Sign up disabled" />
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  )
}
