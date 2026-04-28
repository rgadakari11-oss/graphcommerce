import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { useCustomerAccountCanSignIn } from '@graphcommerce/magento-customer'
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
  MenuItem,
  InputAdornment,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material'
import { useMutation, useLazyQuery, gql } from '@apollo/client'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { SignUpDocument } from '@graphcommerce/magento-customer/components/SignUpForm/SignUp.gql'
import { UpdateCustomerSellerDetailsDocument } from '../graphql/account/UpdateCustomerSellerDetails.gql'

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const CREATE_VENDOR_STORE = gql`
  mutation CreateVendorStore($input: CreateVendorStoreInput!) {
    createVendorStore(input: $input) {
      success
      message
      store_id
    }
  }
`

const GET_VENDOR_STORES = gql`
  query VendorStores($mobile: String) {
    vendorStores(mobile: $mobile) {
      store_id
      store_code
      store_name
      phone
      email
      address
      area
      city
      state
      country
      pincode
      status
      firstname
      lastname
      whatsapp_number
      businesscategories
      created_at
      updated_at
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerSignupSession {
  mobile: string
  verifiedAt: number
}

interface VendorStoreData {
  store_id: number
  store_code?: string
  store_name: string
  phone: string
  email?: string
  address?: string
  area?: string
  city: string
  state: string
  country?: string
  pincode: string
  status: number
  firstname: string
  lastname: string
  whatsapp_number?: string
  businesscategories?: string
  created_at?: string
  updated_at?: string
}

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// businessCategory is now a comma-separated STRING, not an array
interface BusinessFormData {
  firstName: string
  lastName: string
  businessName: string
  email: string
  mobile: string
  whatsapp: string
  password: string
  confirmPassword: string
  pincode: string
  plotNumber: string
  buildingName: string
  streetName: string
  landmark: string
  area: string
  city: string
  state: string
  businessCategory: string   // comma-separated, e.g. "Agriculture & Farming,Electronics"
}

const initialFormData: BusinessFormData = {
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  mobile: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  pincode: '',
  plotNumber: '',
  buildingName: '',
  streetName: '',
  landmark: '',
  area: '',
  city: '',
  state: '',
  businessCategory: '',
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function SellerProfileRegistrationPage({ menu }: LayoutNavigationProps) {
  const router = useRouter()

  // ── Root categories from LayoutDocument menu ───────────────────────────────
  // menu?.items?.[0]?.children = top-level (root) categories
  // These are used as business category options — same source as LayoutNavigation
  const rootCategories: string[] = useMemo(() => {
    const items = menu?.items?.[0]?.children ?? []
    return items.map((item: any) => item?.name).filter(Boolean) as string[]
  }, [menu])

  // ── State ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<BusinessFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasExistingData, setHasExistingData] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean; message: string; severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // ── Derived: businessCategory as array (for Autocomplete UI only) ──────────
  // The source of truth is formData.businessCategory (comma-separated string).
  // We only convert to array for Autocomplete rendering and back to string on change.
  const selectedCategoryArray: string[] = useMemo(() => {
    if (!formData.businessCategory) return []
    return formData.businessCategory.split(',').map((s) => s.trim()).filter(Boolean)
  }, [formData.businessCategory])

  // ── GraphQL ────────────────────────────────────────────────────────────────
  const SIGN_IN = gql`
    mutation SignIn($email: String!, $password: String!) {
      generateCustomerToken(email: $email, password: $password) {
        token
      }
    }
  `
  const [signIn] = useMutation(SIGN_IN)
  const [signUp] = useMutation(SignUpDocument)
  const [updateCustomerSellerDetails] = useMutation(UpdateCustomerSellerDetailsDocument)

  const [getVendorStores] = useLazyQuery(GET_VENDOR_STORES, {
    onCompleted: (data) => {
      if (data.vendorStores && data.vendorStores.length > 0) {
        const store: VendorStoreData = data.vendorStores[0]
        setHasExistingData(true)

        // Parse address field (comma-separated: "plotNumber,buildingName,streetName,landmark")
        const addressParts = (store.address || '').split(',').map((s: string) => s.trim())

        // businesscategories is already stored as comma-separated string in the API
        const categoriesStr = typeof store.businesscategories === 'string'
          ? store.businesscategories
          : ''

        setFormData({
          firstName: store.firstname || '',
          lastName: store.lastname || '',
          businessName: store.store_name || '',
          email: store.email || '',
          mobile: store.phone || '',
          whatsapp: store.whatsapp_number || '',
          password: '',
          confirmPassword: '',
          pincode: store.pincode || '',
          plotNumber: addressParts[0] || '',
          buildingName: addressParts[1] || '',
          streetName: addressParts[2] || '',
          landmark: addressParts[3] || '',
          area: store.area || '',
          city: store.city || '',
          state: store.state || '',
          businessCategory: categoriesStr,
        })

        if (store.whatsapp_number && store.phone && store.whatsapp_number === store.phone) {
          setWhatsappSameAsMobile(true)
        }

        if (store.status === 0) {
          if (categoriesStr && store.city && store.pincode) {
            setCurrentStep(2)
          } else if (store.firstname && store.store_name) {
            setCurrentStep(1)
          }
        }
      }
      setIsLoading(false)
    },
    onError: (error) => {
      console.error('Error fetching vendor store:', error)
      setIsLoading(false)
    },
    fetchPolicy: 'network-only',
  })

  const [createVendorStore] = useMutation(CREATE_VENDOR_STORE, {
    onCompleted: (data) => {
      setIsSaving(false)
      if (data.createVendorStore.success) {
        setSnackbar({
          open: true,
          message: data.createVendorStore.message || 'Progress saved successfully!',
          severity: 'success',
        })
      }
    },
    onError: (error) => {
      setIsSaving(false)
      setSnackbar({ open: true, message: 'Error saving progress. Please try again.', severity: 'error' })
      console.error('Save error:', error)
    },
  })

  // ── Session check + fetch existing data ────────────────────────────────────
  useEffect(() => {
    const checkSellerSession = async () => {
      try {
        const sellerSessionData = sessionStorage.getItem('seller-signup')
        if (!sellerSessionData) {
          router.push('/account/sellersignup')
          return
        }
        const sessionData: SellerSignupSession = JSON.parse(sellerSessionData)
        if (!sessionData.mobile || !sessionData.verifiedAt) {
          router.push('/account/sellersignup')
          return
        }
        setFormData((prev) => ({ ...prev, mobile: sessionData.mobile }))
        await getVendorStores({ variables: { mobile: sessionData.mobile } })
      } catch (error) {
        console.error('Error checking seller session:', error)
        setIsLoading(false)
        router.push('/account/signupcustomer')
      }
    }
    checkSellerSession()
  }, [router, getVendorStores])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'mobile' && whatsappSameAsMobile) updated.whatsapp = value
      return updated
    })
  }

  const handleWhatsappCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setWhatsappSameAsMobile(isChecked)
    if (isChecked) setFormData((prev) => ({ ...prev, whatsapp: prev.mobile }))
  }

  /**
   * Autocomplete onChange — receives string[] from the UI,
   * joins to comma-separated string and stores in formData.
   */
  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    setFormData((prev) => ({
      ...prev,
      businessCategory: newValue.join(','),
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const input: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        email: formData.email || '',
        mobile: formData.mobile,
        whatsapp: formData.whatsapp || '',
        pincode: formData.pincode || '',
        plotNumber: formData.plotNumber || '',
        buildingName: formData.buildingName || '',
        streetName: formData.streetName || '',
        landmark: formData.landmark || '',
        area: formData.area || '',
        city: formData.city || '',
        state: formData.state || '',
        currentStep,
        status: 'draft',
        // Send comma-separated string directly — no join needed
        businessCategory: formData.businessCategory || '',
      }
      await createVendorStore({ variables: { input } })
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const input: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        email: formData.email || '',
        mobile: formData.mobile,
        whatsapp: formData.whatsapp || '',
        pincode: formData.pincode || '',
        plotNumber: formData.plotNumber || '',
        buildingName: formData.buildingName || '',
        streetName: formData.streetName || '',
        landmark: formData.landmark || '',
        area: formData.area || '',
        city: formData.city || '',
        state: formData.state || '',
        // Send comma-separated string directly
        businessCategory: formData.businessCategory || '',
        currentStep: 3,
        status: '1',
      }

      const emailFromMobile = `${formData.mobile}@gmail.com`

      await signUp({
        variables: {
          email: emailFromMobile,
          password: formData.password,
          prefix: 'Mr',
          firstname: formData.firstName,
          lastname: formData.lastName,
          isSubscribed: false,
        },
      })

      await updateCustomerSellerDetails({
        variables: {
          email: emailFromMobile,
          mobile_number: formData.mobile,
          is_seller: true,
        },
      })

      await signIn({
        variables: { email: emailFromMobile, password: formData.password },
      })

      const result = await createVendorStore({ variables: { input } })

      if (result.data?.createVendorStore?.success) {
        setSnackbar({
          open: true,
          message: result.data.createVendorStore.message || 'Registration submitted successfully!',
          severity: 'success',
        })
        sessionStorage.removeItem('seller-signup')
        setTimeout(() => { router.push('/seller/profile') }, 2000)
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error submitting registration. Please try again.',
        severity: 'error',
      })
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })
  const handleNextStep = () => { if (currentStep < 3) setCurrentStep(currentStep + 1) }
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.businessName && formData.mobile)
      case 2:
        return !!(formData.pincode && formData.city && formData.state && formData.businessCategory)
      case 3:
        return !!(
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 8
        )
      default:
        return false
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta
        title="Business Signup - Register Your Business"
        metaDescription="Join our platform and grow your business. Register now to access exclusive features and reach more customers."
      />

      {/* Loading Screen */}
      {isLoading ? (
        <Box sx={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              <Trans id="Loading your information..." />
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 4, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3,
          },
        }}>
          <Container maxWidth="lg">
            <Fade in timeout={800}>
              <Box>

                {/* ── Header ── */}
                <Box textAlign="center" mb={6} position="relative" zIndex={1}>
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                    mb: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    <StoreIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="h1" gutterBottom sx={{
                    color: 'white', fontWeight: 800,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}>
                    <Trans id={hasExistingData ? 'Continue Your Registration' : 'Register Your Business'} />
                  </Typography>
                  <Typography variant="h6" sx={{
                    color: 'rgba(255,255,255,0.9)', fontWeight: 400, maxWidth: 600, mx: 'auto',
                  }}>
                    <Trans id={hasExistingData
                      ? 'Complete your business registration'
                      : 'Join thousands of businesses growing with our platform'} />
                  </Typography>
                </Box>

                {/* ── Progress Steps ── */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
                  {[
                    { step: 1, label: 'Business Info' },
                    { step: 2, label: 'Location & Category' },
                    { step: 3, label: 'Review' },
                  ].map(({ step, label }) => (
                    <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: currentStep >= step ? 'white' : 'rgba(255,255,255,0.2)',
                        color: currentStep >= step ? '#667eea' : 'white',
                        fontWeight: 700, transition: 'all 0.3s ease',
                        boxShadow: currentStep >= step ? '0 4px 20px rgba(255,255,255,0.3)' : 'none',
                      }}>
                        {currentStep > step ? <CheckCircleIcon sx={{ fontSize: 24 }} /> : step}
                      </Box>
                      {!isMobile && (
                        <Typography sx={{
                          color: currentStep >= step ? 'white' : 'rgba(255,255,255,0.6)',
                          fontWeight: currentStep >= step ? 600 : 400, fontSize: '0.9rem',
                        }}>
                          {label}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>

                {/* ── Main Form ── */}
                <Grid container spacing={4} position="relative" zIndex={1}>
                  <Grid item xs={12} md={8}>
                    <Paper elevation={24} sx={{
                      p: { xs: 3, md: 5 }, borderRadius: 4,
                      background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
                    }}>
                      <form onSubmit={handleSubmit}>

                        {/* ════════════════════════════════════════
                            STEP 1 — Business Information
                        ════════════════════════════════════════ */}
                        {currentStep === 1 && (
                          <Fade in timeout={600}>
                            <Box>
                              <Typography variant="h5" gutterBottom sx={{
                                fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1,
                              }}>
                                <BusinessIcon color="primary" />
                                <Trans id="Business Information" />
                              </Typography>

                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="First Name" name="firstName"
                                    value={formData.firstName} onChange={handleInputChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="Last Name" name="lastName"
                                    value={formData.lastName} onChange={handleInputChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="Business Name" name="businessName"
                                    value={formData.businessName} onChange={handleInputChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth label="Email Address" name="email" type="email"
                                    value={formData.email} onChange={handleInputChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="Mobile Number" name="mobile"
                                    value={formData.mobile} onChange={handleInputChange}
                                    placeholder="+91 XXXXX XXXXX" disabled
                                    helperText="Verified mobile number from signup"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }}
                                    sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0,0,0,0.87)' } }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth label="WhatsApp Number" name="whatsapp"
                                    value={formData.whatsapp} onChange={handleInputChange}
                                    placeholder="+91 XXXXX XXXXX" disabled={whatsappSameAsMobile}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><WhatsAppIcon color="action" /></InputAdornment> }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel
                                    control={<Checkbox checked={whatsappSameAsMobile} onChange={handleWhatsappCheckbox} color="primary" />}
                                    label="WhatsApp number is same as mobile number"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </Fade>
                        )}

                        {/* ════════════════════════════════════════
                            STEP 2 — Location & Business Category
                        ════════════════════════════════════════ */}
                        {currentStep === 2 && (
                          <Fade in timeout={600}>
                            <Box>
                              <Typography variant="h5" gutterBottom sx={{
                                fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1,
                              }}>
                                <LocationIcon color="primary" />
                                <Trans id="Business Location & Category" />
                              </Typography>

                              <Grid container spacing={3}>

                                {/* ── Business Categories (dynamic from menu, stored as CSV) ── */}
                                <Grid item xs={12}>
                                  <Autocomplete
                                    multiple
                                    id="businessCategory"
                                    // Options come from the LayoutDocument menu root categories
                                    options={rootCategories}
                                    // Autocomplete UI works with string[]
                                    value={selectedCategoryArray}
                                    onChange={handleCategoryChange}
                                    disableCloseOnSelect
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        required
                                        label="Business Categories"
                                        placeholder={rootCategories.length ? 'Select categories...' : 'Loading categories...'}
                                        helperText="Select one or more categories that describe your business"
                                      />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                      value.map((option, index) => (
                                        <Chip
                                          label={option}
                                          {...getTagProps({ index })}
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          key={option}
                                        />
                                      ))
                                    }
                                    renderOption={(props, option, { selected }) => (
                                      <li {...props} key={option}>
                                        <Checkbox checked={selected} sx={{ marginRight: 1 }} />
                                        <Typography variant="body2">{option}</Typography>
                                      </li>
                                    )}
                                    // Show loading state while menu is not yet available
                                    loading={rootCategories.length === 0}
                                    loadingText="Loading categories..."
                                    noOptionsText="No categories available"
                                    sx={{ '& .MuiAutocomplete-tag': { borderColor: 'primary.main', color: 'primary.main' } }}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                                    Address Details
                                  </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="Pincode" name="pincode"
                                    value={formData.pincode} onChange={handleInputChange}
                                    inputProps={{ maxLength: 6 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth label="Plot No. / Building No." name="plotNumber"
                                    value={formData.plotNumber} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth label="Building Name / Complex / Society" name="buildingName"
                                    value={formData.buildingName} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth label="Street / Road Name" name="streetName"
                                    value={formData.streetName} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth label="Landmark" name="landmark"
                                    value={formData.landmark} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth label="Area / Locality (This field is displayed on categories, so please format it like “Vashi – Navi Mumbai.”)" name="area"
                                    value={formData.area} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required label="City" name="city"
                                    value={formData.city} onChange={handleInputChange}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth required select label="State" name="state"
                                    value={formData.state} onChange={handleInputChange}
                                  >
                                    {indianStates.map((state) => (
                                      <MenuItem key={state} value={state}>{state}</MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                              </Grid>
                            </Box>
                          </Fade>
                        )}

                        {/* ════════════════════════════════════════
                            STEP 3 — Review & Set Password
                        ════════════════════════════════════════ */}
                        {currentStep === 3 && (
                          <Fade in timeout={600}>
                            <Box>
                              <Typography variant="h5" gutterBottom sx={{
                                fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1,
                              }}>
                                <CheckCircleIcon color="primary" />
                                <Trans id="Review & Set Password" />
                              </Typography>

                              {/* Password Section */}
                              <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                  <LockIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                                  Set Your Account Password
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                                  Create a secure password for your business account
                                </Typography>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth required label="Password" name="password"
                                      type={showPassword ? 'text' : 'password'}
                                      value={formData.password} onChange={handleInputChange}
                                      helperText="Minimum 8 characters"
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                              {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth required label="Confirm Password" name="confirmPassword"
                                      type={showConfirmPassword ? 'text' : 'password'}
                                      value={formData.confirmPassword} onChange={handleInputChange}
                                      error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                                      helperText={
                                        formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                                          ? 'Passwords do not match'
                                          : ''
                                      }
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>

                              {/* Review Summary */}
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Review Your Information
                              </Typography>

                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Personal Details
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                                  <Typography variant="body1" fontWeight={600}>
                                    {formData.firstName} {formData.lastName}
                                  </Typography>
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Business Details
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                                  <Typography variant="body1" fontWeight={600}>{formData.businessName}</Typography>
                                  {formData.email && (
                                    <Typography variant="body2" color="text.secondary">{formData.email}</Typography>
                                  )}
                                  <Typography variant="body2" color="text.secondary">
                                    Mobile: {formData.mobile}
                                  </Typography>
                                  {formData.whatsapp && (
                                    <Typography variant="body2" color="text.secondary">
                                      WhatsApp: {formData.whatsapp}
                                    </Typography>
                                  )}
                                  {/* Display comma-separated categories as chips */}
                                  {selectedCategoryArray.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                      {selectedCategoryArray.map((category) => (
                                        <Chip
                                          key={category} label={category}
                                          size="small" variant="outlined" color="primary"
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Business Address
                                </Typography>
                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                  <Typography variant="body2">
                                    {[
                                      formData.plotNumber, formData.buildingName,
                                      formData.streetName, formData.landmark,
                                      formData.area, formData.city,
                                      formData.state, formData.pincode,
                                    ].filter(Boolean).join(', ')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Fade>
                        )}

                        {/* ── Navigation Buttons ── */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                          {currentStep > 1 && (
                            <Button variant="outlined" onClick={handlePrevStep} sx={{ minWidth: 120 }}>
                              <Trans id="Back" />
                            </Button>
                          )}

                          {/* Save Progress — steps 1 and 2 only */}
                          {/* {currentStep < 3 && (
                            <Button
                              variant="outlined" onClick={handleSave} disabled={isSaving}
                              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                              sx={{ minWidth: 120, ...(currentStep === 1 && { ml: 'auto' }) }}
                            >
                              {isSaving ? <Trans id="Saving..." /> : <Trans id="Save Progress" />}
                            </Button>
                          )} */}

                          {currentStep < 3 ? (
                            <Button
                              variant="contained" onClick={handleNextStep} disabled={!isStepValid()}
                              sx={{
                                minWidth: 120,
                                ...(currentStep > 1 && { ml: 'auto' }),
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' },
                              }}
                            >
                              <Trans id="Next" />
                            </Button>
                          ) : (
                            <Button
                              type="submit" variant="contained" disabled={isSubmitting}
                              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                              sx={{
                                minWidth: 120, ml: 'auto',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' },
                              }}
                            >
                              {isSubmitting ? <Trans id="Submitting..." /> : <Trans id="Submit Registration" />}
                            </Button>
                          )}
                        </Box>
                      </form>
                    </Paper>
                  </Grid>

                  {/* ── Preview Sidebar ── */}
                  <Grid item xs={12} md={4}>
                    <Paper elevation={24} sx={{
                      p: 3, borderRadius: 4,
                      background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
                      position: 'sticky', top: 20,
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        <Trans id="Preview" />
                      </Typography>

                      <Box sx={{
                        p: 2, borderRadius: 2,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white', mb: 2, minHeight: 120,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <StoreIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                      </Box>

                      <Typography variant="h6" gutterBottom fontWeight={700}>
                        {formData.businessName || 'Your Business Name'}
                      </Typography>

                      {(formData.firstName || formData.lastName) && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Owner: {formData.firstName} {formData.lastName}
                        </Typography>
                      )}

                      {/* Show selected categories from comma-separated string */}
                      {selectedCategoryArray.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {selectedCategoryArray.map((category) => (
                            <Chip
                              key={category} label={category}
                              size="small" variant="outlined" color="primary"
                            />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          CONTACT
                        </Typography>
                        {formData.email && (
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{formData.email}</Typography>
                        )}
                        <Typography variant="body2">Mobile: {formData.mobile || '+91 XXXXX XXXXX'}</Typography>
                        {formData.whatsapp && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />
                            {formData.whatsapp}
                          </Typography>
                        )}
                        {(formData.city || formData.state) && (
                          <>
                            <Typography variant="caption" color="text.secondary" display="block" mt={2} mb={1}>
                              LOCATION
                            </Typography>
                            <Typography variant="body2">
                              {[formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          </Container>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </>
  )
}

SellerProfileRegistrationPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default SellerProfileRegistrationPage

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
      up: { href: '/', title: i18n._('Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}