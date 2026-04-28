import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  alpha,
  Stack,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import VerifiedIcon from '@mui/icons-material/Verified'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@graphcommerce/graphql'

import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { getSellerId } from '../../lib/utils/getMobileNumber'

const sellerId = Number(getSellerId())

// ─── GraphQL: Query ──────────────────────────────────────────────────────────

const VENDOR_STORE_QUERY = gql`
  query VendorStores($customer_id: Int) {
    vendorStores(customer_id: $customer_id) {
      store_id
      customer_id
      store_code
      store_name
      address
      area
      city
      state
      country
      pincode
      latitude
      longitude
      status
      gst_number
      years_in_business
      trust_seal
      phone
      email
      logo
      certifications
      completed_projects
      awards
      about_us
      created_at
      updated_at
      firstname
      lastname
      whatsapp_number
      businesscategories
    }
  }
`

// ─── GraphQL: Mutation ───────────────────────────────────────────────────────
//
// Uses the UpdateVendorStoreInput input object pattern.
// All fields except store_id and customer_id are optional —
// handleSave only includes fields relevant to the section being saved.

const UPDATE_VENDOR_STORE_MUTATION = gql`
  mutation UpdateVendorStore($input: UpdateVendorStoreInput!) {
    updateVendorStore(input: $input) {
      success
      message
      store {
        store_id
        store_name
        store_code
        address
        area
        city
        state
        country
        pincode
        latitude
        longitude
        phone
        email
        whatsapp_number
        gst_number
        years_in_business
        completed_projects
        awards
        certifications
        about_us
        firstname
        lastname
        updated_at
      }
    }
  }
`

// ─── Types ───────────────────────────────────────────────────────────────────

type StoreData = {
  store_id: number
  customer_id: number
  store_code: string
  store_name: string
  address: string
  area: string
  city: string
  state: string
  country: string | null
  pincode: string
  latitude: number | string | null
  longitude: number | string | null
  status: number
  gst_number: string | null
  years_in_business: number | null
  trust_seal: boolean
  phone: string
  email: string
  logo: string | null
  certifications: string | null
  completed_projects: number | null
  awards: string | null
  about_us: string
  created_at?: string
  updated_at?: string
  firstname: string
  lastname: string
  whatsapp_number: string
  businesscategories: string
}

// Maps each section to the input fields it is responsible for.
// store_id and customer_id are always injected separately.
const SECTION_FIELDS: Record<string, (keyof StoreData)[]> = {
  store: [
    'store_name',
    'store_code',
    'firstname',
    'lastname',
    'years_in_business',
    'completed_projects',
    'awards',
    'certifications',
  ],
  location: ['address', 'area', 'city', 'state', 'country', 'pincode', 'latitude', 'longitude'],
  contact: ['phone', 'email', 'whatsapp_number', 'gst_number'],
  about: ['about_us'],
}

// Fields that should be sent as Float to GraphQL (latitude / longitude)
const FLOAT_FIELDS: (keyof StoreData)[] = ['latitude', 'longitude']

// Fields that should be sent as Int to GraphQL
const INT_FIELDS: (keyof StoreData)[] = ['years_in_business']

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  accentColor,
  sectionKey,
  editingSection,
  savingSection,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string
  icon: React.ReactNode
  accentColor: string
  sectionKey: string
  editingSection: string | null
  savingSection: string | null
  onEdit: (key: string) => void
  onSave: (key: string) => void
  onCancel: () => void
  children: React.ReactNode
}) {
  const isEditing = editingSection === sectionKey
  const isSaving = savingSection === sectionKey

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isEditing ? accentColor : 'divider',
        borderRadius: 3,
        overflow: 'visible',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: isEditing ? `0 0 0 3px ${alpha(accentColor, 0.12)}` : 'none',
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: alpha(accentColor, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant='subtitle1' fontWeight={700} fontSize='0.95rem'>
            {title}
          </Typography>
        }
        action={
          <Stack direction='row' spacing={1} alignItems='center' sx={{ pr: 0.5, pt: 0.5 }}>
            {isEditing ? (
              <>
                <Button
                  size='small'
                  variant='contained'
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={14} color='inherit' />
                    ) : (
                      <SaveIcon fontSize='small' />
                    )
                  }
                  disabled={isSaving}
                  onClick={() => onSave(sectionKey)}
                  sx={{
                    bgcolor: accentColor,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    px: 2,
                    '&:hover': { bgcolor: accentColor, filter: 'brightness(0.9)' },
                    '&.Mui-disabled': { bgcolor: alpha(accentColor, 0.5), color: '#fff' },
                  }}
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
                <Tooltip title='Cancel'>
                  <span>
                    <IconButton
                      size='small'
                      onClick={onCancel}
                      disabled={isSaving}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CancelIcon fontSize='small' />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : (
              <Tooltip title={`Edit ${title}`}>
                <IconButton
                  size='small'
                  onClick={() => onEdit(sectionKey)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: accentColor, bgcolor: alpha(accentColor, 0.08) },
                  }}
                >
                  <EditIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
        sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}
      />
      <CardContent sx={{ pt: 2.5, pb: '20px !important' }}>{children}</CardContent>
    </Card>
  )
}

// ─── Read-only Field ──────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Box>
      <Typography
        variant='caption'
        color='text.secondary'
        fontWeight={600}
        letterSpacing={0.5}
        sx={{ textTransform: 'uppercase', fontSize: '0.68rem' }}
      >
        {label}
      </Typography>
      <Typography
        variant='body2'
        fontWeight={500}
        sx={{ mt: 0.25, color: value != null && value !== '' ? 'text.primary' : 'text.disabled' }}
      >
        {value != null && value !== '' ? value : '—'}
      </Typography>
    </Box>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <Box>
      <Skeleton variant='rounded' height={140} sx={{ mb: 3, borderRadius: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Skeleton variant='rounded' height={220} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant='rounded' height={260} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant='rounded' height={260} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant='rounded' height={300} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Box>
  )
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const exec = (cmd: string, arg?: string) => document.execCommand(cmd, false, arg)

  const toolbarButtons = [
    { label: 'B', cmd: 'bold', style: { fontWeight: 'bold' as const } },
    { label: 'I', cmd: 'italic', style: { fontStyle: 'italic' as const } },
    { label: 'U', cmd: 'underline', style: { textDecoration: 'underline' as const } },
    { label: 'H3', cmd: 'formatBlock', arg: 'h3', style: {} },
    { label: '• List', cmd: 'insertUnorderedList', style: {} },
    { label: '1. List', cmd: 'insertOrderedList', style: {} },
  ]

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: '#8b5cf6',
          boxShadow: `0 0 0 3px ${alpha('#8b5cf6', 0.1)}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 1,
          bgcolor: alpha('#000', 0.02),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {toolbarButtons.map((btn) => (
          <Button
            key={btn.cmd + (btn.arg ?? '')}
            size='small'
            variant='outlined'
            onMouseDown={(e) => {
              e.preventDefault()
              exec(btn.cmd, btn.arg)
            }}
            sx={{
              minWidth: 'auto',
              px: 1.2,
              py: 0.3,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              borderRadius: 1.5,
              ...btn.style,
              '&:hover': { borderColor: '#8b5cf6', color: '#8b5cf6' },
            }}
          >
            {btn.label}
          </Button>
        ))}
      </Box>
      <Box
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange((e.target as HTMLElement).innerHTML)}
        sx={{
          minHeight: 200,
          p: 2,
          outline: 'none',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: 'text.primary',
          '& h3': { fontSize: '1rem', fontWeight: 700, mb: 1, mt: 1.5 },
          '& ul, & ol': { pl: 2.5 },
          '& li': { mb: 0.5 },
          '& p': { mb: 1 },
          '& strong': { fontWeight: 700 },
        }}
      />
    </Box>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>


function SellerProfilePage() {
  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })

  // ── Fetch store ───────────────────────────────────────────────────────────
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(VENDOR_STORE_QUERY, {
    variables: { customer_id: sellerId },
    fetchPolicy: 'network-only',
  })

  const rawStore: StoreData | null = data?.vendorStores?.[0] ?? null

  // ── Mutation ──────────────────────────────────────────────────────────────
  const [updateVendorStore] = useMutation(UPDATE_VENDOR_STORE_MUTATION)

  // ── Local state ───────────────────────────────────────────────────────────
  const [draft, setDraft] = useState<StoreData | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [sectionError, setSectionError] = useState<string | null>(null)

  // Seed draft from API on first load
  useEffect(() => {
    if (rawStore && !draft) {
      setDraft(rawStore)
    }
  }, [rawStore])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (section: string) => {
      // Always re-seed from latest server data so edits start fresh
      if (rawStore) setDraft({ ...rawStore })
      setEditingSection(section)
      setSectionError(null)
    },
    [rawStore],
  )

  const handleCancel = useCallback(() => {
    if (rawStore) setDraft({ ...rawStore })
    setEditingSection(null)
    setSectionError(null)
  }, [rawStore])

  const handleSave = useCallback(
    async (section: string) => {
      if (!draft || !rawStore) return

      setSavingSection(section)
      setSectionError(null)

      // Build the input object — always include the required IDs,
      // then add only the fields that belong to the section being saved.
      const sectionFields = SECTION_FIELDS[section] ?? []

      const input: Record<string, unknown> = {
        store_id: rawStore.store_id,
        customer_id: sellerId,
      }

      sectionFields.forEach((key) => {
        const raw = draft[key]
        const strVal = String(raw ?? '').trim()

        if (FLOAT_FIELDS.includes(key)) {
          // latitude / longitude → Float | null
          input[key] = strVal !== '' && !isNaN(Number(strVal)) ? parseFloat(strVal) : null
        } else if (INT_FIELDS.includes(key)) {
          // years_in_business / completed_projects → Int | null
          input[key] = strVal !== '' && !isNaN(Number(strVal)) ? parseInt(strVal, 10) : null
        } else {
          // Everything else → String | null
          input[key] = strVal !== '' ? strVal : null
        }
      })

      try {
        const result = await updateVendorStore({ variables: { input } })
        const payload = result.data?.updateVendorStore

        if (payload?.success === false) {
          // API returned success: false — surface the message
          throw new Error(payload.message ?? 'Update failed. Please try again.')
        }

        if (payload?.store) {
          // Merge the returned store fields back into draft so UI is in sync
          setDraft((prev) => (prev ? { ...prev, ...payload.store } : prev))
          setSaveSuccess(section)
          setTimeout(() => setSaveSuccess(null), 3500)
        }

        setEditingSection(null)
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        setSectionError(message)
      } finally {
        setSavingSection(null)
      }
    },
    [draft, rawStore, updateVendorStore],
  )

  // ── Field binding helper ───────────────────────────────────────────────────

  const field = (key: keyof StoreData) => ({
    value: String(draft?.[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((prev) => (prev ? { ...prev, [key]: e.target.value } : prev)),
  })

  const isEditing = (s: string) => editingSection === s

  // ── Render: loading ───────────────────────────────────────────────────────

  if (queryLoading) {
    return (
      <>
        <PageMeta title={i18n._(/* i18n */ 'Seller Profile')} metaRobots={['noindex']} />
        <SellerAccountLayout>
          <ProfileSkeleton />
        </SellerAccountLayout>
      </>
    )
  }

  // ── Render: error / no store ──────────────────────────────────────────────

  if (queryError || !rawStore) {
    return (
      <>
        <PageMeta title={i18n._(/* i18n */ 'Seller Profile')} metaRobots={['noindex']} />
        <SellerAccountLayout>
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant='h6' color='text.secondary' mb={1}>
              Could not load store profile
            </Typography>
            <Typography variant='body2' color='text.disabled' mb={3}>
              {queryError?.message ?? 'No store found for this account.'}
            </Typography>
            <Button variant='outlined' onClick={() => refetch()}>
              Retry
            </Button>
          </Box>
        </SellerAccountLayout>
      </>
    )
  }

  // Use local draft for display (reflects in-progress edits)
  const storeData = draft ?? rawStore

  // ── Render: profile ───────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Seller Profile')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* ── Page Header ── */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h4'
              fontWeight={700}
              mb={0.5}
              fontSize={{ xs: '1.6rem', md: '2rem' }}
            >
              <Trans id='Seller Profile' />
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              <Trans id='Manage your store information, contact details, and public profile' />
            </Typography>
          </Box>

          {/* ── Success alert ── */}
          {saveSuccess && (
            <Alert
              icon={<VerifiedIcon fontSize='small' />}
              severity='success'
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <strong>Saved!</strong> Your {saveSuccess} details have been updated successfully.
            </Alert>
          )}

          {/* ── Error alert ── */}
          {sectionError && (
            <Alert
              severity='error'
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setSectionError(null)}
            >
              {sectionError}
            </Alert>
          )}

          {/* ── Store Header Banner ── */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2140 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: '50%',
                bgcolor: alpha('#fff', 0.04),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                right: 80,
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: alpha('#fff', 0.03),
              }}
            />

            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                {/* Logo */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    src={storeData.logo ?? undefined}
                    sx={{
                      width: { xs: 64, md: 80 },
                      height: { xs: 64, md: 80 },
                      fontSize: '2rem',
                      fontWeight: 700,
                      bgcolor: alpha('#3b82f6', 0.6),
                      border: '3px solid',
                      borderColor: alpha('#fff', 0.2),
                    }}
                  >
                    {storeData.store_name?.[0]}
                  </Avatar>
                  <Tooltip title='Change logo'>
                    <IconButton
                      size='small'
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: '#fff',
                        width: 26,
                        height: 26,
                        color: '#1e3a5f',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Store Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction='row' alignItems='center' spacing={1} mb={0.5}>
                    <Typography
                      variant='h5'
                      fontWeight={700}
                      color='#fff'
                      fontSize={{ xs: '1.2rem', md: '1.4rem' }}
                      noWrap
                    >
                      {storeData.store_name}
                    </Typography>
                    {storeData.trust_seal && (
                      <Tooltip title='Trust Seal Verified'>
                        <VerifiedIcon sx={{ color: '#60a5fa', fontSize: 20, flexShrink: 0 }} />
                      </Tooltip>
                    )}
                  </Stack>
                  <Typography variant='body2' sx={{ color: alpha('#fff', 0.65), mb: 1.5 }}>
                    {storeData.firstname} {storeData.lastname} • Store Code:{' '}
                    {storeData.store_code}
                  </Typography>
                  <Stack direction='row' flexWrap='wrap' gap={1}>
                    <Chip
                      size='small'
                      label={storeData.status === 1 ? 'Active' : 'Inactive'}
                      sx={{
                        bgcolor:
                          storeData.status === 1
                            ? alpha('#10b981', 0.25)
                            : alpha('#ef4444', 0.25),
                        color: storeData.status === 1 ? '#6ee7b7' : '#fca5a5',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        border: '1px solid',
                        borderColor:
                          storeData.status === 1
                            ? alpha('#10b981', 0.4)
                            : alpha('#ef4444', 0.4),
                      }}
                    />
                    {(storeData.area || storeData.city) && (
                      <Chip
                        size='small'
                        label={[storeData.area, storeData.city].filter(Boolean).join(', ')}
                        icon={
                          <LocationOnIcon
                            sx={{
                              fontSize: '14px !important',
                              color: `${alpha('#fff', 0.6)} !important`,
                            }}
                          />
                        }
                        sx={{
                          bgcolor: alpha('#fff', 0.08),
                          color: alpha('#fff', 0.75),
                          fontSize: '0.72rem',
                        }}
                      />
                    )}
                    {storeData.years_in_business && (
                      <Chip
                        size='small'
                        label={`${storeData.years_in_business} yrs in business`}
                        sx={{
                          bgcolor: alpha('#fff', 0.08),
                          color: alpha('#fff', 0.75),
                          fontSize: '0.72rem',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* ── Sections ── */}
          <Grid container spacing={3}>

            {/* 1. Store Information */}
            <Grid item xs={12}>
              <SectionCard
                title='Store Information'
                icon={<StorefrontIcon fontSize='small' />}
                accentColor='#3b82f6'
                sectionKey='store'
                editingSection={editingSection}
                savingSection={savingSection}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <Grid container spacing={2.5}>
                  {isEditing('store') ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Store Name'
                          size='small'
                          {...field('store_name')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Store Code'
                          size='small'
                          {...field('store_code')}
                          helperText='Used in your public store URL'
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='First Name'
                          size='small'
                          {...field('firstname')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Last Name'
                          size='small'
                          {...field('lastname')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Years in Business'
                          size='small'
                          type='number'
                          inputProps={{ min: 0 }}
                          {...field('years_in_business')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Completed Projects'
                          size='small'
                          type='number'
                          inputProps={{ min: 0 }}
                          {...field('completed_projects')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Awards'
                          size='small'
                          multiline
                          rows={2}
                          {...field('awards')}
                          placeholder='e.g. Best Seller 2024, Top Rated Vendor'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Certifications'
                          size='small'
                          multiline
                          rows={2}
                          {...field('certifications')}
                          placeholder='e.g. ISO 9001, BIS Certified'
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={6} sm={3}>
                        <ReadField label='Store Name' value={storeData.store_name} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField label='Store Code' value={storeData.store_code} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField
                          label='Owner Name'
                          value={`${storeData.firstname} ${storeData.lastname}`}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField
                          label='Status'
                          value={storeData.status === 1 ? 'Active' : 'Inactive'}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField
                          label='Years in Business'
                          value={storeData.years_in_business}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField
                          label='Completed Projects'
                          value={storeData.completed_projects}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField label='Awards' value={storeData.awards} />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <ReadField label='Certifications' value={storeData.certifications} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </SectionCard>
            </Grid>

            {/* 2. Location */}
            <Grid item xs={12} md={6}>
              <SectionCard
                title='Location & Address'
                icon={<LocationOnIcon fontSize='small' />}
                accentColor='#f59e0b'
                sectionKey='location'
                editingSection={editingSection}
                savingSection={savingSection}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <Grid container spacing={2}>
                  {isEditing('location') ? (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Address'
                          size='small'
                          multiline
                          rows={2}
                          {...field('address')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label='Area' size='small' {...field('area')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label='City' size='small' {...field('city')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label='State' size='small' {...field('state')} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Pincode'
                          size='small'
                          {...field('pincode')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Country'
                          size='small'
                          {...field('country')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Latitude'
                          size='small'
                          type='number'
                          inputProps={{ step: 'any' }}
                          {...field('latitude')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Longitude'
                          size='small'
                          type='number'
                          inputProps={{ step: 'any' }}
                          {...field('longitude')}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <ReadField label='Address' value={storeData.address} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='Area' value={storeData.area} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='City' value={storeData.city} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='State' value={storeData.state} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='Pincode' value={storeData.pincode} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='Country' value={storeData.country} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='Latitude' value={storeData.latitude} />
                      </Grid>
                      <Grid item xs={6}>
                        <ReadField label='Longitude' value={storeData.longitude} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </SectionCard>
            </Grid>

            {/* 3. Contact */}
            <Grid item xs={12} md={6}>
              <SectionCard
                title='Contact Details'
                icon={<ContactPhoneIcon fontSize='small' />}
                accentColor='#10b981'
                sectionKey='contact'
                editingSection={editingSection}
                savingSection={savingSection}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <Grid container spacing={2}>
                  {isEditing('contact') ? (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Phone'
                          size='small'
                          {...field('phone')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Email'
                          size='small'
                          type='email'
                          {...field('email')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='WhatsApp Number'
                          size='small'
                          {...field('whatsapp_number')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='GST Number'
                          size='small'
                          {...field('gst_number')}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <ReadField label='Phone' value={storeData.phone} />
                      </Grid>
                      <Grid item xs={12}>
                        <ReadField label='Email' value={storeData.email} />
                      </Grid>
                      <Grid item xs={12}>
                        <ReadField label='WhatsApp' value={storeData.whatsapp_number} />
                      </Grid>
                      <Grid item xs={12}>
                        <ReadField label='GST Number' value={storeData.gst_number} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </SectionCard>
            </Grid>

            {/* 4. About Us */}
            <Grid item xs={12}>
              <SectionCard
                title='About Us'
                icon={<InfoOutlinedIcon fontSize='small' />}
                accentColor='#8b5cf6'
                sectionKey='about'
                editingSection={editingSection}
                savingSection={savingSection}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                {isEditing('about') ? (
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      mb={1.5}
                      display='block'
                    >
                      Use the toolbar to format your store description. This will appear on
                      your public seller profile.
                    </Typography>
                    <RichTextEditor
                      value={draft?.about_us ?? ''}
                      onChange={(val) =>
                        setDraft((prev) => (prev ? { ...prev, about_us: val } : prev))
                      }
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      fontSize: '0.875rem',
                      lineHeight: 1.75,
                      color: 'text.primary',
                      '& h3': {
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        mb: 1,
                        mt: 1.5,
                        color: 'text.primary',
                      },
                      '& ul, & ol': { pl: 2.5 },
                      '& li': { mb: 0.5 },
                      '& p': { mb: 1 },
                      '& strong': { fontWeight: 700 },
                      '& hr': { my: 2, borderColor: 'divider' },
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        storeData.about_us ||
                        '<p style="color:#999">No description added yet. Click Edit to add your store description.</p>',
                    }}
                  />
                )}
              </SectionCard>
            </Grid>

          </Grid>

          {/* ── Meta Info ── */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent='space-between'
            >
              <Typography variant='caption' color='text.disabled'>
                Store ID: {storeData.store_id} • Customer ID: {storeData.customer_id}
              </Typography>
              {storeData.updated_at && (
                <Typography variant='caption' color='text.disabled'>
                  Last updated:{' '}
                  {new Date(storeData.updated_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              )}
            </Stack>
          </Box>

        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

// ─── Page config & SSG ───────────────────────────────────────────────────────

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

SellerProfilePage.pageOptions = pageOptions
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
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}