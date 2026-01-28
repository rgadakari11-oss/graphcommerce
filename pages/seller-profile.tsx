import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Avatar,
  Stack,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Rating,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material'
import {
  Verified,
  Share,
  Bookmark,
  Star,
  LocationOn,
  Phone,
  Email,
  Language,
  AccessTime,
  TrendingUp,
  Group,
  Inventory,
  LocalShipping,
  CheckCircle,
  Business,
  CalendarToday,
  WhatsApp,
  ContactMail,
  Description,
  EmojiEvents,
  Security,
  Public,
  ArrowForward,
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  Schedule,
  Payment,
  Gavel,
  AccountBalance,
  People,
  Timer,
  ThumbUp,
  WorkspacePremium,
  CardGiftcard,
  HandshakeOutlined,
  CreditCard,
  LocalOffer,
  ViewModule,
  Assignment,
  BarChart,
  Downloading,
  Speed,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

interface Product {
  id: string
  name: string
  price: string
  image: string
  moq: string
  category: string
}

interface Testimonial {
  id: string
  name: string
  company: string
  rating: number
  comment: string
  date: string
  avatar?: string
}

const sellerData = {
  companyName: 'Harilal Paints & Hardware',
  tagline: 'Trusted Supplier of Premium Paints & Hardware Solutions Since 2009',
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=300&fit=crop',
  verified: true,
  trustSeal: true,
  gstVerified: true,
  rating: 4.6,
  totalReviews: 248,
  yearsInBusiness: 15,
  responseTime: '< 2 hours',
  responseRate: 95,

  contact: {
    address: '123, Paint Market Road, Industrial Area, Pune, Maharashtra 411001, India',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'info@harilalpaints.com',
    website: 'www.harilalpaints.com',
  },

  stats: {
    totalProducts: 150,
    activeBuyers: 500,
    monthlyVisitors: 5000,
    successRate: 92,
    deliveryRate: 98,
    repeatCustomers: 75,
  },

  certifications: [
    { name: 'ISO 9001:2015 Certified', icon: '🏆', year: '2015' },
    { name: 'GST Verified Supplier', icon: '✓', year: '2017' },
    { name: 'TrustSEAL Verified', icon: '🔒', year: '2018' },
    { name: 'Quality Assured', icon: '⭐', year: '2019' },
    { name: 'Export Excellence Award', icon: '🌍', year: '2022' },
  ],

  about: `Harilal Paints & Hardware is a leading supplier and distributor of premium quality paints, 
  industrial coatings, and hardware solutions. Established in 2009, we have been serving both retail 
  and B2B customers across India with a commitment to quality, reliability, and customer satisfaction. 
  
  Our extensive product range includes emulsion paints, enamel paints, wood coatings, waterproofing 
  solutions, and a complete range of hardware and building materials. We partner with top brands and 
  ensure that every product meets the highest quality standards.
  
  With over 15 years of industry experience, we have built strong relationships with manufacturers 
  and customers alike. Our dedicated team of professionals ensures timely delivery, competitive pricing, 
  and exceptional after-sales support.`,

  services: [
    {
      title: 'Bulk Supply & Distribution',
      description: 'Large-scale supply solutions for construction projects and retail chains',
      icon: '📦'
    },
    {
      title: 'Custom Color Mixing',
      description: 'Expert color matching and custom paint formulation services',
      icon: '🎨'
    },
    {
      title: 'Technical Consultation',
      description: 'Professional guidance on product selection and application',
      icon: '👷'
    },
    {
      title: 'Pan-India Delivery',
      description: 'Nationwide shipping with tracking and insurance',
      icon: '🚚'
    },
    {
      title: 'Quality Testing & Certification',
      description: 'In-house testing lab ensuring product quality standards',
      icon: '🔬'
    },
    {
      title: 'After-Sales Support',
      description: '24/7 customer support and technical assistance',
      icon: '💬'
    },
  ],

  infrastructure: [
    { item: 'Modern warehouse facility', details: '10,000 sq ft climate-controlled storage' },
    { item: 'Temperature-controlled storage', details: 'Maintaining optimal product conditions' },
    { item: 'Advanced inventory management', details: 'Real-time stock tracking system' },
    { item: 'Quality testing laboratory', details: 'ISO-certified testing equipment' },
    { item: 'Fleet of delivery vehicles', details: '15+ trucks for timely delivery' },
    { item: 'Experienced technical team', details: '25+ qualified professionals' },
  ],

  businessInfo: {
    natureOfBusiness: 'Wholesale Supplier & Distributor',
    yearEstablished: '2009',
    legalStatus: 'Partnership Firm',
    numberOfEmployees: '50-100',
    annualTurnover: '₹10-25 Crore',
    importExport: 'Exporter & Importer',
    gstNumber: '27XXXXX1234X1XX',
  },

  paymentTerms: [
    { method: 'Cash', accepted: true },
    { method: 'Credit Card', accepted: true },
    { method: 'Debit Card', accepted: true },
    { method: 'Net Banking', accepted: true },
    { method: 'UPI', accepted: true },
    { method: 'Letter of Credit (L/C)', accepted: true },
    { method: 'Cheque', accepted: true },
  ],

  deliveryTerms: {
    packaging: 'Standard industrial packaging with protective materials',
    deliveryTime: '7-10 business days',
    moq: 'Varies by product (minimum 20 units)',
    supplyAbility: '10,000+ units per month',
    portOfDispatch: 'Pune, Maharashtra',
  },
}

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Emulsion Paint - Interior',
    price: '₹ 350 / Liter',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop',
    moq: '20 Liters',
    category: 'Interior Paints',
  },
  {
    id: '2',
    name: 'Exterior Weather Shield Paint',
    price: '₹ 425 / Liter',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop',
    moq: '50 Liters',
    category: 'Exterior Paints',
  },
  {
    id: '3',
    name: 'Wood Finish Coating',
    price: '₹ 280 / Liter',
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=300&h=300&fit=crop',
    moq: '10 Liters',
    category: 'Wood Coatings',
  },
  {
    id: '4',
    name: 'Industrial Epoxy Paint',
    price: '₹ 550 / Liter',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop',
    moq: '100 Liters',
    category: 'Industrial Coatings',
  },
  {
    id: '5',
    name: 'Waterproofing Solution',
    price: '₹ 320 / Liter',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=300&h=300&fit=crop',
    moq: '25 Liters',
    category: 'Waterproofing',
  },
  {
    id: '6',
    name: 'Anti-Rust Primer',
    price: '₹ 290 / Liter',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop',
    moq: '30 Liters',
    category: 'Primers',
  },
]

const allProducts: Product[] = [
  ...featuredProducts,
  {
    id: '7',
    name: 'Texture Paint - Premium',
    price: '₹ 480 / Liter',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop',
    moq: '15 Liters',
    category: 'Decorative Paints',
  },
  {
    id: '8',
    name: 'Distemper Paint',
    price: '₹ 180 / Liter',
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=300&h=300&fit=crop',
    moq: '40 Liters',
    category: 'Budget Paints',
  },
]

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Kumar Construction Pvt Ltd',
    rating: 5,
    comment: 'Excellent quality products and timely delivery. We have been working with Harilal Paints for 3 years now and they never disappoint. Their technical team is very knowledgeable and always ready to help with product recommendations.',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'Sharma Interiors',
    rating: 4.5,
    comment: 'Great customer service and competitive pricing. The technical team is very knowledgeable and helpful. They helped us choose the perfect colors for our client projects.',
    date: '1 month ago',
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'Patel Hardware Store',
    rating: 5,
    comment: 'Reliable supplier with consistent quality. Highly recommended for bulk orders. Their delivery is always on time and the packaging is excellent.',
    date: '2 months ago',
  },
  {
    id: '4',
    name: 'Neha Gupta',
    company: 'Gupta Builders',
    rating: 4.5,
    comment: 'Professional service and excellent product range. They have everything we need under one roof which makes procurement so much easier.',
    date: '2 months ago',
  },
  {
    id: '5',
    name: 'Suresh Reddy',
    company: 'Reddy Enterprises',
    rating: 5,
    comment: 'Outstanding service! Been purchasing from them for over 5 years. Their custom color mixing service is exceptional.',
    date: '3 months ago',
  },
]

function SellerProfilePage() {
  const [showAllProducts, setShowAllProducts] = useState(false)
  const displayProducts = showAllProducts ? allProducts : featuredProducts

  return (
    <>
      <PageMeta
        title={`${sellerData.companyName} - ${sellerData.tagline}`}
        description={sellerData.about}
      />

      {/* Cover Image Section */}
      <Box
        sx={{
          height: 320,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${sellerData.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          mb: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', pb: 3 }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              width: '100%',
            }}
          >
            {/* Company Logo */}
            <Avatar
              src={sellerData.logo}
              sx={{
                width: 160,
                height: 160,
                border: '6px solid white',
                boxShadow: 4,
                position: 'relative',
                top: 70,
              }}
            />

            <Box sx={{ flex: 1, color: 'white', pb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h3" fontWeight={700} sx={{ fontFamily: '"Playfair Display", serif' }}>
                  {sellerData.companyName}
                </Typography>
                {sellerData.trustSeal && (
                  <Chip
                    icon={<Security sx={{ fontSize: 18 }} />}
                    label="TrustSEAL Verified"
                    size="small"
                    sx={{
                      bgcolor: '#10b981',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 28,
                    }}
                  />
                )}
                {sellerData.verified && (
                  <Verified sx={{ color: '#3b82f6', fontSize: 32 }} />
                )}
                {sellerData.gstVerified && (
                  <Chip
                    label="GST ✓"
                    size="small"
                    sx={{
                      bgcolor: '#f59e0b',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.95, fontWeight: 400 }}>
                {sellerData.tagline}
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Rating value={sellerData.rating} precision={0.1} size="medium" readOnly />
                  <Typography variant="h6" fontWeight={700}>
                    {sellerData.rating}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    ({sellerData.totalReviews} reviews)
                  </Typography>
                </Stack>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'white', opacity: 0.3 }} />
                <Typography variant="body1" fontWeight={500}>
                  <CalendarToday sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  {sellerData.yearsInBusiness} Years in Business
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'white', opacity: 0.3 }} />
                <Typography variant="body1" fontWeight={500}>
                  <TrendingUp sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  {sellerData.stats.successRate}% Success Rate
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ pb: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ContactMail />}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Contact Supplier
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<WhatsApp />}
                sx={{
                  bgcolor: '#25D366',
                  '&:hover': { bgcolor: '#1da851' },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                WhatsApp
              </Button>
              <IconButton
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f3f4f6' },
                  width: 48,
                  height: 48,
                }}
              >
                <Share />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#f3f4f6' },
                  width: 48,
                  height: 48,
                }}
              >
                <Bookmark />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Left Sidebar */}
          <Grid item xs={12} lg={3}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
              {/* Quick Stats */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <BarChart sx={{ color: '#3b82f6' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Quick Stats
                    </Typography>
                  </Stack>
                  <Stack spacing={2.5}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Inventory sx={{ color: '#6b7280', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Total Products
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          {sellerData.stats.totalProducts}+
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Group sx={{ color: '#6b7280', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Active Buyers
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          {sellerData.stats.activeBuyers}+
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Public sx={{ color: '#6b7280', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Monthly Visitors
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          {sellerData.stats.monthlyVisitors}+
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalShipping sx={{ color: '#6b7280', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Delivery Rate
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {sellerData.stats.deliveryRate}%
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <People sx={{ color: '#6b7280', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Repeat Customers
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {sellerData.stats.repeatCustomers}%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Response Details */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Speed sx={{ color: '#3b82f6' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Response Details
                    </Typography>
                  </Stack>
                  <Stack spacing={2.5}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Response Time
                        </Typography>
                        <Chip
                          label={sellerData.responseTime}
                          size="small"
                          sx={{
                            bgcolor: '#10b981',
                            color: 'white',
                            fontWeight: 600,
                            height: 24,
                          }}
                        />
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Response Rate
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {sellerData.responseRate}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={sellerData.responseRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#10b981',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <EmojiEvents sx={{ color: '#f59e0b' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Certifications
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {sellerData.certifications.map((cert, idx) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e5e7eb',
                          borderRadius: 1.5,
                          bgcolor: '#f9fafb',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                            }}
                          >
                            {cert.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {cert.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Since {cert.year}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <ContactMail sx={{ color: '#3b82f6' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Contact Information
                    </Typography>
                  </Stack>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5}>
                      <LocationOn sx={{ color: '#6b7280', fontSize: 22, mt: 0.5, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {sellerData.contact.address}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Phone sx={{ color: '#6b7280', fontSize: 22 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {sellerData.contact.phone}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Email sx={{ color: '#6b7280', fontSize: 22 }} />
                      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                        {sellerData.contact.email}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Language sx={{ color: '#6b7280', fontSize: 22 }} />
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {sellerData.contact.website}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                    Connect With Us
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <IconButton size="medium" sx={{ bgcolor: '#1877f2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}>
                      <Facebook />
                    </IconButton>
                    <IconButton size="medium" sx={{ bgcolor: '#E4405F', color: 'white', '&:hover': { bgcolor: '#d62d51' } }}>
                      <Instagram />
                    </IconButton>
                    <IconButton size="medium" sx={{ bgcolor: '#0077b5', color: 'white', '&:hover': { bgcolor: '#006399' } }}>
                      <LinkedIn />
                    </IconButton>
                    <IconButton size="medium" sx={{ bgcolor: '#1DA1F2', color: 'white', '&:hover': { bgcolor: '#1a8cd8' } }}>
                      <Twitter />
                    </IconButton>
                    <IconButton size="medium" sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#1da851' } }}>
                      <WhatsApp />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} lg={9}>
            <Stack spacing={4}>
              {/* About Company Section */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Business sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={700}>
                      About {sellerData.companyName}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 4,
                      lineHeight: 1.8,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {sellerData.about}
                  </Typography>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight={500}>
                      We prioritize quality, reliability, and customer satisfaction in everything we do.
                      Our commitment to excellence has made us a trusted partner for businesses across India.
                    </Typography>
                  </Alert>

                  {/* Business Information Table */}
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 4 }}>
                    <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Business Information
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%', bgcolor: '#f9fafb' }}>
                            Nature of Business
                          </TableCell>
                          <TableCell>{sellerData.businessInfo.natureOfBusiness}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            Year Established
                          </TableCell>
                          <TableCell>{sellerData.businessInfo.yearEstablished}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            Legal Status
                          </TableCell>
                          <TableCell>{sellerData.businessInfo.legalStatus}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            Number of Employees
                          </TableCell>
                          <TableCell>{sellerData.businessInfo.numberOfEmployees}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            Annual Turnover
                          </TableCell>
                          <TableCell>
                            <Chip label={sellerData.businessInfo.annualTurnover} color="success" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            Import & Export
                          </TableCell>
                          <TableCell>{sellerData.businessInfo.importExport}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>
                            GST Number
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">{sellerData.businessInfo.gstNumber}</Typography>
                              <Chip label="Verified" color="success" size="small" icon={<Verified />} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Services Section */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <HandshakeOutlined sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={700}>
                      Our Services
                    </Typography>
                  </Stack>

                  <Grid container spacing={3}>
                    {sellerData.services.map((service, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: '1px solid #e5e7eb',
                            borderLeft: '4px solid #3b82f6',
                            borderRadius: 1.5,
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-4px)',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0,
                              }}
                            >
                              {service.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight={700} gutterBottom>
                                {service.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {service.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Infrastructure Section */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Inventory sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={700}>
                      Infrastructure & Facilities
                    </Typography>
                  </Stack>

                  <Grid container spacing={2.5}>
                    {sellerData.infrastructure.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: '1px solid #e5e7eb',
                            borderRadius: 1.5,
                            bgcolor: '#f9fafb',
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <CheckCircle sx={{ color: '#10b981', fontSize: 24, mt: 0.25 }} />
                            <Box>
                              <Typography variant="body1" fontWeight={600} gutterBottom>
                                {item.item}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.details}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ViewModule sx={{ color: '#3b82f6', fontSize: 28 }} />
                      <Typography variant="h4" fontWeight={700}>
                        {showAllProducts ? 'All Products' : 'Featured Products'}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      onClick={() => setShowAllProducts(!showAllProducts)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {showAllProducts ? 'Show Less' : `View All ${allProducts.length} Products`}
                    </Button>
                  </Stack>

                  <Grid container spacing={3}>
                    {displayProducts.map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            height: '100%',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-6px)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 220,
                              backgroundImage: `url(${product.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                            }}
                          >
                            <Chip
                              label={product.category}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ minHeight: 48 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                              {product.price}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                              <LocalOffer sx={{ fontSize: 16, color: '#6b7280' }} />
                              <Typography variant="caption" color="text.secondary">
                                MOQ: {product.moq}
                              </Typography>
                            </Stack>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{
                                bgcolor: '#10b981',
                                '&:hover': { bgcolor: '#059669' },
                                fontWeight: 600,
                                textTransform: 'none',
                              }}
                            >
                              Get Best Quote
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment & Delivery Terms */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <CreditCard sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight={700}>
                      Payment & Delivery Terms
                    </Typography>
                  </Stack>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Accepted Payment Methods
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {sellerData.paymentTerms.map((payment, idx) => (
                          <Paper
                            key={idx}
                            elevation={0}
                            sx={{
                              p: 2,
                              border: '1px solid #e5e7eb',
                              borderRadius: 1.5,
                              bgcolor: payment.accepted ? '#f0fdf4' : '#fef2f2',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight={500}>
                                {payment.method}
                              </Typography>
                              {payment.accepted ? (
                                <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                              ) : (
                                <Typography variant="caption" color="error">
                                  Not Available
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        <LocalShipping sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Delivery Information
                      </Typography>
                      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', mt: 2 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>Packaging</TableCell>
                              <TableCell>{sellerData.deliveryTerms.packaging}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>Delivery Time</TableCell>
                              <TableCell>
                                <Chip label={sellerData.deliveryTerms.deliveryTime} color="success" size="small" />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>Minimum Order Quantity</TableCell>
                              <TableCell>{sellerData.deliveryTerms.moq}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>Supply Ability</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600} color="primary">
                                  {sellerData.deliveryTerms.supplyAbility}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, bgcolor: '#f9fafb' }}>Port of Dispatch</TableCell>
                              <TableCell>{sellerData.deliveryTerms.portOfDispatch}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Customer Reviews Section */}
              <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Star sx={{ color: '#f59e0b', fontSize: 28 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          Customer Reviews
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Rating value={sellerData.rating} precision={0.1} size="small" readOnly />
                          <Typography variant="h6" fontWeight={700}>
                            {sellerData.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({sellerData.totalReviews} reviews)
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: '#3b82f6',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Write a Review
                    </Button>
                  </Stack>

                  {/* Rating Distribution */}
                  <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = stars === 5 ? 75 : stars === 4 ? 20 : stars === 3 ? 3 : stars === 2 ? 1 : 1
                        return (
                          <Grid item xs={12} sm={6} md={4} key={stars}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 60 }}>
                                {stars} Star
                              </Typography>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={percentage}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: '#e5e7eb',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: '#f59e0b',
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                                {percentage}%
                              </Typography>
                            </Stack>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Paper>

                  <Stack spacing={3}>
                    {testimonials.map((testimonial) => (
                      <Paper
                        key={testimonial.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          border: '1px solid #e5e7eb',
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2.5}>
                          <Avatar
                            sx={{
                              bgcolor: '#3b82f6',
                              width: 56,
                              height: 56,
                              fontSize: '1.5rem',
                              fontWeight: 700,
                            }}
                          >
                            {testimonial.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {testimonial.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {testimonial.company}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {testimonial.date}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 1.5 }}>
                              <Rating value={testimonial.rating} precision={0.5} size="small" readOnly />
                              <Typography variant="body2" fontWeight={600}>
                                {testimonial.rating}/5
                              </Typography>
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                              {testimonial.comment}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                              <Button size="small" startIcon={<ThumbUp />} sx={{ textTransform: 'none' }}>
                                Helpful (12)
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: 3,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Ready to Place Your Order?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                  Contact us today for the best quotes and exceptional service
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ContactMail />}
                    sx={{
                      bgcolor: '#10b981',
                      '&:hover': { bgcolor: '#059669' },
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Get Quote Now
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Phone />}
                    sx={{
                      bgcolor: 'white',
                      color: '#3b82f6',
                      '&:hover': { bgcolor: '#f3f4f6' },
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Call Now
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WhatsApp />}
                    sx={{
                      bgcolor: '#25D366',
                      '&:hover': { bgcolor: '#1da851' },
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    WhatsApp
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container >

      {/* Footer Spacer */}
      < Box sx={{ py: 6 }
      } />
    </>
  )
}

SellerProfilePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default SellerProfilePage

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