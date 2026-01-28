import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { useCustomerAccountCanSignIn } from '@graphcommerce/magento-customer'
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
  Paper,
  List,
  ListItem,
  ListItemText,
  alpha,
  useTheme,
  Divider,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  RequestQuote as QuoteIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import React from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function IndexPage() {
  const canSignIn = useCustomerAccountCanSignIn()
  const theme = useTheme()

  // Category and Subcategory Structure similar to IndiaMART
  const categoryStructure = [
    {
      title: 'Packaging Material, Supplies & Machines',
      image: '/categories/packaging.jpg',
      featured: [
        'Pouch Packaging Machines',
        'Non Woven Bag',
        'Filling Machines',
        'Bag Sealer',
      ],
      subcategories: [
        {
          name: 'Corrugated Packaging Boxes',
          items: [
            'Corrugated Box',
            '3 Ply Corrugated Box',
            '5 Ply Corrugated Box',
            'Heavy Duty Industrial Corrugated Boxes',
            '7 Ply Corrugated Box',
          ],
        },
        {
          name: 'Plastic Bottles',
          items: [
            'PET Bottles',
            'HDPE Bottle',
            'Plastic Spray Bottle',
            'Transparent Plastic Bottles',
            'Packaging Bottles',
          ],
        },
        {
          name: 'Cap Closures',
          items: [
            'Bottle Caps',
            'Jar Cap',
            'Flip Top Caps',
            'Metal Caps',
            'Screw Caps',
          ],
        },
        {
          name: 'Packaging Pouch',
          items: [
            'Plastic Pouches',
            'Stand Up Pouch',
            'Zipper Pouches',
            'Paper Pouch',
            'Printed Pouches',
          ],
        },
        {
          name: 'Packaging Machines',
          items: [
            'Pouch Packaging Machines',
            'Fruit Juice Packaging Machine',
            'Blister Packaging Machines',
            'Shrink Packaging Machines',
            'Vacuum Packaging Machines',
          ],
        },
        {
          name: 'Form Fill & Seal Packaging Machines',
          items: [
            'Spices Packing Machines',
            'Liquid Packaging Machinery',
            'Fertilizer Packing Machine',
            'Snack Packing Machine',
            'Vertical Form Fill Seal Machines',
          ],
        },
      ],
    },
    {
      title: 'Winter Textile & Furnishing',
      subcategories: [
        {
          name: 'Blankets',
          image: '/categories/blankets.jpg',
          items: [
            'Cotton Blankets',
            'Pet Blankets',
            'Thermal Blankets',
            'Electric Blanket',
          ],
        },
        {
          name: 'Quilts',
          image: '/categories/quilts.jpg',
          items: [
            'Embroidered Quilts',
            'Handmade Quilts',
            'Cotton Quilts',
            'Baby Quilts',
          ],
        },
        {
          name: 'Wool Carpet',
          image: '/categories/carpet.jpg',
          items: [
            'Woolen Rugs',
            'Floor Carpet',
            'Designer Carpet',
            'Floor Rugs',
          ],
        },
        {
          name: 'Mattress',
          image: '/categories/mattress.jpg',
          items: [
            'Bed Mattress',
            'Bubble Mattress',
            'Air Mattresses',
            'Baby Mattress',
          ],
        },
        {
          name: 'Bedding Set',
          image: '/categories/bedding.jpg',
          items: [
            'Baby Bedding Sets',
            'Hotel Bedding Set',
            'Crib Bedding Set',
            'Quilt Bedding Set',
          ],
        },
        {
          name: 'Window Blinds',
          image: '/categories/blinds.jpg',
          items: [
            'Printed Window Blinds',
            'Vinyl Window Blinds',
            'Roller Window Blinds',
            'Bamboo Window Blinds',
          ],
        },
      ],
    },
    {
      title: 'Electronics & Electrical Supplies',
      subcategories: [
        {
          name: 'LED Products',
          image: '/categories/led.jpg',
          items: [
            'Led Lights',
            'LED Bulbs',
            'LED Strip Lights',
            'LED Panel Lights',
          ],
        },
        {
          name: 'Control Panel Boards',
          image: '/categories/control-panel.jpg',
          items: [
            'Lift Control Panel',
            'Industrial Control Panel',
            'Motor Control Panel',
            'PLC Control Panel',
          ],
        },
        {
          name: 'Voltage Stabilizers',
          image: '/categories/stabilizers.jpg',
          items: [
            'Electronic Voltage Stabilizer',
            'Servo Voltage Stabilizer',
            'Digital Voltage Stabilizer',
            'Automatic Voltage Stabilizer',
          ],
        },
        {
          name: 'Heaters',
          image: '/categories/heaters.jpg',
          items: [
            'Room Heater',
            'Industrial Heater',
            'Water Heater',
            'Oil Heater',
          ],
        },
        {
          name: 'Microwave Oven',
          image: '/categories/microwave.jpg',
          items: [
            'Commercial Microwave',
            'Convection Microwave',
            'Solo Microwave',
            'Grill Microwave',
          ],
        },
        {
          name: 'Water Softener & Purifier',
          image: '/categories/purifier.jpg',
          items: [
            'Domestic Water Purifier',
            'Commercial Water Purifier',
            'RO Water Purifier',
            'UV Water Purifier',
          ],
        },
      ],
    },
    {
      title: 'Industrial Machinery & Equipment',
      subcategories: [
        {
          name: 'CNC Machines',
          items: [
            'CNC Lathe Machine',
            'CNC Milling Machine',
            'CNC Router Machine',
            'CNC Plasma Cutting Machine',
          ],
        },
        {
          name: 'Welding Equipment',
          items: [
            'Arc Welding Machine',
            'MIG Welding Machine',
            'TIG Welding Machine',
            'Spot Welding Machine',
          ],
        },
        {
          name: 'Pumps & Motors',
          items: [
            'Centrifugal Pump',
            'Submersible Pump',
            'Electric Motors',
            'Hydraulic Motors',
          ],
        },
        {
          name: 'Material Handling Equipment',
          items: [
            'Forklift',
            'Pallet Truck',
            'Conveyor Systems',
            'Lifting Equipment',
          ],
        },
      ],
    },
    {
      title: 'Raw Materials & Chemicals',
      subcategories: [
        {
          name: 'Steel Products',
          items: [
            'Steel Coils',
            'Steel Sheets',
            'Steel Bars',
            'Stainless Steel',
          ],
        },
        {
          name: 'Plastic Raw Materials',
          items: [
            'PVC Resin',
            'HDPE Granules',
            'PP Granules',
            'Plastic Masterbatch',
          ],
        },
        {
          name: 'Chemicals',
          items: [
            'Industrial Chemicals',
            'Organic Chemicals',
            'Specialty Chemicals',
            'Laboratory Chemicals',
          ],
        },
        {
          name: 'Textile Materials',
          items: [
            'Cotton Fabric',
            'Polyester Fabric',
            'Yarn',
            'Textile Dyes',
          ],
        },
      ],
    },
  ]

  // Platform features for new businesses
  const platformBenefits = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Verified Business Network',
      description: 'Connect with verified suppliers and buyers across India',
    },
    {
      icon: <QuoteIcon sx={{ fontSize: 40 }} />,
      title: 'Request Quotations',
      description: 'Post your requirements and receive competitive quotes instantly',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Platform',
      description: 'Trade with confidence on our secure B2B marketplace',
    },
    {
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Logistics Support',
      description: 'End-to-end logistics solutions for your business needs',
    },
  ]

  // How it works for new users
  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Account',
      description: 'Sign up for free and complete your business profile',
    },
    {
      step: '2',
      title: 'Browse or Post Requirements',
      description: 'Search through categories or post what you need',
    },
    {
      step: '3',
      title: 'Connect with Suppliers',
      description: 'Get quotes and connect with verified suppliers',
    },
    {
      step: '4',
      title: 'Complete Your Order',
      description: 'Negotiate, finalize, and complete your transaction',
    },
  ]

  return (
    <>
      <PageMeta
        title="QTYBID - India's Growing B2B Marketplace | Connect. Trade. Grow."
        metaDescription="Join QTYBID, India's emerging B2B marketplace. Connect with verified suppliers, post requirements, and grow your business with competitive quotes."
      />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} py={8} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    color: 'white',
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  Welcome to{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(45deg, #FFF176 30%, #FFEB3B 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    QTYBID
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 400,
                    mb: 1,
                    lineHeight: 1.4,
                  }}
                >
                  India's Emerging B2B Marketplace
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem',
                    mb: 4,
                    maxWidth: '600px',
                  }}
                >
                  Join our growing community of businesses. Connect with verified suppliers,
                  discover quality products, and get competitive quotes for bulk procurement.
                </Typography>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'white',
                      color: '#0D47A1',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        background: '#F5F5F5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Post Your Requirement
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href="/account"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: 'white',
                      borderWidth: 2,
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        borderWidth: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register as Supplier
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'white',
                }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    color: '#0A1929',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0D47A1' }}>
                    🚀 Growing Platform
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                          500+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Suppliers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                          50K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Products Listed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                          1000+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Buyers Joined
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                          24/7
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Support Available
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Category Sections with Subcategories */}
      {categoryStructure.map((category, categoryIndex) => (
        <Box
          key={categoryIndex}
          py={6}
          sx={{
            bgcolor: categoryIndex % 2 === 0 ? 'white' : '#F8F9FA',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 4,
                color: '#0A1929',
                borderBottom: '3px solid #0D47A1',
                paddingBottom: 1,
                display: 'inline-block',
              }}
            >
              {category.title}
            </Typography>

            <Grid container spacing={3}>
              {/* Featured Image Section (if exists) */}
              {category.featured && (
                <Grid item xs={12} md={3}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        transform: 'translate(50%, -50%)',
                      },
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ fontSize: '3rem', mb: 2 }}>📦</Box>
                      {category.featured.map((item, idx) => (
                        <Typography
                          key={idx}
                          variant="body1"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            opacity: 0.95,
                          }}
                        >
                          • {item}
                        </Typography>
                      ))}
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 3,
                          bgcolor: 'white',
                          color: '#0D47A1',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: '#F5F5F5',
                          },
                        }}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Subcategory Cards */}
              {category.subcategories.map((subcategory, subIndex) => (
                <Grid item xs={12} sm={6} md={category.featured ? 3 : 4} key={subIndex}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: '1px solid #E0E0E0',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        borderColor: '#0D47A1',
                      },
                    }}
                  >
                    {subcategory.image && (
                      <Box
                        sx={{
                          height: 160,
                          bgcolor: '#E3F2FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem',
                          backgroundImage: `url(${subcategory.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {!subcategory.image.startsWith('http') && '🏷️'}
                      </Box>
                    )}
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: '#0A1929',
                          fontSize: '1rem',
                        }}
                      >
                        {subcategory.name}
                      </Typography>
                      <List dense sx={{ p: 0 }}>
                        {subcategory.items.map((item, itemIndex) => (
                          <ListItem
                            key={itemIndex}
                            sx={{
                              p: 0,
                              mb: 0.5,
                              '&:hover': {
                                color: '#0D47A1',
                              },
                            }}
                          >
                            <ListItemText
                              primary={item}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: {
                                  fontSize: '0.875rem',
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: '#0D47A1',
                                    fontWeight: 500,
                                  },
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      ))}

      {/* Platform Benefits */}
      <Box py={8} sx={{ bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0A1929',
                mb: 2,
              }}
            >
              Why Choose QTYBID?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Building India's most trusted B2B marketplace
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {platformBenefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    border: '1px solid #E0E0E0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#0D47A1',
                      boxShadow: '0 8px 24px rgba(13, 71, 161, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: '#0D47A1',
                      mb: 2,
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={8} sx={{ bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#0A1929',
                mb: 2,
              }}
            >
              How QTYBID Works
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Start trading in 4 simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 700,
                      margin: '0 auto 20px',
                      boxShadow: '0 4px 20px rgba(13, 71, 161, 0.3)',
                    }}
                  >
                    {step.step}
                  </Box>
                  {index < howItWorks.length - 1 && (
                    <ArrowForwardIcon
                      sx={{
                        position: 'absolute',
                        top: 30,
                        right: -20,
                        color: '#0D47A1',
                        fontSize: 40,
                        display: { xs: 'none', md: 'block' },
                      }}
                    />
                  )}
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

      {/* Call to Action */}
      <Box
        py={8}
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Ready to Grow Your Business?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
            Join QTYBID today and connect with thousands of businesses across India
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" mb={4}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 2,
                borderRadius: 2,
                bgcolor: 'white',
                color: '#0D47A1',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#F5F5F5',
                },
              }}
            >
              Get Started for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 5,
                py: 2,
                borderRadius: 2,
                borderColor: 'white',
                borderWidth: 2,
                color: 'white',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
          <Box display="flex" gap={4} justifyContent="center" flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon />
              <Typography variant="body1">Free Registration</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon />
              <Typography variant="body1">No Hidden Fees</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon />
              <Typography variant="body1">24/7 Support</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Early Adopter Benefits */}
      <Box py={6} sx={{ bgcolor: '#FFF9C4' }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#F57C00', mb: 1 }}>
              🎉 Limited Time Offer for Early Members
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join now and enjoy premium features free for 6 months • Zero commission on first 100
              transactions • Priority listing for your products
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
}

IndexPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default IndexPage

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