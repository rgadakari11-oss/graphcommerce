import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Container,
  Alert,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  alpha,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { gql, useMutation, useApolloClient } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  ExpandMore as ExpandMoreIcon,
  Stars as StarsIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'

import { MobileStep } from '../../components/signup/MobileStep'
import { OtpStep } from '../../components/signup/OtpStep'
import { CustomerDocument } from '@graphcommerce/magento-customer/hooks'

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
      customer {
        id
        firstname
        lastname
        email
        mobile_number
        is_seller
      }
    }
  }
`

/* ---------------- Types ---------------- */

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

type Step = 'mobile' | 'otp'

/* ---------------- Page ---------------- */

function SignupCustomerPage() {
  const theme = useTheme()
  const [step, setStep] = useState<Step>('mobile')

  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()
  const apolloClient = useApolloClient()

  /* ---------- Validation ---------- */

  const isValidMobile = /^[6-9]\d{9}$/.test(mobile)

  /* ---------- GraphQL Hooks ---------- */

  const [generateOtp, { loading: otpLoading }] = useMutation(GENERATE_MOBILE_OTP)
  const [verifyOtp, { loading: verifyLoading }] = useMutation(VERIFY_MOBILE_OTP)

  /* ---------- Handlers ---------- */

  const handleMobileSubmit = async () => {
    if (!isValidMobile) {
      setError(i18n._(/* i18n */ 'Enter a valid 10-digit mobile number'))
      return
    }

    setError('')

    try {
      const { data } = await generateOtp({
        variables: {
          input: {
            mobile_number: mobile,
          },
        },
      })

      const result = data?.generateMobileOtp

      if (result?.success && result?.otp_sent) {
        setStep('otp')
      } else {
        setError(result?.message || 'Failed to send OTP')
      }
    } catch (e) {
      console.error(e)
      setError(i18n._(/* i18n */ 'Something went wrong while sending OTP'))
    }
  }

  /**
   * 🔐 FINAL OTP VERIFY + LOGIN (GRAPHCOMMERCE COMPATIBLE)
   */
  const handleOtpSubmit = async () => {
    if (!otp || otp.length < 4) {
      setError(i18n._(/* i18n */ 'Please enter a valid OTP'))
      return
    }

    setError('')

    try {
      const { data } = await verifyOtp({
        variables: {
          input: {
            mobile_number: mobile,
            otp_code: otp,
            is_seller: 0,
          },
        },
      })

      const result = data?.verifyMobileOtp

      if (!result?.success) {
        setError(result?.message || 'OTP verification failed')
        return
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'seller-signup',
          JSON.stringify({
            mobile,
            verifiedAt: Date.now(),
          })
        )
      }


      // const token = result.token

      // if (!token) {
      //   setError(i18n._(/* i18n */ 'Login token not received from server'))
      //   return
      // }

      // if (typeof window !== 'undefined') {
      //   localStorage.setItem('customerToken', token)
      // }

      // await apolloClient.clearStore()

      // await apolloClient.query({
      //   query: CustomerDocument,
      //   fetchPolicy: 'network-only',
      // })
      //router.replace('/account')


      /**
       * Redirect to My Account
       */

      router.replace('/business-signup')

    } catch (e) {
      console.error(e)
      setError(i18n._(/* i18n */ 'Unable to verify OTP. Please try again.'))
    }
  }

  const handleResendOtp = async () => {
    setOtp('')
    setError('')
    try {
      const { data } = await generateOtp({
        variables: {
          input: {
            mobile_number: mobile,
          },
        },
      })

      const result = data?.generateMobileOtp

      if (result?.success && result?.otp_sent) {
        setError('') // Clear any previous errors
        // Optionally show success message
      } else {
        setError(result?.message || 'Failed to resend OTP')
      }
    } catch (e) {
      console.error(e)
      setError(i18n._(/* i18n */ 'Something went wrong while resending OTP'))
    }
  }

  // Success Stories
  const successStories = [
    {
      name: 'Rajesh Kumar',
      business: 'Kumar Electronics',
      quote: 'QTYBID helped us connect with 50+ new suppliers in just 2 months!',
      growth: '+150% orders',
    },
    {
      name: 'Priya Sharma',
      business: 'Sharma Textiles',
      quote: 'Best B2B platform for bulk procurement. Highly recommended!',
      growth: '+200% reach',
    },
    {
      name: 'Amit Patel',
      business: 'Patel Industries',
      quote: 'Found reliable suppliers for our packaging needs. Great support team!',
      growth: '+180% sales',
    },
  ]

  // How it works steps
  const howItWorksSteps = [
    {
      title: 'Register Your Business',
      description: 'Create your FREE business profile in under 2 minutes',
      icon: '📝',
    },
    {
      title: 'Get Verified',
      description: 'Quick verification process to build trust with buyers',
      icon: '✅',
    },
    {
      title: 'Start Getting Orders',
      description: 'Receive inquiries and connect with genuine buyers instantly',
      icon: '📈',
    },
  ]

  // Benefits for business listing
  const listingBenefits = [
    {
      title: 'FREE BUSINESS LISTING PAGE',
      benefits: [
        'Showcase your products & services with unlimited product listings',
        'Easily add, update or delete up to 500 product images & videos (max 2MB per file)',
        'Premium features & targeted leads for low membership fees',
        'Online payment facility (collect payment cash, online or on trust)',
      ],
    },
    {
      title: 'ADDITIONAL FEATURES',
      benefits: [
        'Get higher visibility with priority listing in search results',
        'Add high-quality photos, catalogs, and multimedia content',
        'Sell beyond your locality with seller portal, all-India visibility',
        'Gain trust with verified badge & ratings from real buyers',
      ],
    },
  ]

  // FAQ data
  const faqs = [
    {
      question: 'What are the benefits of listing my business on QTYBID?',
      answer:
        'Get discovered by thousands of buyers, showcase your products/services, receive direct inquiries, build credibility with verified badge, and access analytics to track your performance.',
    },
    {
      question: 'Can I list my business for free on QTYBID?',
      answer:
        'Yes! Basic business listing is completely FREE. You can upgrade to premium plans for additional features like priority listing, featured placement, and advanced analytics.',
    },
    {
      question: 'I already have a website and would promote my brand, Can I still use QTYBID?',
      answer:
        'Absolutely! QTYBID complements your existing website by providing additional exposure to B2B buyers actively searching for suppliers. Many businesses use both successfully.',
    },
    {
      question: 'For which all documents am I eligible to seek a credit for my business listing?',
      answer:
        'You can use GST certificate, Trade License, Shop Act License, MSME/Udyog Aadhaar, or Company Registration documents for verification and eligibility.',
    },
  ]

  // Educational content
  const educationalContent = [
    {
      title: 'Understanding B2B Platform: Connecting Businesses for Growth',
    },
    {
      title: 'QTYBID Listing for the Right Business Categories',
    },
    {
      title: 'How to Respond to Customer Reviews and Quotations',
    },
  ]

  /* ---------------- UI ---------------- */

  return (
    <>
      <PageMeta
        title={i18n._(/* i18n */ 'Sign Up - QTYBID | List Your Business for FREE')}
        metaDescription="Register your business on QTYBID for FREE. Get verified, showcase products, receive inquiries from genuine buyers. Join 500+ suppliers today!"
      />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} py={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: 'white',
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                List Your Business{' '}
                <Box
                  component="span"
                  sx={{
                    color: '#FFF176',
                    fontSize: { xs: '2.5rem', md: '3rem' },
                  }}
                >
                  for FREE
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 3,
                  fontWeight: 400,
                }}
              >
                Join 500+ verified suppliers • Reach 1000+ active buyers
              </Typography>

              <List sx={{ color: 'white' }}>
                {[
                  'Get Verified & Build Trust with Buyers',
                  'Showcase Products with Images & Videos',
                  'Unlimited Product Listings',
                  'Receive Inquiries & Quotation Requests',
                ].map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SecurityIcon sx={{ fontSize: 18 }} />
                100% secure and verified platform
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'white',
                }}
              >
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* STEP 1 – MOBILE */}
                {step === 'mobile' && (
                  <MobileStep
                    mobile={mobile}
                    setMobile={setMobile}
                    onSubmit={handleMobileSubmit}
                    loading={otpLoading}
                  />
                )}

                {/* STEP 2 – OTP */}
                {step === 'otp' && (
                  <OtpStep
                    mobile={mobile}
                    otp={otp}
                    setOtp={setOtp}
                    onSubmit={handleOtpSubmit}
                    onResendOtp={handleResendOtp}
                    onChangeNumber={() => setStep('mobile')}
                    loading={verifyLoading}
                    resendLoading={otpLoading}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Box py={6} sx={{ bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Success Stories
            </Typography>
            <Typography variant="body1" color="text.secondary">
              51,700+ Successful Businesses • Growing Every Day
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {successStories.map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                        }}
                      >
                        {story.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {story.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {story.business}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: 'italic',
                        mb: 2,
                        color: 'text.secondary',
                      }}
                    >
                      "{story.quote}"
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 2,
                        py: 0.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 2,
                        color: 'success.main',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16 }} />
                      {story.growth}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              See All Stories
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={6}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Get a FREE Business Listing in 3 Simple Steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {howItWorksSteps.map((stepItem, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      margin: '0 auto 20px',
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    {stepItem.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {stepItem.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stepItem.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={6} sx={{ bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Connect with New Customers & Grow Your Business
          </Typography>

          <Grid container spacing={4}>
            {listingBenefits.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <StarsIcon />
                    {section.title}
                  </Typography>
                  <List>
                    {section.benefits.map((benefit, idx) => (
                      <ListItem key={idx} sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            fontSize: '0.95rem',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={6}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Got a Question?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything you need to know about listing your business
            </Typography>
          </Box>

          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 1,
                '&:before': {
                  display: 'none',
                },
                boxShadow: 'none',
                border: '1px solid #E0E0E0',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          <Box textAlign="center" mt={3}>
            <Button
              variant="outlined"
              sx={{
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              View All Questions
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Educational Content */}
      <Box py={6} sx={{ bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Learn How to Make Your Business Profile Look More Professional
          </Typography>

          <Grid container spacing={3}>
            {educationalContent.map((content, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {content.title}
                    </Typography>
                    <Button
                      size="small"
                      sx={{
                        mt: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Learn More →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        py={6}
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Get Your Business on QTYBID for FREE Today!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, fontWeight: 400 }}>
            Join India's fastest-growing B2B marketplace
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            sx={{
              px: 5,
              py: 2,
              bgcolor: '#4CAF50',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#388E3C',
              },
            }}
          >
            Register Now - It's FREE
          </Button>
        </Container>
      </Box>
    </>
  )
}

/* ---------------- Layout ---------------- */

SignupCustomerPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default SignupCustomerPage

/* ---------------- getStaticProps (ONLY Layout) ---------------- */

export const getStaticProps: GetPageStaticProps = async (context) => {
  const staticClient = graphqlSsrClient(context)

  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  return {
    props: {
      ...(await layout).data,
    },
    revalidate: 60 * 20,
  }
}