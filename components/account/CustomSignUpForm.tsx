import { PasswordRepeatElement, CheckboxElement } from '@graphcommerce/ecommerce-ui'
import { useQuery } from '@graphcommerce/graphql'
import { graphqlErrorByCategory } from '@graphcommerce/magento-graphql'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { Button, FormActions, FormRow } from '@graphcommerce/next-ui'
import type { UseFormClearErrors, UseFormSetError } from '@graphcommerce/react-hook-form'
import { FormPersist, useFormGqlMutation } from '@graphcommerce/react-hook-form'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/react'
import { Alert, Box, TextField, Typography, Link, Paper, InputAdornment, IconButton } from '@mui/material'
import { useRef, useState, useEffect } from 'react'
import { useSignInForm } from '@graphcommerce/magento-customer/hooks/useSignInForm'
import { ApolloCustomerErrorSnackbar } from '@graphcommerce/magento-customer/components/ApolloCustomerError/ApolloCustomerErrorSnackbar'
import { NameFields } from '@graphcommerce/magento-customer/components/NameFields/NameFields'
import { ValidatedPasswordElement } from '@graphcommerce/magento-customer/components/ValidatedPasswordElement/ValidatedPasswordElement'
import type { SignUpMutation, SignUpMutationVariables } from '@graphcommerce/magento-customer/components/SignUpForm/SignUp.gql'
import { SignUpDocument } from '@graphcommerce/magento-customer/components/SignUpForm/SignUp.gql'
import { gql, useMutation } from '@apollo/client'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

/* ---------------- GraphQL Mutations ---------------- */

const GENERATE_MOBILE_OTP = gql`
  mutation GenerateOtp($input: GenerateMobileOtpInput!) {
    generateMobileOtp(input: $input) {
      success
      message
      otp_sent
    }
  }
`

const VERIFY_MOBILE_OTP = gql`
  mutation VerifyOtp($input: VerifyMobileOtpInput!) {
    verifyMobileOtp(input: $input) {
      success
      message
      token
    }
  }
`

type CustomSignUpFormProps = {
  email?: string
  setError: UseFormSetError<{ email?: string; requestedMode?: 'signin' | 'signup' }>
  clearErrors: UseFormClearErrors<{ email?: string; requestedMode?: 'signin' | 'signup' }>
  otpVerified: boolean
  onOtpVerified: () => void
}

export function CustomSignUpForm(props: CustomSignUpFormProps) {
  const { email, setError, clearErrors, otpVerified, onOtpVerified } = props

  console.log('🔵 SignUpForm - Component rendered with email:', email)
  console.log('🔵 SignUpForm - otpVerified:', otpVerified)

  // OTP state
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Store password in ref to access it in onBeforeSubmit
  const passwordRef = useRef<string>('')
  const confirmPasswordRef = useRef<string>('')

  const storeConfig = useQuery(StoreConfigDocument)
  const signIn = useSignInForm({ email })

  // GraphQL mutations for OTP
  const [generateOtp, { loading: sendingOtp }] = useMutation(GENERATE_MOBILE_OTP)
  const [verifyOtpMutation, { loading: verifyingOtp }] = useMutation(VERIFY_MOBILE_OTP)

  const form = useFormGqlMutation<
    SignUpMutation,
    SignUpMutationVariables & { confirmPassword?: string, agreeToTerms?: boolean }
  >(
    SignUpDocument,
    {
      defaultValues: {
        email,
        password: '',
        confirmPassword: '',
        agreeToTerms: true,
      },
      onBeforeSubmit: (values) => {
        console.log('🟡 SignUpForm onBeforeSubmit - START')
        console.log('🟡 values received:', values)

        if (!email) {
          console.log('🔴 SignUpForm onBeforeSubmit - No email, returning false')
          setError('email', { message: t`Please enter a valid mobile number` })
          return false
        }

        if (!otpVerified) {
          console.log('🔴 SignUpForm onBeforeSubmit - OTP not verified')
          setOtpError('Please verify your mobile number with OTP first')
          return false
        }

        if (!values.agreeToTerms) {
          setFormError('agreeToTerms', {
            type: 'manual',
            message: t`You must agree to the Terms and Conditions`,
          })
          return false
        }




        clearErrors()

        const completeValues = {
          ...values,
          email: email ?? '',
          prefix: 'Mr', // 🔥 fallback safety
          password: passwordRef.current,
        }
        delete (completeValues as any).agreeToTerms

        console.log('🟢 SignUpForm onBeforeSubmit - complete values:', completeValues)
        return completeValues
      },
      onComplete: async (result, variables) => {
        console.log('✅ SignUpForm onComplete - result:', result)

        if (!result.errors && !storeConfig.data?.storeConfig?.create_account_confirmation) {
          console.log('✅ SignUpForm onComplete - Auto signing in...')
          signIn.setValue('email', variables.email)
          signIn.setValue('password', variables.password)
          await signIn.handleSubmit(() => { })()
        }
      },
    },
    { errorPolicy: 'all' },
  )

  const { handleSubmit, required, formState, error, control, watch, setError: setFormError, clearErrors: clearFormErrors } = form
  const [remainingError, inputError] = graphqlErrorByCategory({ category: 'graphql-input', error })

  // Watch password fields and update refs
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  passwordRef.current = password || ''
  confirmPasswordRef.current = confirmPassword || ''

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Send OTP function - integrated with your backend
  const handleSendOtp = async () => {
    if (!email) {
      setOtpError('Please enter a valid mobile number')
      return
    }

    const mobileNumber = email.replace('@gmail.com', '')
    if (mobileNumber.length !== 10) {
      setOtpError('Please enter a valid 10-digit mobile number')
      return
    }

    setOtpError('')

    try {
      const { data } = await generateOtp({
        variables: {
          input: {
            mobile_number: mobileNumber,
          },
        },
      })

      const result = data?.generateMobileOtp

      if (result?.success && result?.otp_sent) {
        console.log('✅ OTP sent to:', mobileNumber)
        setOtpSent(true)
        setResendTimer(60)
      } else {
        setOtpError(result?.message || 'Failed to send OTP')
      }
    } catch (err) {
      console.error('❌ Error sending OTP:', err)
      setOtpError('Failed to send OTP. Please try again.')
    }
  }

  // Verify OTP function - integrated with your backend
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setOtpError('Please enter a valid OTP')
      return
    }

    setOtpError('')

    try {
      const mobileNumber = email?.replace('@gmail.com', '') || ''

      const { data } = await verifyOtpMutation({
        variables: {
          input: {
            mobile_number: mobileNumber,
            otp_code: otp,
            is_seller: 0, // 0 for customer, 1 for seller
          },
        },
      })

      const result = data?.verifyMobileOtp

      if (result?.success) {
        console.log('✅ OTP verified:', otp)
        onOtpVerified()
      } else {
        setOtpError(result?.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      console.error('❌ Error verifying OTP:', err)
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const submitHandler = handleSubmit((data) => {
    console.log('🟣 SignUpForm handleSubmit - callback triggered')
    console.log('🟣 SignUpForm handleSubmit - data:', data)

  })

  if (
    storeConfig.data?.storeConfig?.create_account_confirmation &&
    !error &&
    form.formState.isSubmitSuccessful
  ) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2.5 }}>
        <Trans
          id='Registration successful. Please check your inbox to confirm your email address ({email})'
          values={{ email }}
        />
      </Alert>
    )
  }

  // Step 1: OTP Verification (if not verified yet)
  if (!otpVerified) {
    return (
      <Box
        sx={{
          animation: 'fadeInUp 0.5s ease forwards',
          '@keyframes fadeInUp': {
            from: {
              opacity: 0,
              transform: 'translateY(10px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {!otpSent ? (
          // Show "Send OTP" button
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: 'text.secondary',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              }}
            >
              <Trans id="We'll send you a verification code to confirm your mobile number" />
            </Typography>

            {otpError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  '& .MuiAlert-message': {
                    fontSize: '0.8125rem',
                  },
                }}
              >
                {otpError}
              </Alert>
            )}

            <Button
              onClick={handleSendOtp}
              loading={sendingOtp}
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
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
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
              <Trans id="Send OTP" />
            </Button>
          </Box>
        ) : (
          // Show OTP input and verify button
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: 'text.secondary',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              }}
            >
              <Trans id="Enter the 6-digit code sent to your mobile number" />
            </Typography>

            <TextField
              fullWidth
              size="medium"
              label={<Trans id="Enter OTP" />}
              value={otp}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 6)
                setOtp(onlyDigits)
                setOtpError('')
              }}
              placeholder="• • • • • •"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem',
                  fontWeight: 600,
                },
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  backgroundColor: 'background.paper',
                  border: '2px solid',
                  borderColor: otpError ? 'error.main' : 'divider',
                  '&:hover': { borderColor: otpError ? 'error.main' : 'primary.light' },
                  '&.Mui-focused': {
                    borderColor: otpError ? 'error.main' : '#1976D2',
                    boxShadow: otpError
                      ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                      : '0 0 0 4px rgba(25, 118, 210, 0.1)',
                  },
                  '& fieldset': { border: 'none' },
                },
                // FIXED: floating label background and shrink
                '& .MuiInputLabel-root': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                  px: 0.5,
                  transform: 'translate(14px, 19px) scale(1)',
                  '&.Mui-focused': { color: otpError ? 'error.main' : '#1976D2' },
                },
                '& .MuiInputLabel-shrink': {
                  transform: 'translate(14px, -6px) scale(0.75)',
                },
              }}
            />


            {otpError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  animation: 'shake 0.3s ease',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                  },
                  '& .MuiAlert-message': {
                    fontSize: '0.8125rem',
                  },
                }}
              >
                {otpError}
              </Alert>
            )}

            <Button
              onClick={handleVerifyOtp}
              loading={verifyingOtp}
              disabled={otp.length < 4}
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
                mb: 2,
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
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover:not(:disabled)': {
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
              <Trans id="Verify OTP" />
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              {resendTimer > 0 ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.8125rem',
                  }}
                >
                  <Trans id="Resend OTP in {timer}s" values={{ timer: resendTimer }} />
                </Typography>
              ) : (
                <Button
                  onClick={handleSendOtp}
                  loading={sendingOtp}
                  variant="text"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#1976D2',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <Trans id="Resend OTP" />
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  // Step 2: Show full registration form after OTP verification
  return (
    <Box
      component="form"
      onSubmit={submitHandler}
      noValidate
      sx={{
        animation: 'fadeInUp 0.5s ease forwards',
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Alert
        severity="success"
        icon={<CheckCircleIcon />}
        sx={{
          mb: 2,
          borderRadius: 2.5,
          '& .MuiAlert-message': {
            fontSize: '0.8125rem',
            fontWeight: 500,
          },
        }}
      >
        <Trans id="Mobile number verified successfully!" />
      </Alert>

      <NameFields form={form} />

      <FormRow>
        <ValidatedPasswordElement
          control={control}
          name='password'
          variant='outlined'
          error={!!formState.errors.password || !!inputError}
          label={<Trans id='Password' />}
          autoFocus
          autoComplete='new-password'
          required={required.password}
          disabled={formState.isSubmitting}
          helperText={inputError?.message}
          type={showPassword ? 'text' : 'password'}
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
              '&.Mui-error': {
                borderColor: 'error.main',
                '&.Mui-focused': {
                  boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
                },
              },
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: '#fff',
              px: 0.5,
              transform: 'translate(14px, 19px) scale(1)',
              '&.Mui-focused': { color: '#1976D2' },
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge='end'
                  size='small'
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
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <PasswordRepeatElement
          control={control}
          name='confirmPassword'
          passwordFieldName='password'
          variant='outlined'
          error={!!formState.errors.confirmPassword || !!inputError}
          label={<Trans id='Confirm password' />}
          autoComplete='new-password'
          required
          disabled={formState.isSubmitting}
          type={showConfirmPassword ? 'text' : 'password'}
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
              '&.Mui-error': {
                borderColor: 'error.main',
                '&.Mui-focused': {
                  boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
                },
              },
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputLabel-root': {
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: '#fff',
              px: 0.5,
              transform: 'translate(14px, 19px) scale(1)',
              '&.Mui-focused': { color: '#1976D2' },
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge='end'
                  size='small'
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
                  {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FormRow>


      <FormRow sx={{ mt: 1 }}>
        <CheckboxElement
          control={control}
          name="agreeToTerms"
          label={
            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
              <Trans id="I agree to the" />{' '}
              <Link href="/terms" target="_blank" underline="hover">
                <Trans id="Terms & Conditions" />
              </Link>
            </Typography>
          }
          required
        />

      </FormRow>

      <ApolloCustomerErrorSnackbar error={remainingError} />


      <FormActions sx={{ mt: 0 }}>
        <Button
          type='submit'
          id='create-account'
          variant='contained'
          color='primary'
          size='large'
          fullWidth
          loading={formState.isSubmitting}
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
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
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
          <Trans id='Create Account' />
        </Button>
      </FormActions>
      <FormPersist form={form} name='SignUp' exclude={['password', 'confirmPassword']} />
    </Box>
  )
}