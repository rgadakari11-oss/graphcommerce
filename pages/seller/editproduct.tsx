import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
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
import { CategoryMultiSelect } from '../../components/seller/CategoryMultiSelect'
import type { MainCategory } from '../../components/seller/CategoryMultiSelect'
import { getSellerId } from '../../lib/utils/getMobileNumber'

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
        description { html }
        categories { uid name url_key }
        small_image { url label }
        media_gallery { url label position }
        price_range {
          minimum_price {
            regular_price { value currency }
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

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($sku: String!, $input: UpdateProductInput!) {
    updateProduct(sku: $sku, input: $input) {
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

// ─── Constants ───────────────────────────────────────────────────────────────

const SELLER_AUTH_KEY = 'seller-auth'

const getSellerEmail = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SELLER_AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw).email || null
  } catch { return null }
}

/** Parse a datetime string like "2026-04-28 00:00:00" → "2026-04-28" for date inputs */
function toDateInputValue(raw: string | null | undefined): string {
  if (!raw) return ''
  // If it contains a space (datetime format), take only the date part
  return raw.includes(' ') ? raw.split(' ')[0] : raw.split('T')[0]
}

const steps = ['Product Details', 'Specifications', 'Review & Update']

// ─── Helper ───────────────────────────────────────────────────────────────────

function findCategoryName(categories: MainCategory[], uid: string): string {
  for (const m of categories) {
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

// ─── Page ────────────────────────────────────────────────────────────────────

function ProductEditPage({ menu }: LayoutNavigationProps) {
  const router = useRouter()
  const sku = router.query.sku as string | undefined
  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })

  // ── Resolve seller id on mount (client-only) ──────────────────────────────
  const [sellerId, setSellerId] = useState<number | undefined>(undefined)

  useEffect(() => {
    const id = getSellerId()
    if (id) setSellerId(Number(id))
  }, [])

  // ── All main categories from LayoutDocument menu ──────────────────────────
  const allMainCategories: MainCategory[] = useMemo(
    () => (menu?.items?.[0]?.children ?? []) as MainCategory[],
    [menu],
  )

  // ── Fetch seller's registered business categories ─────────────────────────
  const {
    data: businessCategoryData,
    loading: businessCategoriesLoading,
  } = useQuery(GET_SELLER_BUSINESS_CATEGORIES_QUERY, {
    variables: { seller_id: sellerId },
    skip: sellerId === undefined || sellerId === null || isNaN(sellerId as number),
    fetchPolicy: 'cache-first',
  })

  const sellerBusinessCategoryNames: string[] = useMemo(
    () => businessCategoryData?.getSellerBusinessCategories?.businesscategories ?? [],
    [businessCategoryData],
  )

  // ── Filter to seller's allowed categories only ────────────────────────────
  // While loading: return empty so skeleton is shown
  // If empty result or no sellerId: fall back to all categories
  const mainCategories: MainCategory[] = useMemo(() => {
    if (businessCategoriesLoading) return []
    if (!sellerBusinessCategoryNames.length) return allMainCategories
    const normalised = new Set(sellerBusinessCategoryNames.map((n) => n.trim().toLowerCase()))
    const filtered = allMainCategories.filter((c) => normalised.has(c.name.trim().toLowerCase()))
    return filtered.length > 0 ? filtered : allMainCategories
  }, [allMainCategories, sellerBusinessCategoryNames, businessCategoriesLoading])

  // ── Product + unit queries ────────────────────────────────────────────────
  const { data: productData, loading: productLoading, error: productError } = useQuery(
    GET_PRODUCT_QUERY,
    { variables: { sku }, skip: !sku, fetchPolicy: 'network-only' },
  )

  const { data: unitOptionsData, loading: unitOptionsLoading } = useQuery(GET_UNIT_OPTIONS_QUERY, {
    fetchPolicy: 'cache-first',
  })

  const predefinedUnitOptions: UnitOption[] = useMemo(() => {
    const items = unitOptionsData?.customAttributeMetadata?.items ?? []
    return items.length ? (items[0]?.attribute_options ?? []) : []
  }, [unitOptionsData])

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [uploadImages, { loading: isUploadingImages }] = useMutation(UPLOAD_PRODUCT_IMAGE_MUTATION)

  // ── Form state ────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0)
  const [isPopulated, setIsPopulated] = useState(false)
  const [rawUnitId, setRawUnitId] = useState('')

  const [form, setForm] = useState({
    name: '',
    price: '',
    specialPrice: '',
    specialPriceFrom: '',   // stored as YYYY-MM-DD for date input
    specialPriceTo: '',     // stored as YYYY-MM-DD for date input
    unitText: '',
    minOrderQty: '',
    description: '',
    productionCapacity: '',
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
  const [snackbar, setSnackbar] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error' | 'info',
  })

  // ── Decode selected uids to numeric category ids ──────────────────────────
  const selectedCategoryIds = useMemo(() =>
    selectedCategoryUids.map((uid) => {
      try { return parseInt(atob(uid), 10) }
      catch { return parseInt(uid, 10) }
    }).filter(Boolean),
    [selectedCategoryUids])

  // ── Category attributes query ─────────────────────────────────────────────
  const { data: categoryAttributesData, loading: categoryAttributesLoading } = useQuery(
    GET_CATEGORY_ATTRIBUTES_QUERY,
    {
      variables: { categoryIds: selectedCategoryIds },
      skip: selectedCategoryIds.length === 0,
      fetchPolicy: 'cache-first',
    },
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

  // ── Scroll to top on step change ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 20, behavior: 'smooth' })
  }, [activeStep])

  // ── Populate form from product query ──────────────────────────────────────
  useEffect(() => {
    const item = productData?.products?.items?.[0]
    if (!item || isPopulated) return

    setRawUnitId(item.unit_of_measurement ? String(item.unit_of_measurement) : '')

    setForm((prev) => ({
      ...prev,
      name: item.name ?? '',
      price: String(item.price_range?.minimum_price?.regular_price?.value ?? ''),
      specialPrice: item.special_price ? String(item.special_price) : '',
      // Convert datetime strings to date-only for <input type="date">
      specialPriceFrom: toDateInputValue(item.special_from_date),
      specialPriceTo: toDateInputValue(item.special_to_date),
      description: (item.description?.html ?? '').replace(/<[^>]*>/g, ''),
      productCode: item.sku ?? '',
      minOrderQty: item.mqa ? String(item.mqa) : '',
      unitText: '',
    }))

    const gallery: ImageData[] = (item.media_gallery ?? []).map((img: any) => ({
      url: img.url, isExisting: true, isCover: img.position === 1,
    }))
    if (!gallery.length && item.small_image?.url)
      gallery.push({ url: item.small_image.url, isExisting: true, isCover: true })

    setImages(gallery)
    setSelectedCategoryUids((item.categories ?? []).map((c: any) => c.uid))
    setIsPopulated(true)
  }, [productData, isPopulated])

  // ── Resolve raw unit id → label ───────────────────────────────────────────
  useEffect(() => {
    if (!rawUnitId || !predefinedUnitOptions.length) return
    const matched = predefinedUnitOptions.find((o) => o.value === rawUnitId)
    const label = matched ? matched.label : rawUnitId
    setForm((prev) => prev.unitText === label ? prev : { ...prev, unitText: label })
  }, [rawUnitId, predefinedUnitOptions])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const validate = (step: number) => {
    const e = { name: false, images: false, price: false, category: false }
    if (step === 0) {
      if (form.name.trim().split(' ').filter(Boolean).length < 3) e.name = true
      if (!images.length) e.images = true
      if (!form.price || parseFloat(form.price) <= 0) e.price = true
      if (!selectedCategoryUids.length) e.category = true
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const handleNext = () => {
    if (validate(activeStep)) setActiveStep((p) => Math.min(p + 1, steps.length - 1))
  }
  const handleBack = () => {
    setErrors({ name: false, images: false, price: false, category: false })
    setActiveStep((p) => Math.max(p - 1, 0))
  }

  const handleInput = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const val = e.target.value as string
      setForm((prev) => ({ ...prev, [field]: val }))
      if (field === 'name' && errors.name && val.trim().split(' ').filter(Boolean).length >= 3)
        setErrors((prev) => ({ ...prev, name: false }))
      if (field === 'price' && errors.price && parseFloat(val) > 0)
        setErrors((prev) => ({ ...prev, price: false }))
    }

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.readAsDataURL(file)
      r.onload = () => res((r.result as string).split(',')[1])
      r.onerror = rej
    })

  const uploadNewImages = async (targetSku: string) => {
    const newImgs = images.filter((i) => !i.isExisting && i.file)
    if (!newImgs.length) return
    const inputs = await Promise.all(
      newImgs.map(async (img, idx) => ({
        filename: img.file!.name,
        base64_content: await toBase64(img.file!),
        type: idx === 0 ? 'image' : 'gallery',
      }))
    )
    const { data } = await uploadImages({ variables: { sku: targetSku, images: inputs } })
    if (!data?.uploadProductImage?.success)
      throw new Error(data?.uploadProductImage?.message || 'Failed to upload images')
  }

  const handleUpdate = async () => {
    try {
      if (!sku) return
      if (!getSellerEmail()) {
        setSnackbar({ open: true, message: 'Seller session expired. Please login again.', severity: 'error' })
        return
      }

      setSnackbar({ open: true, message: 'Updating product...', severity: 'info' })

      const formattedAttributes = Object.entries(attributeValues || {})
        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
        .map(([attribute_code, value]) => ({
          attribute_code,
          value: Array.isArray(value) ? value.join(',') : String(value),
        }))

      const input: Record<string, unknown> = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description || undefined,

        // Special price — send only when a value exists
        special_price: form.specialPrice ? parseFloat(form.specialPrice) : undefined,
        // Date fields — send the YYYY-MM-DD string directly (API accepts this)
        special_from_date: form.specialPriceFrom || undefined,
        special_to_date: form.specialPriceTo || undefined,

        mqa: form.minOrderQty ? String(form.minOrderQty) : '1',
        unit_of_measurement: form.unitText || undefined,

        ...(selectedCategoryUids.length ? {
          categories: selectedCategoryUids.map((uid) => {
            try { return parseInt(atob(uid), 10) }
            catch { return parseInt(uid, 10) }
          }),
        } : {}),

        ...(attributeSetName ? { attribute_set: attributeSetName } : {}),

        ...(formattedAttributes.length > 0 ? { custom_attributes: formattedAttributes } : {}),
      }

      const { data: res } = await updateProduct({ variables: { sku, input } })
      if (!res?.updateProduct?.success) {
        throw new Error(res?.updateProduct?.errors?.join(', ') || 'Failed to update product')
      }

      if (images.some((i) => !i.isExisting)) {
        setSnackbar({ open: true, message: 'Product updated! Uploading images...', severity: 'info' })
        await uploadNewImages(sku)
      }

      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' })
      setTimeout(() => { window.location.href = '/seller/products' }, 2000)
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'An error occurred.',
        severity: 'error',
      })
    }
  }

  const isProcessing = isUpdating || isUploadingImages

  // Category section loading = seller id still resolving OR business cats fetching
  const categoryLoading = businessCategoriesLoading || sellerId === undefined

  // ── Guards ────────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageMeta title={i18n._('Edit Product')} metaRobots={['noindex']} />
      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* ── Header ── */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <IconButton href="/seller/products" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Edit sx={{ color: '#3b82f6', fontSize: 22 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#334155' }}>Edit Product</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  SKU: <strong>{sku}</strong> &nbsp;·&nbsp; Update the details below and click "Save Changes"
                </Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 2, p: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconProps={{
                      sx: { '&.Mui-active': { color: '#3b82f6' }, '&.Mui-completed': { color: '#10b981' } },
                    }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}>

                {/* ════════════════════════════════════════════
                    STEP 0 — Product Details
                ════════════════════════════════════════════ */}
                {activeStep === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>

                      {/* Validation summary */}
                      {Object.values(errors).some(Boolean) && (
                        <Alert severity="error">
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                            Please complete the required fields:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                            {errors.name && <li>Product Name (minimum 3 words)</li>}
                            {errors.category && <li>Product Category (select at least one)</li>}
                            {errors.images && <li>Product Images (at least 1)</li>}
                            {errors.price && <li>Regular Price</li>}
                          </Box>
                        </Alert>
                      )}

                      {/* Name */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory sx={{ color: '#3b82f6', fontSize: 20 }} />Product Name *
                        </Typography>
                        <TextField
                          fullWidth size="small"
                          placeholder="Enter a descriptive product name (minimum 3 words)"
                          value={form.name}
                          onChange={handleInput('name')}
                          error={errors.name}
                          helperText={errors.name ? 'Product name must contain at least 3 words' : ''}
                        />
                      </Box>

                      {/* ── Category Multi-Select (filtered to seller's segments) ── */}
                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category sx={{ color: '#3b82f6', fontSize: 20 }} />Product Categories *
                          </Typography>
                          <Button
                            size="small" startIcon={<Add />}
                            onClick={() => setCategoryRequestOpen(true)}
                            sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}
                          >
                            Request Category
                          </Button>
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
                              placeholder="Click to browse and select categories..."
                            />

                            <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mt: 0.5, display: 'block' }}>
                              Expand any category to select sub-categories and micro-categories.{' '}
                              <Typography
                                component="span" variant="caption"
                                sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                onClick={() => setCategoryRequestOpen(true)}
                              >
                                Can't find yours? Request it.
                              </Typography>
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
                      {images.some((i) => i.isExisting) && (
                        <Alert severity="info" icon={<Info />}>
                          Existing images are shown above. Upload new ones to add more.
                        </Alert>
                      )}

                      {/* Pricing */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ color: '#3b82f6', fontSize: 20 }} />Pricing Information *
                        </Typography>
                        <Stack spacing={2.5}>

                          {/* Price + Unit */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Regular Price</Typography>
                            <Grid container spacing={2} alignItems="flex-start">
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth label="Price" placeholder="0.00" type="number" size="small"
                                  value={form.price} onChange={handleInput('price')}
                                  error={errors.price}
                                  helperText={errors.price ? 'Price must be greater than 0' : ''}
                                  InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={7}>
                                <Autocomplete
                                  freeSolo size="small" options={predefinedUnitOptions}
                                  getOptionLabel={(opt) => typeof opt === 'string' ? opt : opt.label}
                                  inputValue={form.unitText}
                                  onChange={(_e, v) =>
                                    setForm((p) => ({
                                      ...p,
                                      unitText: v == null ? '' : typeof v === 'string' ? v : v.label,
                                    }))
                                  }
                                  onInputChange={(_e, v, reason) => {
                                    if (reason !== 'reset') setForm((p) => ({ ...p, unitText: v }))
                                  }}
                                  loading={unitOptionsLoading}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Unit of Measurement"
                                      placeholder="e.g. Piece, Kg, Litre..."
                                      helperText="Select from list or type a custom unit"
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
                                  renderOption={(props, opt) => (
                                    <li {...props} key={opt.value}>{opt.label}</li>
                                  )}
                                  filterOptions={(opts, params) => {
                                    const filtered = opts.filter((o) =>
                                      o.label.toLowerCase().includes(params.inputValue.toLowerCase())
                                    )
                                    const iv = params.inputValue.trim()
                                    if (iv && !opts.some((o) => o.label.toLowerCase() === iv.toLowerCase()))
                                      filtered.push({ label: `Add "${iv}"`, value: `__custom__${iv}` })
                                    return filtered
                                  }}
                                  isOptionEqualToValue={(o, v) => o.value === v.value}
                                />
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Min Order Qty */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Minimum Order Quantity</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth label="Min. Order Qty" placeholder="e.g. 50" type="number" size="small"
                                  value={form.minOrderQty} onChange={handleInput('minOrderQty')}
                                  InputProps={{
                                    endAdornment: form.unitText
                                      ? <InputAdornment position="end">{form.unitText}</InputAdornment>
                                      : undefined,
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
                                  fullWidth label="Special Price" placeholder="0.00" type="number" size="small"
                                  value={form.specialPrice} onChange={handleInput('specialPrice')}
                                  InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
                                  helperText="Discounted price for a limited time"
                                />
                              </Grid>
                              {/* Date pickers — same pattern as addproduct */}
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth label="Special Price From" size="small"
                                  type="date"
                                  value={form.specialPriceFrom}
                                  onChange={handleInput('specialPriceFrom')}
                                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                  InputLabelProps={{ shrink: true }}
                                  helperText="Start date for special price"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth label="Special Price To" size="small"
                                  type="date"
                                  value={form.specialPriceTo}
                                  onChange={handleInput('specialPriceTo')}
                                  inputProps={{
                                    min: form.specialPriceFrom || new Date().toISOString().split('T')[0],
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
                          <Description sx={{ color: '#3b82f6', fontSize: 20 }} />Product Description
                        </Typography>
                        <TextField
                          fullWidth multiline rows={5} size="small"
                          placeholder="Provide a detailed description..."
                          value={form.description} onChange={handleInput('description')}
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Minimum 100 characters recommended
                          </Typography>
                          <Typography variant="caption" sx={{ color: form.description.length > 100 ? '#10b981' : '#64748b', fontWeight: 500 }}>
                            {form.description.length} / 4000
                          </Typography>
                        </Stack>
                      </Box>

                    </Stack>
                  </Box>
                )}

                {/* ════════════════════════════════════════════
                    STEP 1 — Specifications
                ════════════════════════════════════════════ */}
                {activeStep === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Alert severity="info" icon={<Info />}>
                        Additional details help buyers make informed decisions and improve your product ranking
                      </Alert>

                      {/* SKU (disabled) */}
                      <TextField
                        fullWidth label="Product Code / SKU" size="small"
                        value={form.productCode} disabled
                        helperText="SKU cannot be changed after product creation"
                      />

                      {/* ── Dynamic Category Attributes ── */}
                      {selectedCategoryIds.length > 0 && (
                        <Box>
                          {categoryAttributesLoading ? (
                            <Stack spacing={1.5}>
                              {[1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                              ))}
                            </Stack>
                          ) : categoryAttributes.length > 0 ? (
                            <Stack spacing={3}>
                              {Object.entries(attributesByGroup).map(([groupName, attrs]) => (
                                <Box key={groupName}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #e2e8f0' }}>
                                    <Box sx={{ width: 4, height: 18, bgcolor: '#3b82f6', borderRadius: 1, flexShrink: 0 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                                      {groupName}
                                    </Typography>
                                    <Chip
                                      label={`${attrs.length} field${attrs.length > 1 ? 's' : ''}`}
                                      size="small"
                                      sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 600, ml: 'auto' }}
                                    />
                                  </Box>
                                  <Grid container spacing={2}>
                                    {attrs.map((attr) => (
                                      <Grid item xs={12} sm={6} key={attr.attribute_code}>
                                        {attr.input_type === 'select' ? (
                                          <Autocomplete
                                            size="small"
                                            options={attr.options}
                                            getOptionLabel={(opt) => typeof opt === 'string' ? opt : opt.label}
                                            value={attr.options.find((o) => o.value === attributeValues[attr.attribute_code]) ?? null}
                                            onChange={(_e, newVal) => {
                                              setAttributeValues((prev) => ({
                                                ...prev,
                                                [attr.attribute_code]: newVal ? (newVal as AttributeOption).value : '',
                                              }))
                                            }}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label={attr.label}
                                                placeholder={`Select ${attr.label.toLowerCase()}...`}
                                              />
                                            )}
                                            renderOption={(props, option) => (
                                              <li {...props} key={option.value}>{option.label}</li>
                                            )}
                                            isOptionEqualToValue={(o, v) => o.value === v.value}
                                          />
                                        ) : (
                                          <TextField
                                            fullWidth size="small"
                                            label={attr.label}
                                            placeholder={`Enter ${attr.label.toLowerCase()}...`}
                                            value={attributeValues[attr.attribute_code] ?? ''}
                                            onChange={(e) => {
                                              setAttributeValues((prev) => ({
                                                ...prev,
                                                [attr.attribute_code]: e.target.value,
                                              }))
                                            }}
                                            type={
                                              attr.backend_type === 'decimal' || attr.backend_type === 'int'
                                                ? 'number'
                                                : 'text'
                                            }
                                          />
                                        )}
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.85rem' }}>
                              No additional specifications required for the selected categories.
                            </Alert>
                          )}
                        </Box>
                      )}

                      {selectedCategoryIds.length === 0 && (
                        <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
                          Select categories in Step 1 to load product specifications.
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* ════════════════════════════════════════════
                    STEP 2 — Review
                ════════════════════════════════════════════ */}
                {activeStep === 2 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Review Your Changes</Typography>
                    <Stack spacing={2}>

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Product Name</Typography>
                          <Typography variant="body2" fontWeight={600}>{form.name || 'Not provided'}</Typography>
                        </CardContent>
                      </Card>

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">SKU</Typography>
                          <Typography variant="body2" fontWeight={600}>{sku}</Typography>
                        </CardContent>
                      </Card>

                      {/* Categories */}
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Categories ({selectedCategoryUids.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {selectedCategoryUids.length === 0
                              ? <Typography variant="body2" color="text.secondary">None selected</Typography>
                              : selectedCategoryUids.map((uid) => (
                                <Chip
                                  key={uid} size="small"
                                  label={findCategoryName(allMainCategories, uid)}
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

                      {/* Pricing */}
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Pricing</Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={600}>
                              Rs.{form.price || '0'}{form.unitText ? ` / ${form.unitText}` : ''}
                            </Typography>
                            {form.minOrderQty && (
                              <Typography variant="body2" color="text.secondary">
                                Min. Order: {form.minOrderQty}{form.unitText ? ` ${form.unitText}` : ''}
                              </Typography>
                            )}
                            {form.specialPrice && (
                              <Box>
                                <Chip
                                  label={`Special Price: Rs.${form.specialPrice}`} size="small"
                                  sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 600, width: 'fit-content' }}
                                />
                                {form.specialPriceFrom && form.specialPriceTo && (
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Valid from {form.specialPriceFrom} to {form.specialPriceTo}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Images */}
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">Images</Typography>
                          <Typography variant="body2">
                            {images.filter((i) => i.isExisting).length} existing &nbsp;·&nbsp;
                            {images.filter((i) => !i.isExisting).length} new to upload
                          </Typography>
                        </CardContent>
                      </Card>

                      {/* Category Attributes summary */}
                      {categoryAttributes.length > 0 &&
                        Object.keys(attributeValues).some((k) => attributeValues[k]) && (
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ py: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Product Specifications</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {categoryAttributes
                                  .filter((a) => attributeValues[a.attribute_code])
                                  .map((attr) => {
                                    const val = attributeValues[attr.attribute_code]
                                    const label = attr.input_type === 'select'
                                      ? (attr.options.find((o) => o.value === val)?.label ?? val)
                                      : val
                                    return (
                                      <Chip
                                        key={attr.attribute_code} size="small"
                                        label={`${attr.label}: ${label}`}
                                        sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569' }}
                                      />
                                    )
                                  })}
                              </Box>
                            </CardContent>
                          </Card>
                        )}

                      {/* Description */}
                      {form.description && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto' }}>
                              {form.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}

                      <Alert severity="success">
                        Review your changes above and click "Save Changes" to update the product.
                      </Alert>
                    </Stack>
                  </Box>
                )}

                {/* ── Nav footer ── */}
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#fafbfc' }}>
                  <Button
                    variant="outlined" size="small" onClick={handleBack}
                    disabled={activeStep === 0 || isProcessing}
                    sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained" size="small"
                    onClick={activeStep === steps.length - 1 ? handleUpdate : handleNext}
                    disabled={isProcessing}
                    sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, minWidth: 140 }}
                  >
                    {isProcessing ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        <Typography variant="caption" sx={{ color: 'white' }}>
                          {isUpdating ? 'Saving...' : 'Uploading...'}
                        </Typography>
                      </Stack>
                    ) : activeStep === steps.length - 1 ? 'Save Changes' : 'Continue'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <ProductQualityScore
                productData={{ ...form, unit: form.unitText }}
                selectedCategory={selectedCategoryUids[0] ?? ''}
                images={images}
              />
            </Grid>
          </Grid>

          {/* ── Category Request Dialog ── */}
          <Dialog
            open={categoryRequestOpen}
            onClose={() => setCategoryRequestOpen(false)}
            maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Request New Category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Can't find the right category? Let us know and we'll add it.
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                fullWidth label="Category Name"
                placeholder="e.g., Organic Food Products, Solar Equipment..."
                value={requestedCategory}
                onChange={(e) => setRequestedCategory(e.target.value)}
                multiline rows={3} sx={{ mb: 2 }}
                helperText="Please provide as much detail as possible"
              />
              <Alert severity="info">Requests are reviewed within 24-48 hours.</Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="outlined"
                onClick={() => { setCategoryRequestOpen(false); setRequestedCategory('') }}
                sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained" disabled={!requestedCategory.trim()}
                onClick={() => {
                  setSnackbar({ open: true, message: `Category request submitted: ${requestedCategory}`, severity: 'success' })
                  setCategoryRequestOpen(false)
                  setRequestedCategory('')
                }}
                sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
              >
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Snackbar ── */}
          <Snackbar
            open={snackbar.open} autoHideDuration={6000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              severity={snackbar.severity} sx={{ width: '100%' }}
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

// ─── Page options ─────────────────────────────────────────────────────────────

const pageOptions: PageOptions<LayoutNavigationProps> = { Layout: LayoutNavigation }
ProductEditPage.pageOptions = pageOptions
export default ProductEditPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  return {
    props: { ...(await layout).data, apolloState: await conf.then(() => client.cache.extract()) },
    revalidate: 60 * 20,
  }
}