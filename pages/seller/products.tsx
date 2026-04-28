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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Search,
  Add,
  Delete,
  MoreVert,
  Inventory2,
  Image as ImageIcon,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
} from '@mui/icons-material'
import React, { useState, useMemo, useCallback } from 'react'
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

const ALL_SELLER_PRODUCTS_QUERY = gql`
  query allSellerProducts($seller_id: Int!, $search: String, $pageSize: Int) {
    allSellerProducts(seller_id: $seller_id, search: $search,pageSize: $pageSize
) {
      id
      name
      status
      url_key
      sku
      price
      unit_of_measurement
      unit_of_measurement_label
      mqa
      categories {
        id
        name
      }
      image
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
    toggleProductStatus(sku: $sku, status: $status) {
      success
      message
      product {
        id
        sku
        status
      }
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphQLProduct {
  id: number
  name: string
  status: number
  url_key: string
  sku: string
  price: number
  unit_of_measurement: string
  unit_of_measurement_label: string
  mqa: string | null
  categories: Array<{ id: number; name: string }>
  image: string | null
}

interface Product {
  id: string
  name: string
  price: number
  unit: string
  category: string
  minOrderQty: string
  images: string[]
  enabled: boolean
  sku: string
  url: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50]

const transformGraphQLProduct = (gqlProduct: GraphQLProduct): Product => ({
  id: String(gqlProduct.id),
  name: gqlProduct.name,
  price: gqlProduct.price,
  unit: gqlProduct.unit_of_measurement_label || '',
  category: gqlProduct.categories?.[0]?.name || 'Uncategorized',
  minOrderQty: gqlProduct.mqa || '1',
  // status 1 = active/enabled, anything else (e.g. 2) = disabled
  enabled: gqlProduct.status === 1,
  sku: gqlProduct.sku,
  images: gqlProduct.image ? [gqlProduct.image] : [],
  url: `/p/${gqlProduct.url_key}`, // ✅ ADD THIS

})

// ─── Component ────────────────────────────────────────────────────────────────

function SellerProductsPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })

  // ── Search — two-state pattern (input vs submitted) ──────────────────────
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSearchSubmit = () => {
    setSearchQuery(inputValue.trim())
    setCurrentPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchSubmit()
  }

  const queryVariables = useMemo(() => ({
    seller_id: Number(sellerId),
    pageSize: 50,
    ...(searchQuery ? { search: searchQuery } : {}),
  }), [searchQuery])

  const { data, loading, error, refetch } = useQuery(ALL_SELLER_PRODUCTS_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const [deleteProduct, { loading: isDeleting }] = useMutation(DELETE_PRODUCT_MUTATION)
  const [toggleStatus, { loading: isToggling }] = useMutation(TOGGLE_PRODUCT_STATUS_MUTATION)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({})
  const [localEnabled, setLocalEnabled] = useState<Record<string, boolean>>({})
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sku: string; name: string }>({
    open: false, sku: '', name: '',
  })
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error' | 'info',
  })

  // ── Derived data ──────────────────────────────────────────────────────────

  const allProducts = useMemo(() => {
    if (!data?.allSellerProducts) return []
    return data.allSellerProducts.map(transformGraphQLProduct)
  }, [data])

  // Merge server state with optimistic local toggle state
  const productsWithLocalState = useMemo(
    () => allProducts.map((p) => ({
      ...p,
      enabled: p.sku in localEnabled ? localEnabled[p.sku] : p.enabled,
    })),
    [allProducts, localEnabled]
  )

  // Client-side sort (search is server-side via the query variable)
  const sortedProducts = useMemo(() => {
    let list = [...productsWithLocalState]
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    // 'recent' = server order, no re-sort needed
    return list
  }, [productsWithLocalState, sortBy])

  // Client-side pagination
  const totalCount = sortedProducts.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, currentPage, pageSize])

  // Stats derived from full list (not just current page)
  const activeCount = productsWithLocalState.filter((p) => p.enabled).length
  const inactiveCount = productsWithLocalState.filter((p) => !p.enabled).length
  const categoryCount = new Set(allProducts.map((p) => p.category)).size

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) =>
    setAnchorEl((prev) => ({ ...prev, [id]: e.currentTarget }))
  const handleMenuClose = (id: string) =>
    setAnchorEl((prev) => ({ ...prev, [id]: null }))

  const handleEdit = (sku: string, id: string) => {
    handleMenuClose(id)
    router.push(`/seller/editproduct?sku=${encodeURIComponent(sku)}`)
  }

  const handleToggleEnabled = async (sku: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled
    setLocalEnabled((prev) => ({ ...prev, [sku]: newEnabled }))
    try {
      const { data: d } = await toggleStatus({ variables: { sku, status: newEnabled ? 1 : 2 } })
      if (!d?.toggleProductStatus?.success) {
        setLocalEnabled((prev) => ({ ...prev, [sku]: currentEnabled }))
        setSnackbar({ open: true, message: d?.toggleProductStatus?.message || 'Failed to update status', severity: 'error' })
        return
      }
      setSnackbar({ open: true, message: `Product ${newEnabled ? 'enabled' : 'disabled'} successfully`, severity: 'success' })
    } catch {
      setLocalEnabled((prev) => ({ ...prev, [sku]: currentEnabled }))
      setSnackbar({ open: true, message: 'Failed to update product status', severity: 'error' })
    }
  }

  const handleDeleteClick = (sku: string, name: string, id: string) => {
    handleMenuClose(id)
    setDeleteDialog({ open: true, sku, name })
  }

  const handleDeleteConfirm = async () => {
    const { sku } = deleteDialog
    setDeleteDialog((d) => ({ ...d, open: false }))
    try {
      const { data: d } = await deleteProduct({ variables: { sku } })
      if (!d?.deleteProduct?.success) {
        setSnackbar({ open: true, message: d?.deleteProduct?.message || 'Failed to delete product', severity: 'error' })
        return
      }
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' })
      refetch()
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' })
    }
  }

  const handleClearFilters = () => {
    setInputValue('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading && allProducts.length === 0) {
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <WaitForCustomer waitFor={customerQuery}>
      <SellerAccountLayout>
        <PageMeta title="My Products" metaRobots={['noindex']} />

        <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, gap: 1 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: '#1e293b' }}>
              <Trans id="My Products" />
            </Typography>
            <Button
              variant="contained" startIcon={<Add />} href="/seller/addproduct"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: '#3b82f6', px: { xs: 1.5, sm: 3 }, py: { xs: 1, sm: 1.25 },
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: '0 1px 3px rgba(59,130,246,0.2)',
                '&:hover': { bgcolor: '#2563eb', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' },
              }}
            >
              {isMobile ? 'Add' : <Trans id="Add New Product" />}
            </Button>
          </Box>

          {/* Stats — total is full list count; active = status 1 */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 },
          }}>
            {[
              { label: 'Total Products', value: totalCount, color: '#1e293b' },
              { label: 'Active', value: activeCount, color: '#059669' },
              { label: 'Inactive', value: inactiveCount, color: '#ef4444' },
              { label: 'Categories', value: categoryCount, color: '#3b82f6' },
            ].map(({ label, value, color }) => (
              <Paper key={label} sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  {label}
                </Typography>
                <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700, color }}>{value}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
            <TextField
              placeholder="Search by name or SKU"
              value={inputValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              sx={{ flex: 1 }} size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {loading && searchQuery
                      ? <CircularProgress size={16} sx={{ color: '#64748b' }} />
                      : <Search sx={{ color: '#64748b' }} />}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSearchSubmit}
                      sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ flexShrink: 0, minWidth: { xs: '100%', sm: 180 } }}>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="recent">Recent</MenuItem>
                <MenuItem value="name">Name A-Z</MenuItem>
                <MenuItem value="price-high">Price ↓</MenuItem>
                <MenuItem value="price-low">Price ↑</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Page info + per-page selector */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }, mb: 2,
          }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {loading
                ? 'Searching…'
                : `Showing ${paginatedProducts.length} of ${totalCount} product${totalCount !== 1 ? 's' : ''}${searchQuery ? ` for "${searchQuery}"` : ''}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Per page:</Typography>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <Chip key={size} label={size} size="small"
                  onClick={() => handlePageSizeChange(size)}
                  variant={pageSize === size ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600, cursor: 'pointer', borderColor: '#cbd5e1',
                    color: pageSize === size ? 'white' : '#64748b',
                    ...(pageSize === size && { bgcolor: '#3b82f6' }),
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Products list */}
          <Box sx={{ position: 'relative' }}>
            {loading && allProducts.length > 0 && (
              <Box sx={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 6,
                bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 2,
              }}>
                <CircularProgress size={32} />
              </Box>
            )}

            <Stack spacing={2}>
              {paginatedProducts.map((product) => (
                <Card key={product.id} sx={{
                  p: { xs: 1.5, sm: 2.5 }, borderRadius: 2,
                  border: `1px solid ${product.enabled ? '#e2e8f0' : alpha('#ef4444', 0.2)}`,
                  boxShadow: 'none', opacity: product.enabled ? 1 : 0.82,
                  '&:hover': {
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    borderColor: product.enabled ? '#cbd5e1' : alpha('#ef4444', 0.4),
                  },
                  transition: 'all 0.2s',
                }}>

                  {isMobile ? (
                    /* ── Mobile layout ── */
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        {product.images.length > 0
                          ? <Avatar src={product.images[0]} variant="rounded"
                            sx={{ width: 72, height: 72, flexShrink: 0, border: '2px solid #e2e8f0' }} />
                          : <Avatar variant="rounded"
                            sx={{ width: 72, height: 72, flexShrink: 0, bgcolor: '#f1f5f9', border: '2px solid #e2e8f0' }}>
                            <ImageIcon sx={{ fontSize: 28, color: '#cbd5e1' }} />
                          </Avatar>
                        }
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                            <Typography variant="subtitle1" onClick={() => router.push(product.url)}
                              sx={{
                                fontWeight: 600, color: '#1e293b', flex: 1,
                                overflow: 'hidden', textOverflow: 'ellipsis',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                fontSize: '0.9rem', lineHeight: 1.3,
                              }}>
                              {product.name}
                            </Typography>
                            <Chip label={product.enabled ? 'Active' : 'Inactive'} size="small" sx={{
                              flexShrink: 0,
                              bgcolor: alpha(product.enabled ? '#059669' : '#ef4444', 0.1),
                              color: product.enabled ? '#059669' : '#ef4444',
                              fontWeight: 600, height: 20, fontSize: '0.65rem',
                            }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                            SKU: {product.sku}
                          </Typography>
                          <Chip label={product.category} size="small"
                            sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }} />
                        </Box>
                      </Box>

                      <Box sx={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 1, mb: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5,
                      }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Price</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                            ₹{product.price.toLocaleString()}
                          </Typography>
                          {product.unit && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>/{product.unit}</Typography>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Min. Order</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {product.minOrderQty}
                          </Typography>
                          {product.unit && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>{product.unit}</Typography>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>Unit</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {product.unit || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Switch checked={product.enabled}
                            onChange={() => handleToggleEnabled(product.sku, product.enabled)}
                            disabled={isToggling} size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' },
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {product.enabled ? 'Enabled' : 'Disabled'}
                          </Typography>
                        </Box>
                        <Box>
                          {product.enabled && (

                            <IconButton size="small" onClick={() => handleEdit(product.sku, product.id)}
                              sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, product.id)}
                            sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    /* ── Desktop layout ── */
                    <Box sx={{ display: 'flex', gap: 3 }}>

                      {/* Image */}
                      <Box>
                        {product.images.length > 0 ? (
                          <Avatar src={product.images[0]} variant="rounded"
                            sx={{ width: 100, height: 100, border: '2px solid #e2e8f0' }} />
                        ) : (
                          <Avatar variant="rounded"
                            sx={{ width: 100, height: 100, bgcolor: '#f1f5f9', border: '2px solid #e2e8f0' }}>
                            <ImageIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                          </Avatar>
                        )}
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', flex: 1 }}>
                            {product.name}
                          </Typography>
                          <Chip label={product.enabled ? 'Active' : 'Inactive'} size="small" sx={{
                            bgcolor: alpha(product.enabled ? '#059669' : '#ef4444', 0.1),
                            color: product.enabled ? '#059669' : '#ef4444',
                            fontWeight: 600, height: 24,
                          }} />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                            SKU: {product.sku}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>Category:</Typography>
                            <Chip label={product.category} size="small"
                              sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }} />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Price</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              ₹{product.price.toLocaleString()}
                              {product.unit && (
                                <Typography component="span" variant="body2"
                                  sx={{ color: '#64748b', fontWeight: 400, ml: 0.5 }}>
                                  / {product.unit}
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Min. Order</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {product.minOrderQty}
                              {product.unit && (
                                <Typography component="span" variant="body2"
                                  sx={{ color: '#64748b', fontWeight: 400, ml: 0.5 }}>
                                  {product.unit}
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Unit</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {product.unit || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={product.enabled ? 'Click to disable listing' : 'Click to enable listing'}>
                          <span>
                            <Switch checked={product.enabled}
                              onChange={() => handleToggleEnabled(product.sku, product.enabled)}
                              disabled={isToggling} size="small"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' },
                              }}
                            />
                          </span>
                        </Tooltip>
                        {product.enabled && (

                          <Tooltip title="Edit product">
                            <IconButton onClick={() => handleEdit(product.sku, product.id)}
                              sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton onClick={(e) => handleMenuOpen(e, product.id)}
                          sx={{ color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}>
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>
                  )}

                  {/* Shared dropdown menu */}
                  <Menu
                    anchorEl={anchorEl[product.id]} open={Boolean(anchorEl[product.id])}
                    onClose={() => handleMenuClose(product.id)}
                    PaperProps={{ sx: { borderRadius: 2, minWidth: 170, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                  >
                    <MenuItem onClick={() => handleMenuClose(product.id)}>
                      <Visibility sx={{ mr: 1, fontSize: 20, color: '#64748b' }} />
                      View Details
                    </MenuItem>
                    {/* <MenuItem onClick={() => handleEdit(product.sku, product.id)}>
                      <Edit sx={{ mr: 1, fontSize: 20, color: '#3b82f6' }} />
                      <Typography sx={{ color: '#3b82f6' }}>Edit Product</Typography>
                    </MenuItem> */}
                    <Divider />
                    {/* <MenuItem onClick={() => handleDeleteClick(product.sku, product.name, product.id)}
                      disabled={isDeleting} sx={{ color: 'error.main' }}>
                      {isDeleting
                        ? <CircularProgress size={16} sx={{ mr: 1, color: 'error.main' }} />
                        : <Delete sx={{ mr: 1, fontSize: 20 }} />}
                      Delete Product
                    </MenuItem> */}
                  </Menu>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Empty state */}
          {paginatedProducts.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <Inventory2 sx={{ fontSize: { xs: 60, sm: 80 }, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products found'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Try adjusting your search or filters
              </Typography>
              <Button onClick={handleClearFilters}
                sx={{ bgcolor: '#3b82f6', px: 3, py: 1, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563eb' } }}>
                Clear Filters
              </Button>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4,
              flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 },
            }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Pagination
                count={totalPages} page={currentPage} onChange={handlePageChange}
                color="primary" shape="rounded" showFirstButton showLastButton
                size={isMobile ? 'small' : 'medium'} siblingCount={isMobile ? 0 : 1}
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: 1.5, fontWeight: 600 },
                  '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#3b82f6', color: 'white' },
                }}
              />
            </Box>
          )}

        </Box>

        {/* Delete dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
          maxWidth="xs" fullWidth fullScreen={isMobile}
          PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
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
            <Button variant="outlined" onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
              sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569', borderRadius: 2, flex: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleDeleteConfirm} disabled={isDeleting}
              sx={{ textTransform: 'none', bgcolor: '#ef4444', borderRadius: 2, flex: 1, '&:hover': { bgcolor: '#dc2626' } }}
              startIcon={isDeleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Delete />}>
              {isDeleting ? 'Deleting…' : 'Yes, Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open} autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}
            icon={snackbar.severity === 'success' ? <CheckCircle /> : undefined}>
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