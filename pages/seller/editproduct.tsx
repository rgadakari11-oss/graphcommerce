import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Skeleton,
  Autocomplete,
} from '@mui/material'
import {
  Add,
  Info,
  TrendingUp,
  Inventory,
  Description,
  LocalShipping,
  Category,
  ArrowBack,
  CheckCircle,
  Edit,
} from '@mui/icons-material'
import React, { useState, useEffect, useMemo } from 'react'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'

import { ImageUploadManager } from '../../components/seller/ImageUploadManager'
import { ProductQualityScore } from '../../components/seller/ProductQualityScore'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const GET_PRODUCT_QUERY = gql`
  query GetProductBySku($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        uid
        sku
        name
        description {
          html
        }
        categories {
          uid
          name
          url_key
        }
        small_image {
          url
          label
        }
        media_gallery {
          url
          label
          position
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
          }
        }
        special_price
        special_from_date
        special_to_date
        mqa
        unit_of_measurement
      }
    }
  }
`

/**
 * Fetch the selectable options for the `unit_of_measurement` custom attribute.
 * `customAttributeMetadata` is available in Magento 2 GraphQL out of the box.
 */
const GET_UNIT_OPTIONS_QUERY = gql`
  query GetUnitOfMeasurementOptions {
    customAttributeMetadata(
      attributes: [{ entity_type: "catalog_product", attribute_code: "unit_of_measurement" }]
    ) {
      items {
        attribute_options {
          label
          value
        }
      }
    }
  }
`

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($sku: String!, $input: UpdateProductInput!) {
    updateProduct(sku: $sku, input: $input) {
      success
      message
      product {
        id
        sku
        name
      }
      errors
    }
  }
`

const UPLOAD_PRODUCT_IMAGE_MUTATION = gql`
  mutation UploadProductImage($sku: String!, $images: [UploadProductImageInput!]!) {
    uploadProductImage(sku: $sku, images: $images) {
      success
      message
      files {
        file_path
        full_url
        type
      }
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageData {
  url: string
  file?: File
  isCover?: boolean
  isExisting?: boolean
}

interface UnitOption {
  label: string
  value: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SELLER_AUTH_KEY = 'seller-auth'

const getSellerEmailFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SELLER_AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw).email || null
  } catch {
    return null
  }
}

const categories = [
  {
    id: 'electronics',
    name: 'Electronics & Electrical',
    subCategories: [
      { id: 'mobile', name: 'Mobile Phones & Accessories' },
      { id: 'computer', name: 'Computer & Laptop' },
      { id: 'camera', name: 'Camera & Photography' },
      { id: 'home-appliances', name: 'Home Appliances' },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    subCategories: [
      { id: 'mens-clothing', name: "Men's Clothing" },
      { id: 'womens-clothing', name: "Women's Clothing" },
      { id: 'kids-clothing', name: "Kids' Clothing" },
      { id: 'footwear', name: 'Footwear' },
    ],
  },
  {
    id: 'home',
    name: 'Home & Furniture',
    subCategories: [
      { id: 'furniture', name: 'Furniture' },
      { id: 'home-decor', name: 'Home Decor' },
      { id: 'kitchen', name: 'Kitchen & Dining' },
      { id: 'bedding', name: 'Bedding & Bath' },
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial & Manufacturing',
    subCategories: [
      { id: 'machinery', name: 'Machinery & Equipment' },
      { id: 'tools', name: 'Tools & Hardware' },
      { id: 'raw-materials', name: 'Raw Materials' },
      { id: 'packaging', name: 'Packaging Materials' },
    ],
  },
]

const steps = ['Product Details', 'Specifications', 'Review & Update']

// ─── Page Component ───────────────────────────────────────────────────────────

function ProductEditPage() {
  const router = useRouter()
  const sku = router.query.sku as string | undefined

  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  // Fetch existing product
  const {
    data: productQueryData,
    loading: productLoading,
    error: productError,
  } = useQuery(GET_PRODUCT_QUERY, {
    variables: { sku },
    skip: !sku,
    fetchPolicy: 'network-only',
  })

  // Fetch unit_of_measurement attribute options
  const { data: unitOptionsData, loading: unitOptionsLoading } = useQuery(GET_UNIT_OPTIONS_QUERY, {
    fetchPolicy: 'cache-first', // attribute options rarely change — cache is fine here
  })

  // Derive the list of predefined unit options from the attribute metadata
  const predefinedUnitOptions: UnitOption[] = useMemo(() => {
    const items = unitOptionsData?.customAttributeMetadata?.items ?? []
    if (!items.length) return []
    return (items[0]?.attribute_options ?? []) as UnitOption[]
  }, [unitOptionsData])

  const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [uploadProductImageMutation, { loading: isUploadingImages }] = useMutation(
    UPLOAD_PRODUCT_IMAGE_MUTATION
  )

  // ── form state ──────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0)
  const [isPopulated, setIsPopulated] = useState(false)

  // Keeps the raw option id (e.g. "67") from the product response so we can
  // resolve it to a label once predefinedUnitOptions has finished loading.
  const [rawUnitId, setRawUnitId] = useState<string>('')

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    specialPrice: '',
    specialPriceFrom: '',
    specialPriceTo: '',
    // unitText is always the human-readable label sent to the API — never an option id/value
    unitText: '',
    minOrderQty: '',
    description: '',
    productionCapacity: '',
    productCode: '',
    deliveryTime: '',
    packagingDetails: '',
  })

  const [images, setImages] = useState<ImageData[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [categoryRequestOpen, setCategoryRequestOpen] = useState(false)
  const [requestedCategory, setRequestedCategory] = useState('')

  const [errors, setErrors] = useState({
    name: false,
    images: false,
    price: false,
    category: false,
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  })

  // ── Populate form from fetched product ──────────────────────────────────────────────
  useEffect(() => {
    const item = productQueryData?.products?.items?.[0]
    if (!item || isPopulated) return

    const rawDescription = item.description?.html ?? ''
    const plainDescription = rawDescription.replace(/<[^>]*>/g, '')

    // Save the raw Magento value (e.g. "67"). The resolution effect below
    // maps it to its label once predefinedUnitOptions has finished loading.
    const rawUnit = item.unit_of_measurement ? String(item.unit_of_measurement) : ''
    setRawUnitId(rawUnit)

    setProductData((prev) => ({
      ...prev,
      name: item.name ?? '',
      price: String(item.price_range?.minimum_price?.regular_price?.value ?? ''),
      specialPrice: item.special_price ? String(item.special_price) : '',
      specialPriceFrom: item.special_from_date ?? '',
      specialPriceTo: item.special_to_date ?? '',
      description: plainDescription,
      productCode: item.sku ?? '',
      minOrderQty: item.mqa ? String(item.mqa) : '',
      // Leave unitText empty here; it is resolved once options are available
      unitText: '',
    }))

    const galleryImages: ImageData[] = (item.media_gallery ?? []).map((img: any) => ({
      url: img.url,
      isExisting: true,
      isCover: img.position === 1,
    }))

    if (galleryImages.length === 0 && item.small_image?.url) {
      galleryImages.push({ url: item.small_image.url, isExisting: true, isCover: true })
    }

    setImages(galleryImages)

    const firstCat = item.categories?.[0]
    if (firstCat) {
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === firstCat.name?.toLowerCase()
      )
      if (matchedCat) setSelectedCategory(matchedCat.id)
    }

    setIsPopulated(true)
  }, [productQueryData, isPopulated])

  // ── Resolve raw unit option id → human-readable label ───────────────────────────────────
  // Runs whenever rawUnitId or predefinedUnitOptions changes, cleanly handling
  // the race between the product query and the attribute metadata query.
  useEffect(() => {
    if (!rawUnitId || !predefinedUnitOptions.length) return

    // Match the option whose `value` equals the raw id, e.g. "67" → "Kilogram"
    const matched = predefinedUnitOptions.find((opt) => opt.value === rawUnitId)

    // If no match the stored value is already a label string — use as-is
    const resolvedLabel = matched ? matched.label : rawUnitId

    setProductData((prev) => {
      if (prev.unitText === resolvedLabel) return prev   // skip redundant re-render
      return { ...prev, unitText: resolvedLabel }
    })
  }, [rawUnitId, predefinedUnitOptions])

  // ── Helpers ────────────────────────────────────────────────────────────────────────────
  // ── Helpers ─────────────────────────────────────────────────────────────────

  const validateStep = (step: number) => {
    const newErrors = { name: false, images: false, price: false, category: false }
    if (step === 0) {
      if (productData.name.trim().split(' ').filter((w) => w.length > 0).length < 3)
        newErrors.name = true
      if (images.length === 0) newErrors.images = true
      if (!productData.price || parseFloat(productData.price) <= 0) newErrors.price = true
      if (!selectedCategory) newErrors.category = true
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((p) => Math.min(p + 1, steps.length - 1))
  }

  const handleBack = () => {
    setErrors({ name: false, images: false, price: false, category: false })
    setActiveStep((p) => Math.max(p - 1, 0))
  }

  const handleInputChange =
    (field: string) =>
      (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
        const val = event.target.value as string
        setProductData((prev) => ({ ...prev, [field]: val }))
        if (field === 'name' && errors.name) {
          if (val.trim().split(' ').filter((w) => w.length > 0).length >= 3)
            setErrors((e) => ({ ...e, name: false }))
        }
        if (field === 'price' && errors.price) {
          if (parseFloat(val) > 0) setErrors((e) => ({ ...e, price: false }))
        }
      }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
    })

  const uploadNewImages = async (targetSku: string) => {
    const newImages = images.filter((img) => !img.isExisting && img.file)
    if (newImages.length === 0) return

    const imageInputs = await Promise.all(
      newImages.map(async (image, index) => ({
        filename: image.file!.name,
        base64_content: await fileToBase64(image.file!),
        type: index === 0 ? 'image' : 'gallery',
      }))
    )

    const { data } = await uploadProductImageMutation({
      variables: { sku: targetSku, images: imageInputs },
    })

    if (!data?.uploadProductImage?.success) {
      throw new Error(data?.uploadProductImage?.message || 'Failed to upload images')
    }
  }

  const handleUpdate = async () => {
    try {
      if (!sku) return

      const sellerEmail = getSellerEmailFromLocalStorage()
      if (!sellerEmail) {
        setSnackbar({ open: true, message: 'Seller session expired. Please login again.', severity: 'error' })
        return
      }

      setSnackbar({ open: true, message: 'Updating product…', severity: 'info' })

      const input: Record<string, unknown> = {
        name: productData.name,
        price: parseFloat(productData.price),
        description: productData.description || undefined,
        special_price: productData.specialPrice ? parseFloat(productData.specialPrice) : undefined,
        special_from_date: productData.specialPriceFrom || undefined,
        special_to_date: productData.specialPriceTo || undefined,
        // mqa attribute — send as number
        mqa: productData.minOrderQty
          ? String(productData.minOrderQty)
          : "1",        // unit_of_measurement — always pass the human-readable label text, not an option id
        unit_of_measurement: productData.unitText || undefined,
      }

      const { data: updateData } = await updateProduct({ variables: { sku, input } })

      if (!updateData?.updateProduct?.success) {
        const msgs = updateData?.updateProduct?.errors?.join(', ') || 'Failed to update product'
        throw new Error(msgs)
      }

      const hasNewImages = images.some((img) => !img.isExisting)
      if (hasNewImages) {
        setSnackbar({ open: true, message: 'Product updated! Uploading new images…', severity: 'info' })
        await uploadNewImages(sku)
      }

      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' })
      setTimeout(() => { window.location.href = '/seller/products' }, 2000)
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'An error occurred. Please try again.',
        severity: 'error',
      })
    }
  }

  const isProcessing = isUpdating || isUploadingImages

  // ── Loading / error states ──────────────────────────────────────────────────

  if (!sku) {
    return (
      <SellerAccountLayout>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">No product SKU provided.</Typography>
          <Button href="/seller/products" sx={{ mt: 2 }}>Back to Products</Button>
        </Box>
      </SellerAccountLayout>
    )
  }

  if (productLoading && !isPopulated) {
    return (
      <WaitForCustomer waitFor={customerQuery}>
        <SellerAccountLayout>
          <Box sx={{ maxWidth: '900px', mx: 'auto', p: 3 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Box>
        </SellerAccountLayout>
      </WaitForCustomer>
    )
  }

  if (productError) {
    return (
      <WaitForCustomer waitFor={customerQuery}>
        <SellerAccountLayout>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error">Error loading product</Typography>
            <Button href="/seller/products" sx={{ mt: 2 }}>Back to Products</Button>
          </Box>
        </SellerAccountLayout>
      </WaitForCustomer>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title={i18n._('Edit Product')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <IconButton
                href="/seller/products"
                sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Edit sx={{ color: '#3b82f6', fontSize: 22 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#334155' }}>
                    Edit Product
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  SKU: <strong>{sku}</strong> &nbsp;·&nbsp; Update the details below and click "Save Changes"
                </Typography>
              </Box>
            </Stack>

            {/* Stepper */}
            <Paper elevation={0} sx={{ borderRadius: 2, p: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-active': { color: '#3b82f6' },
                          '&.Mui-completed': { color: '#10b981' },
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Box>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}
              >
                {/* ── Step 0: Product Details ── */}
                {activeStep === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {/* Validation summary */}
                      {(errors.name || errors.images || errors.price || errors.category) && (
                        <Alert severity="error">
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                            Please complete the following required fields:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                            {errors.name && <li>Product Name (minimum 3 words)</li>}
                            {errors.category && <li>Product Category</li>}
                            {errors.images && <li>Product Images (at least 1 image)</li>}
                            {errors.price && <li>Regular Price</li>}
                          </Box>
                        </Alert>
                      )}

                      {/* Product Name */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Product Name *
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="Enter a descriptive product name (minimum 3 words)"
                          value={productData.name}
                          onChange={handleInputChange('name')}
                          size="small"
                          error={errors.name}
                          helperText={errors.name ? 'Product name must contain at least 3 words' : ''}
                        />
                      </Box>

                      {/* Category Selection */}
                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category sx={{ color: '#3b82f6', fontSize: 20 }} />
                            Product Category *
                          </Typography>
                          <Button size="small" startIcon={<Add />} onClick={() => setCategoryRequestOpen(true)} sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
                            Add Category
                          </Button>
                        </Stack>
                        <Stack spacing={2}>
                          <FormControl fullWidth size="small" error={errors.category}>
                            <InputLabel>Main Category</InputLabel>
                            <Select
                              value={selectedCategory}
                              onChange={(e) => {
                                setSelectedCategory(e.target.value)
                                setSelectedSubCategory('')
                                if (errors.category && e.target.value) setErrors((err) => ({ ...err, category: false }))
                              }}
                              label="Main Category"
                            >
                              {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                              ))}
                            </Select>
                            {errors.category && (
                              <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, ml: 1.5 }}>
                                Please select a category
                              </Typography>
                            )}
                          </FormControl>

                          {selectedCategory && (
                            <FormControl fullWidth size="small">
                              <InputLabel>Sub Category</InputLabel>
                              <Select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} label="Sub Category">
                                {categories.find((c) => c.id === selectedCategory)?.subCategories.map((sub) => (
                                  <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}

                          <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                            Can't find your category?{' '}
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                              onClick={() => setCategoryRequestOpen(true)}
                            >
                              Request to add new category
                            </Typography>
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Image Upload */}
                      <ImageUploadManager
                        images={images}
                        setImages={setImages}
                        errors={errors}
                        setErrors={setErrors}
                        setSnackbar={setSnackbar}
                      />

                      {/* Existing-image info banner */}
                      {images.some((img) => img.isExisting) && (
                        <Alert severity="info" icon={<Info />}>
                          Images already saved on this product are shown above. Upload new images to add more; removing an existing image requires saving the changes.
                        </Alert>
                      )}

                      {/* ── Pricing ── */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Pricing Information *
                        </Typography>
                        <Stack spacing={2.5}>

                          {/* Regular price row: price + unit (fetched from attribute) */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Regular Price</Typography>
                            <Grid container spacing={2} alignItems="flex-start">
                              {/* Price */}
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth
                                  label="Price"
                                  placeholder="0.00"
                                  value={productData.price}
                                  onChange={handleInputChange('price')}
                                  type="number"
                                  size="small"
                                  error={errors.price}
                                  helperText={errors.price ? 'Price must be greater than 0' : ''}
                                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                />
                              </Grid>

                              {/* Unit — Autocomplete with freeSolo so user can type a custom value */}
                              <Grid item xs={12} sm={7}>
                                <Autocomplete
                                  freeSolo
                                  size="small"
                                  options={predefinedUnitOptions}
                                  // getOptionLabel returns the visible text for each option object
                                  getOptionLabel={(opt) =>
                                    typeof opt === 'string' ? opt : opt.label
                                  }
                                  // The input value is always productData.unitText
                                  inputValue={productData.unitText}
                                  // When user picks from dropdown — store the label text
                                  onChange={(_e, newValue) => {
                                    const label =
                                      newValue == null
                                        ? ''
                                        : typeof newValue === 'string'
                                          ? newValue
                                          : newValue.label
                                    setProductData((prev) => ({ ...prev, unitText: label }))
                                  }}
                                  // When user types freely — update unitText directly
                                  onInputChange={(_e, newInputValue, reason) => {
                                    // 'reset' fires when the dropdown selection is already
                                    // handled by onChange above — skip to avoid double-set
                                    if (reason !== 'reset') {
                                      setProductData((prev) => ({ ...prev, unitText: newInputValue }))
                                    }
                                  }}
                                  loading={unitOptionsLoading}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Unit of Measurement"
                                      placeholder="e.g. Piece, Kg, Litre…"
                                      helperText="Select from the list or type a custom unit"
                                      InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                          <>
                                            {unitOptionsLoading && (
                                              <CircularProgress color="inherit" size={14} />
                                            )}
                                            {params.InputProps.endAdornment}
                                          </>
                                        ),
                                      }}
                                    />
                                  )}
                                  // Render each option showing only its label
                                  renderOption={(props, option) => (
                                    <li {...props} key={option.value}>
                                      {option.label}
                                    </li>
                                  )}
                                  // Allow the user to add a custom value not in the list
                                  filterOptions={(options, params) => {
                                    const filtered = options.filter((o) =>
                                      o.label.toLowerCase().includes(params.inputValue.toLowerCase())
                                    )
                                    const inputValue = params.inputValue.trim()
                                    const alreadyExists = options.some(
                                      (o) => o.label.toLowerCase() === inputValue.toLowerCase()
                                    )
                                    if (inputValue && !alreadyExists) {
                                      // Inject a synthetic "Add <value>" option
                                      filtered.push({ label: `Add "${inputValue}"`, value: `__custom__${inputValue}` })
                                    }
                                    return filtered
                                  }}
                                  // When user selects the synthetic "Add" option, strip the prefix
                                  isOptionEqualToValue={(option, val) =>
                                    option.value === val.value
                                  }
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Minimum Order Quantity (mqa attribute) */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                              Minimum Order Quantity
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth
                                  label="Min. Order Qty"
                                  placeholder="e.g. 50"
                                  value={productData.minOrderQty}
                                  onChange={handleInputChange('minOrderQty')}
                                  type="number"
                                  size="small"
                                  InputProps={{
                                    endAdornment: productData.unitText ? (
                                      <InputAdornment position="end">{productData.unitText}</InputAdornment>
                                    ) : undefined,
                                  }}
                                  helperText="Minimum quantity a buyer must order"
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Special Price */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Special Price (Optional)</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Special Price"
                                  placeholder="0.00"
                                  value={productData.specialPrice}
                                  onChange={handleInputChange('specialPrice')}
                                  type="number"
                                  size="small"
                                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                  helperText="Offer a discounted price for a limited time"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Special Price From" placeholder="DD/MM/YYYY" value={productData.specialPriceFrom} onChange={handleInputChange('specialPriceFrom')} size="small" helperText="Start date" />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Special Price To" placeholder="DD/MM/YYYY" value={productData.specialPriceTo} onChange={handleInputChange('specialPriceTo')} size="small" helperText="End date" />
                              </Grid>
                            </Grid>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Description */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Product Description
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="Provide a detailed description…"
                          value={productData.description}
                          onChange={handleInputChange('description')}
                          multiline
                          rows={5}
                          size="small"
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Minimum 100 characters recommended</Typography>
                          <Typography variant="caption" sx={{ color: productData.description.length > 100 ? '#10b981' : '#64748b', fontWeight: 500 }}>
                            {productData.description.length} / 4000
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* ── Step 1: Specifications ── (min order qty removed — now in Pricing) */}
                {activeStep === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.875rem' }}>
                        Additional details help buyers make informed decisions and improve your product ranking
                      </Alert>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Production Capacity"
                            placeholder="e.g., 5000 units/month"
                            value={productData.productionCapacity}
                            onChange={handleInputChange('productionCapacity')}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        label="Product Code / SKU"
                        placeholder="Your internal reference code"
                        value={productData.productCode}
                        onChange={handleInputChange('productCode')}
                        size="small"
                        disabled
                        helperText="SKU cannot be changed after product creation"
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Shipping & Delivery
                        </Typography>
                        <Stack spacing={2}>
                          <TextField fullWidth label="Estimated Delivery Time" placeholder="e.g., 5-7 business days" value={productData.deliveryTime} onChange={handleInputChange('deliveryTime')} size="small" />
                          <TextField fullWidth label="Packaging Details" placeholder="Describe packaging materials, dimensions…" value={productData.packagingDetails} onChange={handleInputChange('packagingDetails')} multiline rows={3} size="small" />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* ── Step 2: Review ── */}
                {activeStep === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Review Your Changes</Typography>
                    <Stack spacing={2}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Product Name</Typography>
                          <Typography variant="body2" fontWeight={600}>{productData.name || 'Not provided'}</Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">SKU</Typography>
                          <Typography variant="body2" fontWeight={600}>{sku}</Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Category</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedCategory
                              ? `${categories.find((c) => c.id === selectedCategory)?.name}${selectedSubCategory
                                ? ` > ${categories.find((c) => c.id === selectedCategory)?.subCategories.find((s) => s.id === selectedSubCategory)?.name}`
                                : ''}`
                              : 'Not selected'}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Pricing</Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={600}>
                              ₹{productData.price || '0'}{productData.unitText ? ` / ${productData.unitText}` : ''}
                            </Typography>
                            {productData.minOrderQty && (
                              <Typography variant="body2" color="text.secondary">
                                Min. Order: {productData.minOrderQty}{productData.unitText ? ` ${productData.unitText}` : ''}
                              </Typography>
                            )}
                            {productData.specialPrice && (
                              <Chip label={`Special Price: ₹${productData.specialPrice}`} size="small" sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 600, width: 'fit-content' }} />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Images</Typography>
                          <Typography variant="body2">
                            {images.filter((i) => i.isExisting).length} existing &nbsp;·&nbsp;
                            {images.filter((i) => !i.isExisting).length} new to upload
                          </Typography>
                        </CardContent>
                      </Card>
                      {productData.description && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto' }}>{productData.description}</Typography>
                          </CardContent>
                        </Card>
                      )}
                      <Alert severity="success">Review your changes above and click "Save Changes" to update the product.</Alert>
                    </Stack>
                  </Box>
                )}

                {/* Navigation footer */}
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#fafbfc' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0 || isProcessing}
                    size="small"
                    sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={activeStep === steps.length - 1 ? handleUpdate : handleNext}
                    disabled={isProcessing}
                    sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, minWidth: 140 }}
                  >
                    {isProcessing ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        <Typography variant="caption" sx={{ color: 'white' }}>
                          {isUpdating ? 'Saving…' : 'Uploading…'}
                        </Typography>
                      </Stack>
                    ) : activeStep === steps.length - 1 ? 'Save Changes' : 'Continue'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar quality score */}
            <Grid item xs={12} lg={4}>
              <ProductQualityScore
                productData={{ ...productData, unit: productData.unitText }}
                selectedCategory={selectedCategory}
                images={images}
              />
            </Grid>
          </Grid>

          {/* Category Request Dialog */}
          <Dialog open={categoryRequestOpen} onClose={() => setCategoryRequestOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Request New Category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Can't find the right category? Let us know and we'll add it.
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Category Name"
                placeholder="e.g., Organic Food Products, Solar Equipment…"
                value={requestedCategory}
                onChange={(e) => setRequestedCategory(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
                helperText="Please provide as much detail as possible"
              />
              <Alert severity="info">Requests are reviewed within 24–48 hours.</Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="outlined" onClick={() => { setCategoryRequestOpen(false); setRequestedCategory('') }} sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => { setSnackbar({ open: true, message: `Category request submitted: ${requestedCategory}`, severity: 'success' }); setCategoryRequestOpen(false); setRequestedCategory('') }} disabled={!requestedCategory.trim()} sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
              icon={snackbar.severity === 'success' ? <CheckCircle /> : undefined}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}
ProductEditPage.pageOptions = pageOptions
export default ProductEditPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  return {
    props: {
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}