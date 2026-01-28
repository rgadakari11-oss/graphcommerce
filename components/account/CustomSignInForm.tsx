import type { UseFormClearErrors, UseFormSetError } from '@graphcommerce/ecommerce-ui'
import { PasswordElement } from '@graphcommerce/ecommerce-ui'
import { graphqlErrorByCategory } from '@graphcommerce/magento-graphql'
import { Button, FormActions, FormRow } from '@graphcommerce/next-ui'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/react'
import type { SxProps, Theme } from '@mui/material'
import {
  Box,
  FormControl,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'
import { useSignInForm } from '@graphcommerce/magento-customer/hooks/useSignInForm'
import { ApolloCustomerErrorAlert } from '@graphcommerce/magento-customer/components/ApolloCustomerError/ApolloCustomerErrorAlert'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

export type CustomSignInFormProps = {
  email?: string
  sx?: SxProps<Theme>
  setError: UseFormSetError<{ email?: string; requestedMode?: 'signin' | 'signup' }>
  clearErrors: UseFormClearErrors<{ email?: string; requestedMode?: 'signin' | 'signup' }>
}

export function CustomSignInForm(props: CustomSignInFormProps) {
  const { email, sx, setError, clearErrors } = props
  const [showPassword, setShowPassword] = useState(false)

  const passwordRef = useRef<string>('')

  const form = useSignInForm({
    email,
    onBeforeSubmit(variables) {
      if (!email) {
        setError('email', { message: t`Please enter a valid email address` })
        return false
      }
      clearErrors()

      const completeVariables = {
        ...variables,
        password: passwordRef.current,
      }

      return completeVariables
    },
  })

  const { handleSubmit, required, formState, error, control, watch } = form
  const [remainingError, authError] = graphqlErrorByCategory({
    category: 'graphql-authentication',
    error,
  })

  const password = watch('password')
  passwordRef.current = password || ''

  const submitHandler = handleSubmit(() => { })

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Box
      component="form"
      onSubmit={submitHandler}
      noValidate
      sx={[
        {
          animation: 'fadeInUp 0.5s ease forwards',
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FormRow sx={{ gridTemplateColumns: 'none' }}>
        <PasswordElement
          variant="outlined"
          error={!!formState.errors.password || !!authError}
          control={control}
          name="password"
          label={<Trans id="Password" />}
          autoFocus={!!email}
          autoComplete="current-password"
          id="current-password"
          required={required.password}
          disabled={formState.isSubmitting}
          helperText={!!formState.errors.password || authError?.message}
          type={showPassword ? 'text' : 'password'}
          InputLabelProps={{
            shrink: Boolean(password),
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
                backgroundColor: 'background.paper',
              },
              '&.Mui-focused': {
                borderColor: '#1976D2',
                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                backgroundColor: 'background.paper',
              },
              '&.Mui-error': {
                borderColor: 'error.main',
                '&.Mui-focused': {
                  boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
                },
              },
              '& fieldset': {
                border: 'none',
              },

              // 👇 ensure clean left padding for text
              '& input': {
                paddingLeft: '14px',
              },
            },

            // 👇 FIX — initial label position
            '& .MuiInputLabel-root': {
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: '#fff',
              px: 0.5,
              transform: 'translate(14px, 20px) scale(1)',
              '&.Mui-focused': {
                color: '#1976D2',
              },
            },

            // 👇 FIX — floating label position
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  size="small"
                  sx={{
                    mr: 0.5,
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormRow>

      <Box sx={{ textAlign: 'right', mt: 0.5, mb: 1.5 }}>
        <Link
          href="/account/forgot-password"
          underline="hover"
          sx={{
            fontSize: '0.75rem',
            color: '#1976D2',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#0D47A1',
            },
          }}
        >
          <Trans id="Forgot Password?" />
        </Link>
      </Box>

      <ApolloCustomerErrorAlert error={remainingError} key="error" />

      <FormActions sx={{ mt: 0.5, mb: 0.5, p: 0 }}>
        <FormControl fullWidth>
          <Button
            type="submit"
            loading={formState.isSubmitting}
            color="primary"
            variant="contained"
            size="large"
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
              '&.Mui-disabled': {
                background: 'rgba(25, 118, 210, 0.4)',
                color: 'white',
              },
            }}
          >
            <Trans id="Sign In" />
          </Button>
        </FormControl>
      </FormActions>

      <Divider sx={{ my: 1.5 }}>
        <Typography
          component="span"
          sx={{
            px: 2,
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <Trans id="or continue with" />
        </Typography>
      </Divider>

      <Button
        variant="outlined"
        color="inherit"
        size="large"
        fullWidth
        startIcon={
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                fill="#EA4335"
              />
            </svg>
          </Box>
        }
        sx={{
          borderRadius: 2.5,
          textTransform: 'none',
          fontWeight: 600,
          py: 1.2,
          fontSize: '15px !important',
          border: '2px solid',
          borderColor: 'divider',
          color: 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1976D2',
            backgroundColor: 'action.hover',
            transform: 'translateY(-2px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
        onClick={() => {
          console.log('Google login')
        }}
      >
        Continue with Google
      </Button>
    </Box>
  )
}
