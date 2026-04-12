import type { PageOptions } from '@graphcommerce/framer-next-pages'
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
} from '@mui/icons-material'
import React, { useState, useMemo } from 'react'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { cacheFirst } from '@graphcommerce/graphql'
import { gql, useMutation, useQuery } from '@apollo/client'

import { ImageUploadManager } from '../../components/seller/ImageUploadManager'
import { ProductQualityScore } from '../../components/seller/ProductQualityScore'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
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

/**
 * Fetch all selectable options for the `unit_of_measurement` custom attribute.
 * Identical query to the edit page so Apollo can share the cache entry.
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageData {
  url: string
  file?: File
  isCover?: boolean
}

interface UnitOption {
  label: string
  value: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SELLER_AUTH_KEY = 'seller-auth'

type SellerAuth = {
  email: string
  is_seller: boolean
}

const getSellerEmailFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SELLER_AUTH_KEY)
    if (!raw) return null
    const parsed: SellerAuth = JSON.parse(raw)
    return parsed.email || null
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

const steps = ['Product Details', 'Specifications', 'Review & Publish']

// ─── Page Component ───────────────────────────────────────────────────────────

function ProductCreatePage() {
  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const [createProduct, { loading: isCreating }] = useMutation(CREATE_PRODUCT_MUTATION)
  const [uploadProductImageMutation, { loading: isUploadingImages }] = useMutation(
    UPLOAD_PRODUCT_IMAGE_MUTATION
  )

  // Fetch unit_of_measurement attribute options (cache-first — options rarely change)
  const { data: unitOptionsData, loading: unitOptionsLoading } = useQuery(GET_UNIT_OPTIONS_QUERY, {
    fetchPolicy: 'cache-first',
  })

  // Derive the list of predefined unit options
  const predefinedUnitOptions: UnitOption[] = useMemo(() => {
    const items = unitOptionsData?.customAttributeMetadata?.items ?? []
    if (!items.length) return []
    return (items[0]?.attribute_options ?? []) as UnitOption[]
  }, [unitOptionsData])

  // ── Form state ────────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0)
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    specialPrice: '',
    specialPriceFrom: '',
    specialPriceTo: '',
    // unitText holds the human-readable label (e.g. "Kilogram") — sent to API as-is
    unitText: '',
    description: '',
    minOrderQty: '',
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

  // ── Helpers ───────────────────────────────────────────────────────────────────

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

  const handleCategoryRequest = () => {
    setSnackbar({ open: true, message: `Category request submitted: ${requestedCategory}`, severity: 'success' })
    setCategoryRequestOpen(false)
    setRequestedCategory('')
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
    })

  const uploadImagesWithBase64 = async (sku: string) => {
    const imageInputs = await Promise.all(
      images.map(async (image, index) => {
        if (!image.file) throw new Error('Image file is missing')
        return {
          filename: image.file.name,
          base64_content: await fileToBase64(image.file),
          type: index === 0 ? 'image' : 'gallery',
        }
      })
    )

    const { data } = await uploadProductImageMutation({ variables: { sku, images: imageInputs } })

    if (!data?.uploadProductImage?.success) {
      throw new Error(data?.uploadProductImage?.message || 'Failed to upload images')
    }
  }

  const handlePublish = async () => {
    try {
      if (images.length === 0) {
        setSnackbar({ open: true, message: 'Please upload at least one image', severity: 'error' })
        return
      }

      const sellerEmail = getSellerEmailFromLocalStorage()
      if (!sellerEmail) {
        setSnackbar({ open: true, message: 'Seller session expired. Please login again.', severity: 'error' })
        return
      }

      const generatedSku = `${productData.productCode || 'PROD'}-${Date.now()}`

      const input = {
        sku: generatedSku,
        name: productData.name,
        price: parseFloat(productData.price),
        attribute_set_id: 4,
        inventory: {
          qty: productData.minOrderQty ? parseInt(productData.minOrderQty, 10) : 100,
          is_in_stock: true,
        },
        description: productData.description || undefined,
        seller_id: sellerEmail,
        special_price: productData.specialPrice ? parseFloat(productData.specialPrice) : undefined,
        // mqa — minimum order quantity as string (matches Postman / API expectation)
        mqa: productData.minOrderQty || undefined,
        // unit_of_measurement — always the human-readable label, never an option id
        unit_of_measurement: productData.unitText || undefined,
      }

      setSnackbar({ open: true, message: 'Creating product...', severity: 'info' })

      const { data: createProductData } = await createProduct({ variables: { input } })

      if (!createProductData?.createProduct?.success) {
        const errorMessages = createProductData?.createProduct?.errors?.join(', ') || 'Failed to create product'
        throw new Error(errorMessages)
      }

      const createdSku = createProductData.createProduct.product.sku

      setSnackbar({ open: true, message: 'Product created! Uploading images...', severity: 'info' })
      await uploadImagesWithBase64(createdSku)

      setSnackbar({
        open: true,
        message: `Product created successfully! ${images.length} image(s) uploaded.`,
        severity: 'success',
      })

      setTimeout(() => { window.location.href = '/seller/products' }, 2000)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'An error occurred while creating the product. Please try again.',
        severity: 'error',
      })
    }
  }

  const isProcessing = isCreating || isUploadingImages

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Add New Product')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <IconButton href="/seller/products" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#334155' }}>
                  <Trans id="Add New Product" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Trans id="Complete the form below to list your product. All fields marked with * are required." />
                </Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 2, p: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconProps={{ sx: { '&.Mui-active': { color: '#3b82f6' }, '&.Mui-completed': { color: '#10b981' } } }}>
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
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>

                {/* ── Step 0: Product Details ── */}
                {activeStep === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>

                      {/* Validation summary */}
                      {(errors.name || errors.images || errors.price || errors.category) && (
                        <Alert severity="error" sx={{ mb: 1 }}>
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
                        {!errors.name && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Example: "Premium Cotton Casual T-Shirt for Men"
                          </Typography>
                        )}
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
                                Please select a category for your product
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

                      {/* ── Pricing ── */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Pricing Information *
                        </Typography>
                        <Stack spacing={2.5}>

                          {/* Regular price + unit */}
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
                                  helperText={errors.price ? 'Price is required and must be greater than 0' : ''}
                                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                />
                              </Grid>

                              {/* Unit of Measurement — fetched from attribute, freeSolo for custom values */}
                              <Grid item xs={12} sm={7}>
                                <Autocomplete
                                  freeSolo
                                  size="small"
                                  options={predefinedUnitOptions}
                                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                                  inputValue={productData.unitText}
                                  // Dropdown selection → store label text
                                  onChange={(_e, newValue) => {
                                    const label =
                                      newValue == null
                                        ? ''
                                        : typeof newValue === 'string'
                                          ? newValue
                                          : newValue.label
                                    setProductData((prev) => ({ ...prev, unitText: label }))
                                  }}
                                  // Free typing → update unitText directly
                                  onInputChange={(_e, newInputValue, reason) => {
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
                                            {unitOptionsLoading && <CircularProgress color="inherit" size={14} />}
                                            {params.InputProps.endAdornment}
                                          </>
                                        ),
                                      }}
                                    />
                                  )}
                                  renderOption={(props, option) => (
                                    <li {...props} key={option.value}>{option.label}</li>
                                  )}
                                  // Inject "Add <value>" option for custom entries
                                  filterOptions={(options, params) => {
                                    const filtered = options.filter((o) =>
                                      o.label.toLowerCase().includes(params.inputValue.toLowerCase())
                                    )
                                    const inputValue = params.inputValue.trim()
                                    const alreadyExists = options.some(
                                      (o) => o.label.toLowerCase() === inputValue.toLowerCase()
                                    )
                                    if (inputValue && !alreadyExists) {
                                      filtered.push({ label: `Add "${inputValue}"`, value: `__custom__${inputValue}` })
                                    }
                                    return filtered
                                  }}
                                  isOptionEqualToValue={(option, val) => option.value === val.value}
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Minimum Order Quantity (mqa) — moved from Specifications */}
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
                                <TextField fullWidth label="Special Price From" placeholder="DD/MM/YYYY" value={productData.specialPriceFrom} onChange={handleInputChange('specialPriceFrom')} size="small" helperText="Start date for special price" />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Special Price To" placeholder="DD/MM/YYYY" value={productData.specialPriceTo} onChange={handleInputChange('specialPriceTo')} size="small" helperText="End date for special price" />
                              </Grid>
                            </Grid>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Description */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Product Description *
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="Provide a detailed description including features, benefits, materials, and use cases..."
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

                {/* ── Step 1: Specifications ── (minOrderQty moved to Pricing) */}
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
                        placeholder="Your internal reference code (used to generate the product SKU)"
                        value={productData.productCode}
                        onChange={handleInputChange('productCode')}
                        size="small"
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Shipping & Delivery
                        </Typography>
                        <Stack spacing={2}>
                          <TextField fullWidth label="Estimated Delivery Time" placeholder="e.g., 5-7 business days" value={productData.deliveryTime} onChange={handleInputChange('deliveryTime')} size="small" />
                          <TextField fullWidth label="Packaging Details" placeholder="Describe packaging materials, dimensions, and protection measures..." value={productData.packagingDetails} onChange={handleInputChange('packagingDetails')} multiline rows={3} size="small" />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* ── Step 2: Review ── */}
                {activeStep === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Review Your Product</Typography>
                    <Stack spacing={2}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Product Name</Typography>
                          <Typography variant="body2" fontWeight={600}>{productData.name || 'Not provided'}</Typography>
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
                              <Box>
                                <Chip label={`Special Price: ₹${productData.specialPrice}`} size="small" sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 600 }} />
                                {productData.specialPriceFrom && productData.specialPriceTo && (
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Valid from {productData.specialPriceFrom} to {productData.specialPriceTo}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Images</Typography>
                          <Typography variant="body2">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</Typography>
                          {images.length > 0 && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              Cover Image: Image 1 · Gallery: {images.length - 1} additional image{images.length - 1 !== 1 ? 's' : ''}
                            </Typography>
                          )}
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
                      <Alert severity="success">Your product is ready to publish! Click "Publish Product" below to make it live.</Alert>
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
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={isProcessing}
                      sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => { activeStep === steps.length - 1 ? handlePublish() : handleNext() }}
                      disabled={isProcessing}
                      sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, minWidth: 120 }}
                    >
                      {isProcessing ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CircularProgress size={16} sx={{ color: 'white' }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {isCreating ? 'Creating...' : 'Uploading...'}
                          </Typography>
                        </Stack>
                      ) : (
                        activeStep === steps.length - 1 ? 'Publish Product' : 'Continue'
                      )}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar — quality score, unit aliased to satisfy ProductDataType */}
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Request New Category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Can't find the right category? Let us know and we'll add it for you.
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Category Name"
                placeholder="e.g., Organic Food Products, Solar Equipment, etc."
                value={requestedCategory}
                onChange={(e) => setRequestedCategory(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                helperText="Please provide as much detail as possible about the category"
              />
              <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.875rem' }}>
                Your request will be reviewed by our admin team. We typically add new categories within 24–48 hours.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="outlined"
                onClick={() => { setCategoryRequestOpen(false); setRequestedCategory('') }}
                sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCategoryRequest}
                disabled={!requestedCategory.trim()}
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
              >
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
ProductCreatePage.pageOptions = pageOptions
export default ProductCreatePage

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