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
  Paper,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Card,
  Stack,
  IconButton,
  Menu,
  Switch,
  Divider,
  Avatar,
  alpha,
  Tooltip,
} from '@mui/material'
import {
  Search,
  Add,
  FilterList,
  Edit,
  Delete,
  MoreVert,
  Inventory2,
  LocalOffer,
  TrendingUp,
  Image as ImageIcon,
  ShoppingCart,
  Visibility,
  VisibilityOff,
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
  minOrderQty: number
  images: string[]
  enabled: boolean
  stock: number
  sku: string
  featured?: boolean
  createdAt: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    price: 299,
    unit: 'piece',
    category: 'Apparel',
    minOrderQty: 10,
    sku: 'APP-TSH-001',
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100&h=100&fit=crop',
    ],
    enabled: true,
    featured: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Professional Wireless Mouse',
    price: 899,
    unit: 'piece',
    category: 'Electronics',
    minOrderQty: 5,
    sku: 'ELE-MOU-002',
    stock: 85,
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=100&h=100&fit=crop',
    ],
    enabled: true,
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    price: 450,
    unit: 'piece',
    category: 'Home & Living',
    minOrderQty: 20,
    sku: 'HOM-BOT-003',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=100&h=100&fit=crop',
    ],
    enabled: true,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'Leather Office Bag',
    price: 2499,
    unit: 'piece',
    category: 'Accessories',
    minOrderQty: 5,
    sku: 'ACC-BAG-004',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    ],
    enabled: false,
    featured: true,
    createdAt: '2024-01-22',
  },
  {
    id: '5',
    name: 'Organic Green Tea 100g',
    price: 350,
    unit: 'box',
    category: 'Food & Beverages',
    minOrderQty: 50,
    sku: 'FOD-TEA-005',
    stock: 320,
    images: [],
    enabled: true,
    createdAt: '2024-01-25',
  },
]

function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({})

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category))]
    return cats
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.sku.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }
      return true
    })
  }, [products, searchTerm, selectedCategory])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl({ ...anchorEl, [productId]: event.currentTarget })
  }

  const handleMenuClose = (productId: string) => {
    setAnchorEl({ ...anchorEl, [productId]: null })
  }

  const handleToggleEnabled = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, enabled: !p.enabled } : p
    ))
  }

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId))
    }
    handleMenuClose(productId)
  }

  const stats = [
    { label: 'Total Products', value: products.length, icon: Inventory2, color: '#3b82f6' },
    { label: 'Active', value: products.filter(p => p.enabled).length, icon: TrendingUp, color: '#10b981' },
    { label: 'Categories', value: categories.length - 1, icon: LocalOffer, color: '#8b5cf6' },
  ]

  return (
    <>
      <PageMeta title="Products - Seller Dashboard" metaRobots={['noindex']} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                <Trans id="Products Management" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Trans id="View and manage your product inventory" />
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: '#10b981',
                px: 3,
                py: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                '&:hover': {
                  bgcolor: '#059669',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
                },
              }}
            >
              <Trans id="Add New Product" />
            </Button>
          </Box>

          {/* Stats */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    flex: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: stat.color,
                      boxShadow: `0 4px 12px ${alpha(stat.color, 0.15)}`,
                    },
                  }}
                >
                  <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha(stat.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              )
            })}
          </Stack>
        </Box>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ fontSize: 20 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.filter(c => c !== 'all').map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="recent">Recent First</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Products List */}
        <Stack spacing={2}>
          {filteredProducts.map(product => (
            <Card
              key={product.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: product.enabled ? 'divider' : alpha('#ef4444', 0.2),
                borderRadius: 2,
                transition: 'all 0.2s',
                bgcolor: product.enabled ? 'white' : alpha('#f3f4f6', 0.5),
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: product.enabled ? 'primary.main' : alpha('#ef4444', 0.3),
                },
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  {/* Images */}
                  <Box sx={{ display: 'flex', gap: 1, minWidth: 140 }}>
                    {product.images.length > 0 ? (
                      <>
                        <Avatar
                          variant="rounded"
                          src={product.images[0]}
                          sx={{
                            width: 80,
                            height: 80,
                            border: '2px solid',
                            borderColor: 'divider',
                          }}
                        />
                        {product.images.length > 1 && (
                          <Stack spacing={0.5}>
                            {product.images.slice(1, 3).map((img, idx) => (
                              <Avatar
                                key={idx}
                                variant="rounded"
                                src={img}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                            ))}
                            {product.images.length > 3 && (
                              <Box
                                sx={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 1,
                                  bgcolor: alpha('#000', 0.7),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
                                  +{product.images.length - 3}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        )}
                      </>
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha('#94a3b8', 0.1),
                          border: '2px dashed',
                          borderColor: '#cbd5e1',
                        }}
                      >
                        <ImageIcon sx={{ color: '#94a3b8', fontSize: 32 }} />
                      </Avatar>
                    )}
                  </Box>

                  {/* Product Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: '1.125rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {product.name}
                          </Typography>
                          {product.featured && (
                            <Chip
                              label="Featured"
                              size="small"
                              sx={{
                                bgcolor: '#f59e0b',
                                color: 'white',
                                fontWeight: 700,
                                height: 20,
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                          {!product.enabled && (
                            <Chip
                              label="Disabled"
                              size="small"
                              sx={{
                                bgcolor: alpha('#ef4444', 0.1),
                                color: '#ef4444',
                                fontWeight: 700,
                                height: 20,
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          SKU: {product.sku}
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} flexWrap="wrap">
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Category
                          </Typography>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{
                              bgcolor: alpha('#3b82f6', 0.1),
                              color: '#3b82f6',
                              fontWeight: 600,
                              height: 24,
                              mt: 0.5,
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Price
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                            ₹{product.price.toLocaleString()} / {product.unit}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Min. Order
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {product.minOrderQty} {product.unit}{product.minOrderQty > 1 ? 's' : ''}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Stock
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              mt: 0.5,
                              color: product.stock > 50 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                            }}
                          >
                            {product.stock} units
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={product.enabled ? 'Enabled' : 'Disabled'}>
                        <Switch
                          checked={product.enabled}
                          onChange={() => handleToggleEnabled(product.id)}
                          color="success"
                        />
                      </Tooltip>

                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: alpha('#3b82f6', 0.1),
                            '&:hover': { bgcolor: alpha('#3b82f6', 0.2) },
                          }}
                        >
                          <Edit sx={{ fontSize: 18, color: '#3b82f6' }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(product.id)}
                          sx={{
                            bgcolor: alpha('#ef4444', 0.1),
                            '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                          }}
                        >
                          <Delete sx={{ fontSize: 18, color: '#ef4444' }} />
                        </IconButton>
                      </Tooltip>

                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product.id)}
                      >
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl[product.id]}
                        open={Boolean(anchorEl[product.id])}
                        onClose={() => handleMenuClose(product.id)}
                      >
                        <MenuItem onClick={() => handleMenuClose(product.id)}>
                          <Visibility sx={{ mr: 1, fontSize: 18 }} />
                          View Details
                        </MenuItem>
                        <MenuItem onClick={() => handleMenuClose(product.id)}>
                          <ShoppingCart sx={{ mr: 1, fontSize: 18 }} />
                          Duplicate
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={() => handleDelete(product.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete sx={{ mr: 1, fontSize: 18 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Inventory2 sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No products found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              sx={{
                bgcolor: '#3b82f6',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#2563eb',
                },
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