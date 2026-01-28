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
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Card,
  CardContent,
  Stack,
  Alert,
  Menu,
  Badge,
} from '@mui/material'
import {
  Search,
  Add,
  Edit,
  MoreVert,
  CloudUpload,
  PhotoCamera,
  Videocam,
  PictureAsPdf,
  Category,
  Warning,
  AddCircle,
  FilterList,
  ExpandMore,
} from '@mui/icons-material'
import React, { useState, useMemo } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

interface Product {
  id: string
  name: string
  price: number
  unit: string
  category: string
  description: string
  group: string
  score: number
  images: string[]
  hasVideo: boolean
  hasPDF: boolean
  specifications: { [key: string]: string }
  warnings?: string[]
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'toy',
    price: 4,
    unit: 'piece',
    category: 'Kids Toys',
    description: '111',
    group: 'New Items',
    score: 0,
    images: [],
    hasVideo: false,
    hasPDF: false,
    specifications: {
      'Toy Type': '',
      'Recommended Age': '',
      'Material': '',
      'Theme/Character': '',
      'Power Source': '',
    },
    warnings: ['Product Price looks incorrect for Kids toys. Please correct it!'],
  },
  {
    id: '2',
    name: 'Asian Paint',
    price: 4521,
    unit: 'bucket',
    category: 'Asian Emulsion Paints',
    description: 'this is very good product with good detailsthis is very good product with good detailsthis is very good product with good detailsthis is very good product with good detailsthis is very good product with good details',
    group: 'Paint Products',
    score: 25,
    images: [],
    hasVideo: false,
    hasPDF: false,
    specifications: {
      'Product Series': '',
      'Pack Size': '',
      'Application Area': '',
    },
  },
  {
    id: '3',
    name: 'Premium Business Laptop 15.6" Intel Core i7',
    price: 45000,
    unit: 'piece',
    category: 'Laptops & Computers',
    description: 'High-performance business laptop featuring Intel Core i7 processor, 16GB RAM, and 512GB SSD. Perfect for professionals who need power and portability. Includes Windows 11 Pro, premium build quality, and extended battery life for all-day productivity.',
    group: 'Electronics',
    score: 85,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200&h=200&fit=crop',
    ],
    hasVideo: false,
    hasPDF: true,
    specifications: {
      'Processor': 'Intel Core i7',
      'RAM': '16GB DDR4',
      'Storage': '512GB SSD',
      'Screen Size': '15.6"',
      'Operating System': 'Windows 11 Pro',
    },
  },
]

const filterOptions = [
  { id: 'no-photo', label: 'No Photo', count: 5 },
  { id: 'no-price', label: 'No Price', count: 3 },
  { id: 'incorrect-price', label: 'Incorrect Price', count: 1, error: true },
  { id: 'low-score', label: 'Low Score', count: 5 },
  { id: 'no-specs', label: 'No Specifications', count: 5 },
  { id: 'no-desc', label: 'No Descriptions', count: 3 },
]

function ProductListingPage() {
  const [products] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Active filters
      if (activeFilters.length > 0) {
        if (activeFilters.includes('no-photo') && product.images.length > 0) return false
        if (activeFilters.includes('low-score') && product.score >= 50) return false
        if (activeFilters.includes('no-desc') && product.description.length > 100) return false
      }

      return true
    })
  }, [products, searchTerm, activeFilters])

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const getScoreColor = (score: number) => {
    if (score < 50) return '#ef4444'
    if (score < 80) return '#f59e0b'
    return '#10b981'
  }

  const getScoreLabel = (score: number) => {
    if (score < 50) return 'Low'
    if (score < 80) return 'Good'
    return 'Excellent'
  }

  return (
    <>
      <PageMeta title="Products - Manage Your Inventory" metaRobots={['noindex']} />

      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', py: 3, mb: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontFamily: '"Bitter", serif',
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Products
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
                <Chip
                  label={filteredProducts.length}
                  size="small"
                  sx={{
                    bgcolor: '#2563eb',
                    color: 'white',
                    fontWeight: 600,
                    height: 20,
                  }}
                />
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                sx={{ textTransform: 'none' }}
              >
                Quick Add
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/products/create"
                sx={{
                  textTransform: 'none',
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                }}
              >
                Add Product
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: '1px solid #e5e7eb',
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <TextField
                placeholder="Search by Name, Group, Category or Specification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1, minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                endIcon={<ExpandMore />}
                sx={{ textTransform: 'none' }}
              >
                All Products ({products.length})
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                >
                  <MenuItem value="recent">Recent Modified</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="price-high">Price (High to Low)</MenuItem>
                  <MenuItem value="price-low">Price (Low to High)</MenuItem>
                  <MenuItem value="score">Score (High to Low)</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Filter Tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Filter by:
              </Typography>
              {filterOptions.map(filter => (
                <Chip
                  key={filter.id}
                  label={
                    <>
                      {filter.label} <span style={{ opacity: 0.7, fontWeight: 600 }}>({filter.count})</span>
                    </>
                  }
                  onClick={() => handleFilterToggle(filter.id)}
                  variant={activeFilters.includes(filter.id) ? 'filled' : 'outlined'}
                  color={filter.error ? 'error' : 'default'}
                  sx={{
                    cursor: 'pointer',
                    ...(activeFilters.includes(filter.id) && !filter.error && {
                      bgcolor: '#2563eb',
                      color: 'white',
                      borderColor: '#2563eb',
                    }),
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Product Grid */}
        <Stack spacing={3}>
          {filteredProducts.map(product => (
            <Card
              key={product.id}
              elevation={0}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  {/* Image Gallery */}
                  <Grid item xs={12} md={2}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gridTemplateRows: 'repeat(3, 60px)',
                        gap: 0.5,
                      }}
                    >
                      {[...Array(6)].map((_, idx) => {
                        const image = product.images[idx]
                        const isVideo = idx === 3
                        const isPDF = idx === 4

                        return (
                          <Box
                            key={idx}
                            sx={{
                              bgcolor: image ? 'transparent' : '#f9fafb',
                              border: image ? 'none' : '2px dashed #e5e7eb',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              position: 'relative',
                              ...(idx === 0 && !image && {
                                borderColor: '#ef4444',
                                bgcolor: '#fef2f2',
                              }),
                              '&:hover': {
                                borderColor: '#2563eb',
                                bgcolor: image ? undefined : '#eff6ff',
                              },
                            }}
                          >
                            {image ? (
                              <>
                                <img
                                  src={image}
                                  alt={`Product ${idx + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {idx === 0 && (
                                  <Chip
                                    label="Primary"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      bottom: 2,
                                      left: 2,
                                      height: 16,
                                      fontSize: '0.625rem',
                                      bgcolor: '#2563eb',
                                      color: 'white',
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <Box sx={{ textAlign: 'center' }}>
                                {isVideo ? <Videocam sx={{ color: '#94a3b8', fontSize: 24 }} /> :
                                  isPDF ? <PictureAsPdf sx={{ color: '#94a3b8', fontSize: 24 }} /> :
                                    <PhotoCamera sx={{ color: idx === 0 ? '#ef4444' : '#94a3b8', fontSize: 24 }} />}
                              </Box>
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  </Grid>

                  {/* Product Details */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {product.name}
                        </Typography>
                        <IconButton size="small" sx={{ mt: -0.5 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          ₹ {product.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          /{product.unit}
                        </Typography>
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>

                      {product.warnings && product.warnings.length > 0 && (
                        <Alert
                          severity="error"
                          icon={<Warning />}
                          sx={{ mb: 2, py: 0.5 }}
                        >
                          {product.warnings[0]}
                        </Alert>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Category fontSize="small" />
                        <Chip
                          label={product.category}
                          size="small"
                          icon={<AddCircle />}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Product Description
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.description}
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          <>
                            <span style={{ fontWeight: 500, opacity: 0.8 }}>Group: </span>
                            <span style={{ fontWeight: 600 }}>{product.group}</span>
                          </>
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>

                  {/* Specifications */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: '#f9fafb',
                        p: 2,
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Specification/Additional Details
                      </Typography>
                      <Stack spacing={1}>
                        {Object.entries(product.specifications).slice(0, 5).map(([key, value]) => (
                          <Box
                            key={key}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {key}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={500}
                              color={value ? 'text.primary' : 'primary'}
                            >
                              {value || '(important)'}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          fontSize: '0.8125rem',
                        }}
                      >
                        Add specification to get more relevant enquiries!
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>

              {/* Score Section */}
              <Box
                sx={{
                  borderTop: '1px solid #e5e7eb',
                  bgcolor: '#f9fafb',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Score:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: getScoreColor(product.score) }}
                  >
                    {product.score}/100
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: 300,
                      height: 6,
                      bgcolor: '#e2e8f0',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${product.score}%`,
                        height: '100%',
                        bgcolor: getScoreColor(product.score),
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Stack>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Stack>

        {filteredProducts.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
            }}
          >
            <FilterList sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No products found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or search query
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('')
                setActiveFilters([])
              }}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1e40af' },
              }}
            >
              Clear Filters
            </Button>
          </Paper>
        )}
      </Container>
    </>
  )
}

ProductListingPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default ProductListingPage

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