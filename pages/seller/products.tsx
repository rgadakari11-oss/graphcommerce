import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import {
  Box,
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
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
} from '@mui/material'
import {
  Search,
  Add,
  FilterList,
  Delete,
  MoreVert,
  Inventory2,
  Image as ImageIcon,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
} from '@mui/icons-material'
import React, { useState, useMemo } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { getSellerId } from '../../lib/utils/getMobileNumber'

const sellerId = getSellerId()
type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const SELLER_PRODUCTS_QUERY = gql`
  query SellerProducts($seller: String!, $pageSize: Int!, $currentPage: Int!) {
    products(
      filter: { seller_id: { match: $seller } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      items {
        uid
        sku
        name
        location
        seller
        url_key
        categories {
          uid
          name
          url_key
          __typename
        }
        small_image {
          url
          label
          __typename
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      total_count
      page_info {
        current_page
        page_size
        total_pages
        __typename
      }
      __typename
    }
  }
`

const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($sku: String!) {
    deleteProduct(sku: $sku) {
      success
      message
    }
  }
`

const TOGGLE_PRODUCT_STATUS_MUTATION = gql`
  mutation ToggleProductStatus($sku: String!, $status: Int!) {
    updateProduct(sku: $sku, input: { status: $status }) {
      success
      message
      product {
        id
        sku
      }
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphQLProduct {
  uid: string
  sku: string
  name: string
  location: string | null
  seller: string | null
  url_key: string
  status: number | null
  categories: Array<{ uid: string; name: string; url_key: string }>
  small_image: { url: string; label: string }
  price_range: {
    minimum_price: { regular_price: { value: number; currency: string } }
  }
}

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
  createdAt: string
  description?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const DEFAULT_PAGE_SIZE = 20

const allCategories = [
  'Apparel & Fashion',
  'Electronics & Gadgets',
  'Home & Kitchen',
  'Bags & Luggage',
  'Food & Beverages',
  'Building & Construction',
  'Health & Beauty',
  'Furniture & Decor',
  'Industrial & Tools',
  'Toys & Games',
]

// Magento status: 1 = Enabled, 2 = Disabled
const transformGraphQLProduct = (gqlProduct: GraphQLProduct): Product => ({
  id: gqlProduct.uid,
  name: gqlProduct.name,
  price: gqlProduct.price_range.minimum_price.regular_price.value,
  unit: 'piece',
  category: gqlProduct.categories[0]?.name || 'Uncategorized',
  minOrderQty: 10,
  images: gqlProduct.small_image?.url ? [gqlProduct.small_image.url] : [],
  enabled: gqlProduct.status !== 2,
  stock: 100,
  sku: gqlProduct.sku,
  createdAt: new Date().toISOString().split('T')[0],
  description: '',
})

// ─── Component ────────────────────────────────────────────────────────────────

function SellerProductsPage() {
  const router = useRouter()

  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // fetchPolicy: 'network-only' — always hits the server, never serves stale cache
  const { data, loading, error, refetch } = useQuery(SELLER_PRODUCTS_QUERY, {
    variables: { seller: sellerId, pageSize, currentPage },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true, // keeps `loading` true during refetch / page changes
  })

  const [deleteProduct, { loading: isDeleting }] = useMutation(DELETE_PRODUCT_MUTATION)
  const [toggleStatus, { loading: isToggling }] = useMutation(TOGGLE_PRODUCT_STATUS_MUTATION)

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({})

  // Optimistic local toggle map { sku: boolean }
  const [localEnabled, setLocalEnabled] = useState<Record<string, boolean>>({})

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sku: string; name: string }>({
    open: false,
    sku: '',
    name: '',
  })

  // Snackbar feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  })

  // ── Derived data ──────────────────────────────────────────────────────────────

  const products = useMemo(() => {
    if (!data?.products?.items) return []
    return data.products.items.map(transformGraphQLProduct)
  }, [data])

  // Total pages from server-side pagination info
  const totalPages = data?.products?.page_info?.total_pages ?? 1
  const totalCount = data?.products?.total_count ?? 0

  // Merge optimistic local state over server state
  const productsWithLocalState = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        enabled: p.sku in localEnabled ? localEnabled[p.sku] : p.enabled,
      })),
    [products, localEnabled]
  )

  const filteredProducts = useMemo(() => {
    let list = productsWithLocalState.filter((product) => {
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
      return true
    })
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price)
    else if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price)
    return list
  }, [productsWithLocalState, searchTerm, selectedCategory, sortBy])

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // reset to first page when page size changes
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl((prev) => ({ ...prev, [productId]: event.currentTarget }))
  }

  const handleMenuClose = (productId: string) => {
    setAnchorEl((prev) => ({ ...prev, [productId]: null }))
  }

  const handleEdit = (sku: string, productId: string) => {
    handleMenuClose(productId)
    router.push(`/seller/editproduct?sku=${encodeURIComponent(sku)}`)
  }

  // Toggle with optimistic update + API call + revert on failure
  const handleToggleEnabled = async (sku: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled
    setLocalEnabled((prev) => ({ ...prev, [sku]: newEnabled }))

    try {
      const { data: toggleData } = await toggleStatus({
        variables: { sku, status: newEnabled ? 1 : 2 },
      })

      if (!toggleData?.updateProduct?.success) {
        setLocalEnabled((prev) => ({ ...prev, [sku]: currentEnabled }))
        setSnackbar({
          open: true,
          message: toggleData?.updateProduct?.message || 'Failed to update status',
          severity: 'error',
        })
        return
      }

      setSnackbar({
        open: true,
        message: `Product ${newEnabled ? 'enabled' : 'disabled'} successfully`,
        severity: 'success',
      })
    } catch {
      setLocalEnabled((prev) => ({ ...prev, [sku]: currentEnabled }))
      setSnackbar({ open: true, message: 'Failed to update product status', severity: 'error' })
    }
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (sku: string, name: string, productId: string) => {
    handleMenuClose(productId)
    setDeleteDialog({ open: true, sku, name })
  }

  // Execute delete after confirmation
  const handleDeleteConfirm = async () => {
    const { sku } = deleteDialog
    setDeleteDialog((d) => ({ ...d, open: false }))

    try {
      const { data: deleteData } = await deleteProduct({ variables: { sku } })

      if (!deleteData?.deleteProduct?.success) {
        setSnackbar({
          open: true,
          message: deleteData?.deleteProduct?.message || 'Failed to delete product',
          severity: 'error',
        })
        return
      }

      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' })
      refetch()
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' })
    }
  }

  // ── Loading / error guards ────────────────────────────────────────────────────

  if (loading && products.length === 0) {
    return (
      <WaitForCustomer waitFor={customerQuery}>
        <SellerAccountLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </SellerAccountLayout>
      </WaitForCustomer>
    )
  }

  if (error) {
    return (
      <WaitForCustomer waitFor={customerQuery}>
        <SellerAccountLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="error">Error loading products</Typography>
            <Button onClick={() => refetch()} variant="contained">Retry</Button>
          </Box>
        </SellerAccountLayout>
      </WaitForCustomer>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <WaitForCustomer waitFor={customerQuery}>
      <SellerAccountLayout>
        <PageMeta title="My Products" metaRobots={['noindex']} />

        <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              <Trans id="My Products" />
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              href="/seller/addproduct"
              sx={{
                bgcolor: '#3b82f6', px: 3, py: 1.25, borderRadius: 2,
                textTransform: 'none', fontWeight: 600,
                boxShadow: '0 1px 3px rgba(59,130,246,0.2)',
                '&:hover': { bgcolor: '#2563eb', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' },
              }}
            >
              <Trans id="Add New Product" />
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {[
              { label: 'Total Products', value: totalCount, color: '#1e293b' },
              { label: 'Active', value: productsWithLocalState.filter((p) => p.enabled).length, color: '#059669' },
              { label: 'Inactive', value: productsWithLocalState.filter((p) => !p.enabled).length, color: '#ef4444' },
              { label: 'Categories', value: new Set(products.map((p) => p.category)).size, color: '#3b82f6' },
            ].map(({ label, value, color }) => (
              <Paper key={label} sx={{ flex: 1, p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>{label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList sx={{ color: '#64748b', ml: 1 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {allCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="recent">Recent First</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Category chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {['All', ...allCategories].map((cat) => {
              const val = cat === 'All' ? 'all' : cat
              const active = selectedCategory === val
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(val)}
                  variant={active ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    borderColor: '#cbd5e1',
                    color: active ? 'white' : '#64748b',
                    ...(active && { bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }),
                  }}
                />
              )
            })}
          </Box>

          {/* Page info + per-page selector */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {loading
                ? 'Loading…'
                : `Showing ${filteredProducts.length} of ${totalCount} product${totalCount !== 1 ? 's' : ''}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Per page:</Typography>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <Chip
                  key={size}
                  label={size}
                  size="small"
                  onClick={() => handlePageSizeChange(size)}
                  variant={pageSize === size ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderColor: '#cbd5e1',
                    color: pageSize === size ? 'white' : '#64748b',
                    ...(pageSize === size && { bgcolor: '#3b82f6' }),
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Products List — subtle overlay while loading new page */}
          <Box sx={{ position: 'relative' }}>
            {loading && products.length > 0 && (
              <Box sx={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 6,
                bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 2,
              }}>
                <CircularProgress size={32} />
              </Box>
            )}

            <Stack spacing={2}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${product.enabled ? '#e2e8f0' : alpha('#ef4444', 0.2)}`,
                    boxShadow: 'none',
                    opacity: product.enabled ? 1 : 0.82,
                    '&:hover': {
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      borderColor: product.enabled ? '#cbd5e1' : alpha('#ef4444', 0.4),
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 3 }}>

                    {/* Image */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {product.images.length > 0 ? (
                        <>
                          <Avatar
                            src={product.images[0]}
                            variant="rounded"
                            sx={{ width: 100, height: 100, border: '2px solid #e2e8f0' }}
                          />
                          {product.images.length > 1 && (
                            <Stack spacing={0.5}>
                              {product.images.slice(1, 3).map((img, idx) => (
                                <Avatar key={idx} src={img} variant="rounded" sx={{ width: 32, height: 32, border: '1px solid #e2e8f0' }} />
                              ))}
                              {product.images.length > 3 && (
                                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha('#3b82f6', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                  <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                                    +{product.images.length - 3}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          )}
                        </>
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 100, height: 100, bgcolor: '#f1f5f9', border: '2px solid #e2e8f0' }}>
                          <ImageIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                        </Avatar>
                      )}
                    </Box>

                    {/* Product Info */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>
                          {product.name}
                        </Typography>
                        <Chip
                          label={product.enabled ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: alpha(product.enabled ? '#059669' : '#ef4444', 0.1),
                            color: product.enabled ? '#059669' : '#ef4444',
                            fontWeight: 600,
                            height: 24,
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                          SKU: {product.sku}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Category:</Typography>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Price</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            ₹{product.price.toLocaleString()}
                            <Typography component="span" variant="body2" sx={{ color: '#64748b', fontWeight: 400, ml: 0.5 }}>
                              / {product.unit}
                            </Typography>
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Min. Order</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {product.minOrderQty} {product.unit}{product.minOrderQty > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Stock</Typography>
                          <Chip
                            label={`${product.stock} units`}
                            size="small"
                            sx={{
                              height: 24,
                              fontWeight: 600,
                              bgcolor: alpha(product.stock > 50 ? '#059669' : product.stock > 0 ? '#d97706' : '#dc2626', 0.1),
                              color: product.stock > 50 ? '#059669' : product.stock > 0 ? '#d97706' : '#dc2626',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                      <Tooltip title={product.enabled ? 'Click to disable listing' : 'Click to enable listing'}>
                        <span>
                          <Switch
                            checked={product.enabled}
                            onChange={() => handleToggleEnabled(product.sku, product.enabled)}
                            disabled={isToggling}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' },
                            }}
                          />
                        </span>
                      </Tooltip>

                      <Tooltip title="Edit product">
                        <IconButton
                          onClick={() => handleEdit(product.sku, product.id)}
                          sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>

                      <IconButton
                        onClick={(e) => handleMenuOpen(e, product.id)}
                        sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}
                      >
                        <MoreVert />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl[product.id]}
                        open={Boolean(anchorEl[product.id])}
                        onClose={() => handleMenuClose(product.id)}
                        PaperProps={{
                          sx: { borderRadius: 2, minWidth: 170, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                        }}
                      >
                        <MenuItem onClick={() => handleMenuClose(product.id)}>
                          <Visibility sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                          View Details
                        </MenuItem>
                        <MenuItem onClick={() => handleEdit(product.sku, product.id)}>
                          <Edit sx={{ mr: 1, fontSize: 20, color: '#3b82f6' }} />
                          <Typography sx={{ color: '#3b82f6' }}>Edit Product</Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          onClick={() => handleDeleteClick(product.sku, product.name, product.id)}
                          disabled={isDeleting}
                          sx={{ color: 'error.main' }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} sx={{ mr: 1, color: 'error.main' }} />
                          ) : (
                            <Delete sx={{ mr: 1, fontSize: 20 }} />
                          )}
                          Delete Product
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <Inventory2 sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>No products found</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Try adjusting your search or filters
              </Typography>
              <Button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
                sx={{ bgcolor: '#3b82f6', px: 3, py: 1, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}
              >
                Clear Filters
              </Button>
            </Box>
          )}

          {/* ── Pagination controls ── */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: 1.5, fontWeight: 600 },
                  '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#3b82f6', color: 'white' },
                }}
              />
            </Box>
          )}

        </Box>

        {/* ── Delete Confirmation Dialog ── */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#ef4444', fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700}>Delete Product?</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#475569' }}>
              You are about to permanently delete{' '}
              <strong style={{ color: '#1e293b' }}>{deleteDialog.name}</strong>.
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
              sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569', borderRadius: 2, flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              sx={{
                textTransform: 'none', bgcolor: '#ef4444', borderRadius: 2, flex: 1,
                '&:hover': { bgcolor: '#dc2626' },
              }}
              startIcon={isDeleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Delete />}
            >
              {isDeleting ? 'Deleting…' : 'Yes, Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
            icon={snackbar.severity === 'success' ? <CheckCircle /> : undefined}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </SellerAccountLayout>
    </WaitForCustomer>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}
SellerProductsPage.pageOptions = pageOptions
export default SellerProductsPage

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
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}