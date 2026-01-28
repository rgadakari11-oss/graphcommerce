import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Paper,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stars as StarsIcon,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function SignupPage() {
  const theme = useTheme()
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [contactPerson, setContactPerson] = useState('')

  const handlePhoneSubmit = () => {
    if (phoneNumber.length === 10) {
      setStep('otp')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpSubmit = () => {
    if (otp.every((digit) => digit !== '')) {
      setStep('details')
    }
  }

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', ''])
    // Add resend OTP logic here
  }

  // Success Stories
  const successStories = [
    {
      name: 'Rajesh Kumar',
      business: 'Kumar Electronics',
      image: '/testimonials/rajesh.jpg',
      quote: 'QTYBID helped us connect with 50+ new suppliers in just 2 months!',
      growth: '+150% orders',
    },
    {
      name: 'Priya Sharma',
      business: 'Sharma Textiles',
      image: '/testimonials/priya.jpg',
      quote: 'Best B2B platform for bulk procurement. Highly recommended!',
      growth: '+200% reach',
    },
    {
      name: 'Amit Patel',
      business: 'Patel Industries',
      image: '/testimonials/amit.jpg',
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
      link: '#',
    },
    {
      title: 'QTYBID Listing for the Right Business Categories',
      link: '#',
    },
    {
      title: 'How to Respond to Customer Reviews and Quotations',
      link: '#',
    },
  ]

  return (
    <>
      <PageMeta
        title="List Your Business for FREE | QTYBID - India's B2B Marketplace"
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
                {/* Phone Number Step */}
                {step === 'phone' && (
                  <Box>
                    <Box textAlign="center" mb={3}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          margin: '0 auto 16px',
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Register Your Business
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enter your mobile number to get started
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Enter 10 digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 10) setPhoneNumber(value)
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                pr: 1,
                                borderRight: '1px solid #E0E0E0',
                              }}
                            >
                              <Box component="span" sx={{ fontSize: '1.2rem' }}>
                                🇮🇳
                              </Box>
                              <Typography>+91</Typography>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.1rem',
                        },
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handlePhoneSubmit}
                      disabled={phoneNumber.length !== 10}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #0D47A1 30%, #1976D2 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0A3D91 30%, #1565C0 90%)',
                        },
                      }}
                    >
                      Send OTP
                    </Button>

                    <Box mt={3}>
                      <Divider sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Why register?
                        </Typography>
                      </Divider>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {[
                          'Get unlimited business inquiries',
                          'Showcase your products catalog',
                          'Build trust with verified badge',
                        ].map((item, idx) => (
                          <Box
                            key={idx}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{ color: 'text.secondary' }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2">{item}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* OTP Verification Step */}
                {step === 'otp' && (
                  <Box>
                    <Box textAlign="center" mb={3}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          margin: '0 auto 16px',
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 32, color: 'success.main' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Verify Your Number
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enter the 6-digit OTP sent to
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                        +91 {phoneNumber}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setStep('phone')}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          mt: 0.5,
                        }}
                      >
                        Change Number
                      </Button>
                    </Box>

                    <Box display="flex" gap={1.5} justifyContent="center" mb={3}>
                      {otp.map((digit, index) => (
                        <TextField
                          key={index}
                          id={`otp-${index}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && index > 0) {
                              const prevInput = document.getElementById(`otp-${index - 1}`)
                              prevInput?.focus()
                            }
                          }}
                          inputProps={{
                            maxLength: 1,
                            style: {
                              textAlign: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 600,
                              padding: '12px',
                            },
                          }}
                          sx={{
                            width: 50,
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleOtpSubmit}
                      disabled={otp.some((digit) => digit === '')}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        mb: 2,
                        background: 'linear-gradient(45deg, #0D47A1 30%, #1976D2 90%)',
                      }}
                    >
                      Verify & Continue
                    </Button>

                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Didn't receive the OTP?
                      </Typography>
                      <Button
                        size="small"
                        onClick={handleResendOtp}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Resend OTP
                      </Button>
                    </Box>

                    <Box
                      mt={3}
                      p={2}
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        💡 Tip: Check your SMS inbox. OTP is valid for 10 minutes.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Business Details Step */}
                {step === 'details' && (
                  <Box>
                    <Box textAlign="center" mb={3}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          margin: '0 auto 16px',
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 32, color: 'success.main' }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Complete Your Profile
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Just a few more details to get started
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        fullWidth
                        label="Business Name"
                        placeholder="Enter your business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <StoreIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Contact Person Name"
                        placeholder="Enter contact person name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          mt: 1,
                          background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                        }}
                      >
                        Complete Registration
                      </Button>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        mt: 2,
                      }}
                    >
                      By continuing, you agree to QTYBID's{' '}
                      <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                        Terms & Conditions
                      </Box>
                    </Typography>
                  </Box>
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
            {howItWorksSteps.map((step, index) => (
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
                    {step.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
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

                  {index === 0 && (
                    <Box mt={2}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 18 }} />
                        📞 +91 XXXXX XXXXX
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Register Your Business Today
                      </Button>
                    </Box>
                  )}
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
          <Box display="flex" gap={2} justifyContent="center" alignItems="center">
            <TextField
              placeholder="🇮🇳 +91 Enter Mobile No."
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                width: 280,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: '#4CAF50',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#388E3C',
                },
              }}
            >
              Create Free Listing
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  )
}

SignupPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default SignupPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  return {
    props: {
      ...(await layout).data,
      up: { href: '/', title: i18n._(/* i18n */ 'Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}