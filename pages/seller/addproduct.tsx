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
import { cacheFirst } from '@graphcommerce/graphql'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ImageUploadManager } from '../../components/seller/ImageUploadManager'
import { ProductQualityScore } from '../../components/seller/ProductQualityScore'
import { CategoryMultiSelect } from '../../components/seller/CategoryMultiSelect'
import type { MainCategory } from '../../components/seller/CategoryMultiSelect'
import { getSellerId } from '../../lib/utils/getMobileNumber'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      success
      message
      product { id sku name }
      errors
    }
  }
`

const UPLOAD_PRODUCT_IMAGE_MUTATION = gql`
  mutation UploadProductImage($sku: String!, $images: [UploadProductImageInput!]!) {
    uploadProductImage(sku: $sku, images: $images) {
      success
      message
      files { file_path full_url type }
    }
  }
`

const GET_UNIT_OPTIONS_QUERY = gql`
  query GetUnitOfMeasurementOptions {
    customAttributeMetadata(
      attributes: [{ entity_type: "catalog_product", attribute_code: "unit_of_measurement" }]
    ) {
      items {
        attribute_options { label value }
      }
    }
  }
`

const GET_CATEGORY_ATTRIBUTES_QUERY = gql`
  query GetCategoryAttributes($categoryIds: [Int!]!) {
    getCategoryAttributes(category_ids: $categoryIds) {
      attribute_id
      attribute_code
      label
      backend_type
      input_type
      attribute_group
      sort_order
      options { label value }
    }
  }
`

const GET_SELLER_BUSINESS_CATEGORIES_QUERY = gql`
  query GetSellerBusinessCategories($seller_id: Int!) {
    getSellerBusinessCategories(seller_id: $seller_id) {
      seller_id
      businesscategories
    }
  }
`

// ─── Seller ID resolution ─────────────────────────────────────────────────────
// Tries multiple sources in order to find a numeric seller / customer id.
// Source 1: seller-auth key  { seller_id, customer_id, id, email, ... }
// Source 2: any other localStorage key that contains seller_id / customer_id
// Returns undefined when nothing is found so the query is safely skipped.

function resolveSellerIdFromStorage(): number | undefined {
  if (typeof window === 'undefined') return undefined

  // ── Check all localStorage keys for a numeric id ─────────────────────────
  const candidates = ['seller-auth', 'seller_auth', 'sellerAuth', 'seller-data', 'sellerData']

  for (const key of candidates) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      // Try common field names
      const id =
        parsed?.seller_id ??
        parsed?.customer_id ??
        parsed?.customerId ??
        parsed?.sellerId ??
        parsed?.id
      if (id) return parseInt(String(id), 10) || undefined
    } catch {
      // ignore parse errors
    }
  }

  return undefined
}

function resolveSellerEmailFromStorage(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const candidates = ['seller-auth', 'seller_auth', 'sellerAuth', 'seller-data', 'sellerData']
  for (const key of candidates) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (parsed?.email) return parsed.email as string
    } catch { /* ignore */ }
  }
  return undefined
}

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

interface AttributeOption {
  label: string
  value: string
}

interface CategoryAttribute {
  attribute_id: number
  attribute_code: string
  label: string
  backend_type: string
  input_type: 'select' | 'text' | 'multiselect' | string
  attribute_group: string
  sort_order: number
  options: AttributeOption[]
}

const steps = ['Product Details', 'Specifications', 'Review & Publish']

// ─── Page Component ───────────────────────────────────────────────────────────

function ProductCreatePage({ menu }: LayoutNavigationProps) {
  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })

  // ── Resolve seller id once on mount (client only) ─────────────────────────
  // We store in state so it's stable across renders and avoids SSR mismatch.
  const [sellerId, setSellerId] = useState<number | undefined>(undefined)

  const [sellerEmail, setSellerEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    const id = getSellerId()   // client-only, localStorage is available here
    if (id) setSellerId(Number(id))
    setSellerEmail(resolveSellerEmailFromStorage())
  }, [])


  // ── All main-categories from layout menu ──────────────────────────────────
  const allMainCategories: MainCategory[] = useMemo(
    () => (menu?.items?.[0]?.children ?? []) as MainCategory[],
    [menu],
  )

  // ── Fetch seller's registered business categories ─────────────────────────
  const {
    data: businessCategoryData,
    loading: businessCategoriesLoading,
    error: businessCategoriesError,
  } = useQuery(GET_SELLER_BUSINESS_CATEGORIES_QUERY, {
    variables: { seller_id: sellerId },
    // Only skip if we definitely have no id yet (still resolving or truly absent)
    skip: sellerId === undefined || sellerId === null || isNaN(sellerId),
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,

  })

  // Array of names the seller registered with
  const sellerBusinessCategoryNames: string[] = useMemo(
    () => businessCategoryData?.getSellerBusinessCategories?.businesscategories ?? [],
    [businessCategoryData],
  )

  // ── Filter allMainCategories to only the seller's segments ────────────────
  // Normalise both sides to lowercase + trim for a resilient match.
  const mainCategories: MainCategory[] = useMemo(() => {
    // If the query hasn't resolved yet, show nothing (skeleton shown below)
    // If the query errored or returned empty list, fall back to all categories
    if (businessCategoriesLoading) return []

    if (!sellerBusinessCategoryNames.length) {
      // Either no query was made (no sellerId) or API returned empty — show all
      return allMainCategories
    }

    const normalised = new Set(
      sellerBusinessCategoryNames.map((n) => n.trim().toLowerCase()),
    )

    const filtered = allMainCategories.filter((cat) =>
      normalised.has(cat.name.trim().toLowerCase()),
    )

    // Safety: if nothing matched at all, fall back to all so the seller
    // isn't stuck with an empty dropdown
    return filtered.length > 0 ? filtered : allMainCategories
  }, [allMainCategories, sellerBusinessCategoryNames, businessCategoriesLoading])

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createProduct, { loading: isCreating }] = useMutation(CREATE_PRODUCT_MUTATION)
  const [uploadProductImageMutation, { loading: isUploadingImages }] = useMutation(UPLOAD_PRODUCT_IMAGE_MUTATION)

  // ── Unit options ──────────────────────────────────────────────────────────
  const { data: unitOptionsData, loading: unitOptionsLoading } = useQuery(GET_UNIT_OPTIONS_QUERY, {
    fetchPolicy: 'cache-first',
  })

  const predefinedUnitOptions: UnitOption[] = useMemo(() => {
    const items = unitOptionsData?.customAttributeMetadata?.items ?? []
    if (!items.length) return []
    return (items[0]?.attribute_options ?? []) as UnitOption[]
  }, [unitOptionsData])

  // ── Form state ────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0)
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    specialPrice: '',
    specialPriceFrom: '',
    specialPriceTo: '',
    unitText: '',
    description: '',
    minOrderQty: '',
    productCode: '',
    deliveryTime: '',
    packagingDetails: '',
  })

  const [images, setImages] = useState<ImageData[]>([])
  const [selectedCategoryUids, setSelectedCategoryUids] = useState<string[]>([])
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [categoryRequestOpen, setCategoryRequestOpen] = useState(false)
  const [requestedCategory, setRequestedCategory] = useState('')
  const [errors, setErrors] = useState({ name: false, images: false, price: false, category: false })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' })

  // ── Decode selected uids to numeric category ids ──────────────────────────
  const selectedCategoryIds = useMemo(
    () =>
      selectedCategoryUids
        .map((uid) => { try { return parseInt(atob(uid), 10) } catch { return parseInt(uid, 10) } })
        .filter(Boolean),
    [selectedCategoryUids],
  )

  // ── Category attributes ───────────────────────────────────────────────────
  const { data: categoryAttributesData, loading: categoryAttributesLoading } = useQuery(
    GET_CATEGORY_ATTRIBUTES_QUERY,
    { variables: { categoryIds: selectedCategoryIds }, skip: selectedCategoryIds.length === 0, fetchPolicy: 'cache-first' },
  )

  const categoryAttributes: CategoryAttribute[] = useMemo(() => {
    const attrs: CategoryAttribute[] = categoryAttributesData?.getCategoryAttributes ?? []
    const seen = new Set<string>()
    return attrs
      .filter((a) => { if (seen.has(a.attribute_code)) return false; seen.add(a.attribute_code); return true })
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [categoryAttributesData])

  const attributesByGroup = useMemo(() => {
    const groups: Record<string, CategoryAttribute[]> = {}
    for (const attr of categoryAttributes) {
      const g = attr.attribute_group || 'General'
      if (!groups[g]) groups[g] = []
      groups[g].push(attr)
    }
    return groups
  }, [categoryAttributes])

  const attributeSetName = useMemo(() => {
    if (!selectedCategoryUids.length || !mainCategories.length) return undefined
    const selectedSet = new Set(selectedCategoryUids)
    for (const main of mainCategories) {
      if (selectedSet.has(main.uid)) return main.name
      for (const sub of main.children ?? []) {
        if (selectedSet.has(sub.uid)) return main.name
        for (const mc of sub.children ?? []) {
          if (selectedSet.has(mc.uid)) return main.name
        }
      }
    }
    return undefined
  }, [selectedCategoryUids, mainCategories])

  useEffect(() => { window.scrollTo({ top: 20, behavior: 'smooth' }) }, [activeStep])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const findCategoryName = (uid: string): string => {
    for (const m of mainCategories) {
      if (m.uid === uid) return m.name
      for (const s of m.children ?? []) {
        if (s.uid === uid) return s.name
        for (const mc of s.children ?? []) {
          if (mc.uid === uid) return mc.name
        }
      }
    }
    return uid
  }

  const validateStep = (step: number) => {
    const newErrors = { name: false, images: false, price: false, category: false }
    if (step === 0) {
      if (productData.name.trim().split(' ').filter((w) => w.length > 0).length < 3) newErrors.name = true
      if (images.length === 0) newErrors.images = true
      if (!productData.price || parseFloat(productData.price) <= 0) newErrors.price = true
      if (selectedCategoryUids.length === 0) newErrors.category = true
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleNext = () => { if (validateStep(activeStep)) setActiveStep((p) => Math.min(p + 1, steps.length - 1)) }
  const handleBack = () => { setErrors({ name: false, images: false, price: false, category: false }); setActiveStep((p) => Math.max(p - 1, 0)) }

  const handleInputChange =
    (field: string) =>
      (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
        const val = event.target.value as string
        setProductData((prev) => ({ ...prev, [field]: val }))
        if (field === 'name' && errors.name && val.trim().split(' ').filter((w) => w.length > 0).length >= 3)
          setErrors((e) => ({ ...e, name: false }))
        if (field === 'price' && errors.price && parseFloat(val) > 0)
          setErrors((e) => ({ ...e, price: false }))
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
        return { filename: image.file.name, base64_content: await fileToBase64(image.file), type: index === 0 ? 'image' : 'gallery' }
      }),
    )
    const { data } = await uploadProductImageMutation({ variables: { sku, images: imageInputs } })
    if (!data?.uploadProductImage?.success) throw new Error(data?.uploadProductImage?.message || 'Failed to upload images')
  }

  const handlePublish = async () => {
    try {
      if (images.length === 0) { setSnackbar({ open: true, message: 'Please upload at least one image', severity: 'error' }); return }
      if (!sellerEmail) { setSnackbar({ open: true, message: 'Seller session expired. Please login again.', severity: 'error' }); return }

      const generatedSku = `${productData.productCode || 'PROD'}-${Date.now()}`
      const formattedAttributes = Object.entries(attributeValues)
        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
        .map(([attribute_code, value]) => ({ attribute_code, value: Array.isArray(value) ? value.join(',') : String(value) }))

      const input: Record<string, unknown> = {
        sku: generatedSku,
        name: productData.name,
        price: parseFloat(productData.price),
        attribute_set_id: 4,
        inventory: { qty: productData.minOrderQty ? parseInt(productData.minOrderQty, 10) : 100, is_in_stock: true },
        description: productData.description || undefined,
        seller_id: sellerEmail,
        special_price: productData.specialPrice ? parseFloat(productData.specialPrice) : undefined,
        special_from_date: productData.specialPriceFrom || undefined,
        special_to_date: productData.specialPriceTo || undefined,
        mqa: productData.minOrderQty || undefined,
        unit_of_measurement: productData.unitText || undefined,
        ...(selectedCategoryUids.length ? {
          categories: selectedCategoryUids.map((uid) => { try { return parseInt(atob(uid), 10) } catch { return parseInt(uid, 10) } }),
        } : {}),
        ...(attributeSetName ? { attribute_set: attributeSetName } : {}),
        ...(formattedAttributes.length > 0 ? { custom_attributes: formattedAttributes } : {}),
      }

      setSnackbar({ open: true, message: 'Creating product...', severity: 'info' })
      const { data: createProductData } = await createProduct({ variables: { input } })

      if (!createProductData?.createProduct?.success) {
        throw new Error(createProductData?.createProduct?.errors?.join(', ') || 'Failed to create product')
      }

      setSnackbar({ open: true, message: 'Product created! Uploading images...', severity: 'info' })
      await uploadImagesWithBase64(createProductData.createProduct.product.sku)
      setSnackbar({ open: true, message: `Product created successfully! ${images.length} image(s) uploaded.`, severity: 'success' })
      setTimeout(() => { window.location.href = '/seller/products' }, 2000)
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'An error occurred. Please try again.', severity: 'error' })
    }
  }

  const isProcessing = isCreating || isUploadingImages

  // Category section loading = either business-cats are resolving OR sellerId not yet set
  // (sellerId state starts as undefined, gets set in useEffect on mount)
  const categoryLoading = businessCategoriesLoading || (sellerId === undefined && sellerEmail === undefined)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title={i18n._('Add New Product')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* ── Header ── */}
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
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>

                {/* ════ STEP 0 — Product Details ════ */}
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
                            {errors.category && <li>Product Category (select at least one)</li>}
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

                      {/* ── Categories ── */}
                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category sx={{ color: '#3b82f6', fontSize: 20 }} />
                            Product Categories *
                          </Typography>
                          {/* <Button
                            size="small" startIcon={<Add />}
                            onClick={() => setCategoryRequestOpen(true)}
                            sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}
                          >
                            Request Category
                          </Button> */}
                        </Stack>

                        {/* Skeleton while resolving seller id / fetching business categories */}
                        {categoryLoading ? (
                          <Stack spacing={1}>
                            <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
                            <Stack direction="row" spacing={1}>
                              <Skeleton variant="rounded" width={180} height={22} />
                              <Skeleton variant="rounded" width={220} height={22} />
                            </Stack>
                          </Stack>
                        ) : (
                          <>
                            {/* Info banner — only when filtering is active */}
                            {/* {sellerBusinessCategoryNames.length > 0 && mainCategories.length < allMainCategories.length && (
                              <Box sx={{ mb: 1.5, px: 1.5, py: 1, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Info sx={{ fontSize: 15, color: '#3b82f6', mt: 0.2, flexShrink: 0 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    Showing your registered business categories only
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {sellerBusinessCategoryNames.map((name) => (
                                      <Chip
                                        key={name} label={name} size="small"
                                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                            )} */}

                            <CategoryMultiSelect
                              categories={mainCategories}
                              selectedUids={selectedCategoryUids}
                              onChange={(uids) => {
                                setSelectedCategoryUids(uids)
                                if (uids.length > 0) setErrors((e) => ({ ...e, category: false }))
                              }}
                              loading={false}
                              error={errors.category}
                              errorMessage="Please select at least one category"
                              placeholder="Click to browse and select product categories..."
                            />

                            <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mt: 0.5, display: 'block' }}>
                              Expand any category to select sub-categories and micro-categories.{' '}
                              {/* <Typography
                                component="span" variant="caption"
                                sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                onClick={() => setCategoryRequestOpen(true)}
                              >
                                Can't find yours? Request it.
                              </Typography> */}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* Images */}
                      <ImageUploadManager
                        images={images}
                        setImages={setImages}
                        errors={errors}
                        setErrors={setErrors}
                        setSnackbar={setSnackbar}
                      />

                      {/* Pricing */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Pricing Information *
                        </Typography>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Regular Price</Typography>
                            <Grid container spacing={2} alignItems="flex-start">
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth label="Price" placeholder="0.00"
                                  value={productData.price} onChange={handleInputChange('price')}
                                  type="number" size="small" error={errors.price}
                                  helperText={errors.price ? 'Price is required and must be greater than 0' : ''}
                                  InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={7}>
                                <Autocomplete
                                  freeSolo size="small" options={predefinedUnitOptions}
                                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
                                  inputValue={productData.unitText}
                                  onChange={(_e, newValue) => {
                                    const label = newValue == null ? '' : typeof newValue === 'string' ? newValue : newValue.label
                                    setProductData((prev) => ({ ...prev, unitText: label }))
                                  }}
                                  onInputChange={(_e, newInputValue, reason) => {
                                    if (reason !== 'reset') setProductData((prev) => ({ ...prev, unitText: newInputValue }))
                                  }}
                                  loading={unitOptionsLoading}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params} label="Unit of Measurement"
                                      placeholder="e.g. Piece, Kg, Litre..."
                                      helperText="Select from the list or type a custom unit"
                                      InputProps={{
                                        ...params.InputProps,
                                        endAdornment: <>{unitOptionsLoading && <CircularProgress color="inherit" size={14} />}{params.InputProps.endAdornment}</>,
                                      }}
                                    />
                                  )}
                                  renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
                                  filterOptions={(options, params) => {
                                    const filtered = options.filter((o) => o.label.toLowerCase().includes(params.inputValue.toLowerCase()))
                                    const inputValue = params.inputValue.trim()
                                    if (inputValue && !options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase())) {
                                      filtered.push({ label: `Add "${inputValue}"`, value: `__custom__${inputValue}` })
                                    }
                                    return filtered
                                  }}
                                  isOptionEqualToValue={(option, val) => option.value === val.value}
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Minimum Order Quantity</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth label="Min. Order Qty" placeholder="e.g. 50"
                                  value={productData.minOrderQty} onChange={handleInputChange('minOrderQty')}
                                  type="number" size="small"
                                  InputProps={{ endAdornment: productData.unitText ? <InputAdornment position="end">{productData.unitText}</InputAdornment> : undefined }}
                                  helperText="Minimum quantity a buyer must order"
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Special Price (Optional)</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth label="Special Price" placeholder="0.00"
                                  value={productData.specialPrice} onChange={handleInputChange('specialPrice')}
                                  type="number" size="small"
                                  InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                                  helperText="Offer a discounted price for a limited time"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>

                                <TextField
                                  fullWidth label="Special Price From" size="small"
                                  type="date"
                                  value={productData.specialPriceFrom}
                                  onChange={handleInputChange('specialPriceFrom')}
                                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                  InputLabelProps={{ shrink: true }}
                                  helperText="Start date for special price"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth label="Special Price To" size="small"
                                  type="date"
                                  value={productData.specialPriceTo}
                                  onChange={handleInputChange('specialPriceTo')}
                                  inputProps={{
                                    min: productData.specialPriceFrom || new Date().toISOString().split('T')[0],
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  helperText="End date for special price"
                                />

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
                          value={productData.description} onChange={handleInputChange('description')}
                          multiline rows={5} size="small"
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

                {/* ════ STEP 1 — Specifications ════ */}
                {activeStep === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.875rem' }}>
                        Additional details help buyers make informed decisions and improve your product ranking
                      </Alert>

                      {/* <TextField
                        fullWidth label="Production Capacity" placeholder="e.g., 5000 units/month" size="small"
                        value={productData.productionCapacity} onChange={handleInputChange('productionCapacity')}
                      /> */}

                      <TextField
                        fullWidth label="Product Code / SKU"
                        placeholder="Your internal reference code (used to generate the product SKU)"
                        value={productData.productCode} onChange={handleInputChange('productCode')}
                        size="small"
                      />

                      {selectedCategoryIds.length > 0 && (
                        <Box>
                          {categoryAttributesLoading ? (
                            <Stack spacing={1.5}>
                              {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />)}
                            </Stack>
                          ) : categoryAttributes.length > 0 ? (
                            <Stack spacing={3}>
                              {Object.entries(attributesByGroup).map(([groupName, attrs]) => (
                                <Box key={groupName}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #e2e8f0' }}>
                                    <Box sx={{ width: 4, height: 18, bgcolor: '#3b82f6', borderRadius: 1, flexShrink: 0 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{groupName}</Typography>
                                    <Chip label={`${attrs.length} field${attrs.length > 1 ? 's' : ''}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 600, ml: 'auto' }} />
                                  </Box>
                                  <Grid container spacing={2}>
                                    {attrs.map((attr) => (
                                      <Grid item xs={12} sm={6} key={attr.attribute_code}>
                                        {attr.input_type === 'select' ? (
                                          <Autocomplete
                                            size="small" options={attr.options}
                                            getOptionLabel={(opt) => typeof opt === 'string' ? opt : opt.label}
                                            value={attr.options.find((o) => o.value === attributeValues[attr.attribute_code]) ?? null}
                                            onChange={(_e, newVal) => setAttributeValues((prev) => ({ ...prev, [attr.attribute_code]: newVal ? (newVal as AttributeOption).value : '' }))}
                                            renderInput={(params) => <TextField {...params} label={attr.label} placeholder={`Select ${attr.label.toLowerCase()}...`} />}
                                            renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
                                            isOptionEqualToValue={(o, v) => o.value === v.value}
                                          />
                                        ) : (
                                          <TextField
                                            fullWidth size="small" label={attr.label}
                                            placeholder={`Enter ${attr.label.toLowerCase()}...`}
                                            value={attributeValues[attr.attribute_code] ?? ''}
                                            onChange={(e) => setAttributeValues((prev) => ({ ...prev, [attr.attribute_code]: e.target.value }))}
                                            type={attr.backend_type === 'decimal' || attr.backend_type === 'int' ? 'number' : 'text'}
                                          />
                                        )}
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.85rem' }}>No additional specifications required for the selected categories.</Alert>
                          )}
                        </Box>
                      )}

                      {selectedCategoryIds.length === 0 && (
                        <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>Select categories in Step 1 to load product specifications.</Alert>
                      )}

                      {/* <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping sx={{ color: '#3b82f6', fontSize: 20 }} />
                          Shipping &amp; Delivery
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth label="Estimated Delivery Time" placeholder="e.g., 5-7 business days" size="small"
                            value={productData.deliveryTime} onChange={handleInputChange('deliveryTime')}
                          />
                          <TextField
                            fullWidth label="Packaging Details"
                            placeholder="Describe packaging materials, dimensions, and protection measures..."
                            value={productData.packagingDetails} onChange={handleInputChange('packagingDetails')}
                            multiline rows={3} size="small"
                          />
                        </Stack>
                      </Box> */}
                    </Stack>
                  </Box>
                )}

                {/* ════ STEP 2 — Review & Publish ════ */}
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
                          <Typography variant="caption" color="text.secondary">Categories ({selectedCategoryUids.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {selectedCategoryUids.length === 0
                              ? <Typography variant="body2" color="text.secondary">None selected</Typography>
                              : selectedCategoryUids.map((uid) => (
                                <Chip key={uid} size="small" label={findCategoryName(uid)}
                                  sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 600, border: '1px solid #bfdbfe' }}
                                />
                              ))}
                          </Box>
                          {attributeSetName && (
                            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                              Attribute Set: <strong>{attributeSetName}</strong>
                            </Typography>
                          )}
                        </CardContent>
                      </Card>

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Pricing</Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={600}>
                              Rs.{productData.price || '0'}{productData.unitText ? ` / ${productData.unitText}` : ''}
                            </Typography>
                            {productData.minOrderQty && (
                              <Typography variant="body2" color="text.secondary">
                                Min. Order: {productData.minOrderQty}{productData.unitText ? ` ${productData.unitText}` : ''}
                              </Typography>
                            )}
                            {productData.specialPrice && (
                              <Box>
                                <Chip label={`Special Price: Rs.${productData.specialPrice}`} size="small" sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 600 }} />
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
                              Cover Image: Image 1 &nbsp;·&nbsp; Gallery: {images.length - 1} additional
                            </Typography>
                          )}
                        </CardContent>
                      </Card>

                      {categoryAttributes.length > 0 && Object.keys(attributeValues).some((k) => attributeValues[k]) && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Product Specifications</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {categoryAttributes.filter((a) => attributeValues[a.attribute_code]).map((attr) => {
                                const val = attributeValues[attr.attribute_code]
                                const label = attr.input_type === 'select' ? (attr.options.find((o) => o.value === val)?.label ?? val) : val
                                return <Chip key={attr.attribute_code} size="small" label={`${attr.label}: ${label}`} sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569' }} />
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {productData.description && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto' }}>{productData.description}</Typography>
                          </CardContent>
                        </Card>
                      )}

                      <Alert severity="success">
                        Your product is ready to publish! Click "Publish Product" below to make it live.
                      </Alert>
                    </Stack>
                  </Box>
                )}

                {/* Nav footer */}
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#fafbfc' }}>
                  <Button
                    variant="outlined" onClick={handleBack}
                    disabled={activeStep === 0 || isProcessing} size="small"
                    sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
                  >
                    Back
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" disabled={isProcessing} sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}>
                      Save Draft
                    </Button>
                    <Button
                      variant="contained" size="small"
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

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <ProductQualityScore
                productData={{ ...productData, unit: productData.unitText }}
                selectedCategory={selectedCategoryUids[0] ?? ''}
                images={images}
              />
            </Grid>
          </Grid>

          {/* Category Request Dialog */}
          <Dialog open={categoryRequestOpen} onClose={() => setCategoryRequestOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Request New Category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Can't find the right category? Let us know and we'll add it for you.</Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                fullWidth label="Category Name"
                placeholder="e.g., Organic Food Products, Solar Equipment..."
                value={requestedCategory} onChange={(e) => setRequestedCategory(e.target.value)}
                multiline rows={3}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                helperText="Please provide as much detail as possible about the category"
              />
              <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.875rem' }}>
                Your request will be reviewed by our admin team. We typically add new categories within 24-48 hours.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="outlined" onClick={() => { setCategoryRequestOpen(false); setRequestedCategory('') }} sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>Cancel</Button>
              <Button variant="contained" onClick={handleCategoryRequest} disabled={!requestedCategory.trim()} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>Submit Request</Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open} autoHideDuration={6000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }} icon={snackbar.severity === 'success' ? <CheckCircle /> : undefined}>
              {snackbar.message}
            </Alert>
          </Snackbar>

        </WaitForCustomer >
      </SellerAccountLayout >
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = { Layout: LayoutNavigation }
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