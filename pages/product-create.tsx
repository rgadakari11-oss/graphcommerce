import type { PageOptions } from '@graphcommerce/framer-next-pages'
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
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Add,
  PlayArrow,
  PictureAsPdf,
  Image as ImageIcon,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Info,
  TrendingUp,
  Inventory,
  Description,
  LocalShipping,
  Category,
  AddCircleOutline,
  ExpandMore,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { cacheFirst } from '@graphcommerce/graphql'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function ProductCreateaddPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    specialPrice: '',
    specialPriceFrom: '',
    specialPriceTo: '',
    unit: 'Piece',
    description: '',
    minOrderQty: '',
    productionCapacity: '',
    productCode: '',
    deliveryTime: '',
    packagingDetails: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [categoryRequestOpen, setCategoryRequestOpen] = useState(false)
  const [requestedCategory, setRequestedCategory] = useState('')

  // Mock category data - will be dynamic later
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

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setProductData({ ...productData, [field]: event.target.value as string })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleCategoryRequest = () => {
    // Will be implemented to send email later
    alert(`Category request submitted: ${requestedCategory}`)
    setCategoryRequestOpen(false)
    setRequestedCategory('')
  }

  // Completion tracking with points
  const scoreBreakdown = {
    productName: productData.name.split(' ').length >= 3 ? 15 : 0,
    category: selectedCategory ? 10 : 0,
    images: Math.min(images.length * 5, 20), // 5 points per image, max 20
    price: productData.price && productData.unit ? 10 : 0,
    description: productData.description.length > 100 ? 15 : 0,
    minOrderQty: productData.minOrderQty ? 5 : 0, // bonus
    deliveryTime: productData.deliveryTime ? 5 : 0, // bonus
  }

  const totalScore = Object.values(scoreBreakdown).reduce((acc, val) => acc + val, 0)
  const maxScore = 80 // 70 required + 10 bonus
  const completionPercentage = Math.round((totalScore / maxScore) * 100)

  const completionItems = [
    { label: 'Product Name', completed: productData.name.split(' ').length >= 3, required: true },
    { label: 'Product Images', completed: images.length > 0, required: true },
    { label: 'Category Selection', completed: !!selectedCategory, required: true },
    { label: 'Price & Unit', completed: productData.price && productData.unit, required: true },
    { label: 'Description', completed: productData.description.length > 100, required: true },
    { label: 'Min. Order Qty', completed: !!productData.minOrderQty, required: false },
    { label: 'Delivery Details', completed: !!productData.deliveryTime, required: false },
  ]

  return (
    <>
      <PageMeta title="Add New Product" metaRobots={['noindex']} />

      <Box sx={{ bgcolor: '#fafbfc', minHeight: '100vh', py: 5 }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Add Your Product
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Complete the form below to list your product. All fields marked with * are required.
            </Typography>
          </Box>

          {/* Progress Stepper */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 3,
              mb: 4,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: '#2563eb' },
                        '&.Mui-completed': { color: '#16a34a' },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Grid container spacing={3}>
            {/* Main Content Area */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  bgcolor: '#ffffff',
                }}
              >
                {/* Step 0: Product Details */}
                {activeStep === 0 && (
                  <Box sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      {/* Product Name */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Inventory sx={{ color: '#2563eb' }} />
                          Product Name *
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="Enter a descriptive product name (minimum 3 words)"
                          value={productData.name}
                          onChange={handleInputChange('name')}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Example: "Premium Cotton Casual T-Shirt for Men"
                        </Typography>
                      </Box>

                      {/* Media Upload */}
                      {/* Media Upload */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <ImageIcon sx={{ color: '#2563eb' }} />
                          Product Media *
                        </Typography>

                        {/* Upload Area */}
                        <Box
                          sx={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            mb: 3,
                            '&:hover': {
                              borderColor: '#2563eb',
                              bgcolor: '#eff6ff',
                            },
                          }}
                          onClick={() => document.getElementById('file-input')?.click()}
                        >
                          <input
                            type="file"
                            id="file-input"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                          />
                          <Avatar
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: '#dbeafe',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <CloudUpload sx={{ fontSize: 32, color: '#2563eb' }} />
                          </Avatar>
                          <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                            Upload Product Images
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Drag & drop or click to browse • PNG, JPG
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Recommended: 500×500 pixels • Max file size: 500 KB per image
                          </Typography>
                        </Box>

                        {/* Image Preview */}
                        {images.length > 0 && (
                          <Grid container spacing={2}>
                            {images.map((img, index) => (
                              <Grid item xs={6} sm={4} key={index}>
                                <Card
                                  elevation={0}
                                  sx={{
                                    position: 'relative',
                                    borderRadius: 2,
                                    border: index === 0 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      paddingTop: '100%',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <img
                                      src={img}
                                      alt={`Product ${index + 1}`}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  </Box>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                    }}
                                    onClick={() => removeImage(index)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  {index === 0 && (
                                    <Chip
                                      label="Cover Photo"
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 8,
                                        bgcolor: '#2563eb',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                      }}
                                    />
                                  )}
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                      {/* Pricing */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <TrendingUp sx={{ color: '#2563eb' }} />
                          Pricing Information *
                        </Typography>
                        <Stack spacing={3}>
                          {/* Regular Price */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                              Regular Price
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={7}>
                                <TextField
                                  fullWidth
                                  label="Price"
                                  placeholder="0.00"
                                  value={productData.price}
                                  onChange={handleInputChange('price')}
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={5}>
                                <FormControl fullWidth>
                                  <InputLabel>Unit</InputLabel>
                                  <Select
                                    value={productData.unit}
                                    label="Unit"
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <MenuItem value="Piece">Piece</MenuItem>
                                    <MenuItem value="Kg">Kilogram</MenuItem>
                                    <MenuItem value="Liter">Liter</MenuItem>
                                    <MenuItem value="Carton">Carton</MenuItem>
                                    <MenuItem value="Box">Box</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Special Price */}
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                              Special Price (Optional)
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Special Price"
                                  placeholder="0.00"
                                  value={productData.specialPrice}
                                  onChange={handleInputChange('specialPrice')}
                                  type="number"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    },
                                  }}
                                  helperText="Offer a discounted price for a limited time"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Special Price From"
                                  placeholder="DD/MM/YYYY"
                                  value={productData.specialPriceFrom}
                                  onChange={handleInputChange('specialPriceFrom')}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    },
                                  }}
                                  helperText="Start date for special price"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Special Price To"
                                  placeholder="DD/MM/YYYY"
                                  value={productData.specialPriceTo}
                                  onChange={handleInputChange('specialPriceTo')}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    },
                                  }}
                                  helperText="End date for special price"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Category Selection */}
                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Category sx={{ color: '#2563eb' }} />
                            Product Category *
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => setCategoryRequestOpen(true)}
                            sx={{
                              textTransform: 'none',
                              color: '#2563eb',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: 'transparent',
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            Add Category
                          </Button>
                        </Stack>
                        <Stack spacing={2}>
                          <FormControl fullWidth>
                            <InputLabel>Main Category</InputLabel>
                            <Select
                              value={selectedCategory}
                              onChange={(e) => {
                                setSelectedCategory(e.target.value)
                                setSelectedSubCategory('')
                              }}
                              label="Main Category"
                              sx={{ borderRadius: 2 }}
                            >
                              {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {selectedCategory && (
                            <FormControl fullWidth>
                              <InputLabel>Sub Category</InputLabel>
                              <Select
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                label="Sub Category"
                                sx={{ borderRadius: 2 }}
                              >
                                {categories
                                  .find((cat) => cat.id === selectedCategory)
                                  ?.subCategories.map((subCat) => (
                                    <MenuItem key={subCat.id} value={subCat.id}>
                                      {subCat.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          )}

                          <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                            Can't find your category?{' '}
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontWeight: 600,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                              onClick={() => setCategoryRequestOpen(true)}
                            >
                              Request to add new category
                            </Typography>
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Description */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Description sx={{ color: '#2563eb' }} />
                          Product Description *
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="Provide a detailed description including features, benefits, materials, and use cases..."
                          value={productData.description}
                          onChange={handleInputChange('description')}
                          multiline
                          rows={6}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Minimum 100 characters recommended
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: productData.description.length > 100 ? '#16a34a' : '#64748b',
                              fontWeight: 500,
                            }}
                          >
                            {productData.description.length} / 4000
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Step 1: Specifications */}
                {activeStep === 1 && (
                  <Box sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <Alert severity="info" icon={<Info />}>
                        Additional details help buyers make informed decisions and improve your product ranking
                      </Alert>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Minimum Order Quantity"
                            placeholder="e.g., 50"
                            value={productData.minOrderQty}
                            onChange={handleInputChange('minOrderQty')}
                            type="number"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">{productData.unit}</InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Production Capacity"
                            placeholder="e.g., 5000 units/month"
                            value={productData.productionCapacity}
                            onChange={handleInputChange('productionCapacity')}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Product Code / SKU"
                        placeholder="Your internal reference code"
                        value={productData.productCode}
                        onChange={handleInputChange('productCode')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <LocalShipping sx={{ color: '#2563eb' }} />
                          Shipping & Delivery
                        </Typography>
                        <Stack spacing={3}>
                          <TextField
                            fullWidth
                            label="Estimated Delivery Time"
                            placeholder="e.g., 5-7 business days"
                            value={productData.deliveryTime}
                            onChange={handleInputChange('deliveryTime')}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Packaging Details"
                            placeholder="Describe packaging materials, dimensions, and protection measures..."
                            value={productData.packagingDetails}
                            onChange={handleInputChange('packagingDetails')}
                            multiline
                            rows={4}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Step 2: Review */}
                {activeStep === 2 && (
                  <Box sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                      Review Your Product
                    </Typography>

                    <Stack spacing={3}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Product Name
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {productData.name || 'Not provided'}
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Category
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedCategory
                              ? `${categories.find((c) => c.id === selectedCategory)?.name}${selectedSubCategory
                                ? ` > ${categories
                                  .find((c) => c.id === selectedCategory)
                                  ?.subCategories.find((s) => s.id === selectedSubCategory)?.name
                                }`
                                : ''
                              }`
                              : 'Not selected'}
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Pricing
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body1" fontWeight={600}>
                              ₹{productData.price || '0'} / {productData.unit}
                            </Typography>
                            {productData.specialPrice && (
                              <Box>
                                <Chip
                                  label={`Special Price: ₹${productData.specialPrice}`}
                                  size="small"
                                  sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600 }}
                                />
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
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Images
                          </Typography>
                          <Typography variant="body1">
                            {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                          </Typography>
                        </CardContent>
                      </Card>

                      {productData.description && (
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                              Description
                            </Typography>
                            <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto' }}>
                              {productData.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}

                      <Alert severity="success">
                        Your product is ready to publish! Click "Publish Product" below to make it live.
                      </Alert>
                    </Stack>
                  </Box>
                )}

                {/* Navigation Buttons */}
                <Divider />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: '#fafbfc' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                    }}
                  >
                    Back
                  </Button>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        borderColor: '#cbd5e1',
                        color: '#475569',
                      }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (activeStep === steps.length - 1) {
                          alert('Product published successfully!')
                        } else {
                          handleNext()
                        }
                      }}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        bgcolor: '#2563eb',
                        '&:hover': { bgcolor: '#1d4ed8' },
                      }}
                    >
                      {activeStep === steps.length - 1 ? 'Publish Product' : 'Continue'}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar - Progress Tracker */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  p: 3,
                  position: 'sticky',
                  top: 24,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Product Quality Score
                </Typography>

                {/* Circular Progress */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      border: '8px solid',
                      borderColor:
                        completionPercentage === 100
                          ? '#16a34a'
                          : completionPercentage >= 50
                            ? '#f59e0b'
                            : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        background:
                          completionPercentage === 100
                            ? 'conic-gradient(#16a34a 100%, #e2e8f0 0)'
                            : `conic-gradient(${completionPercentage >= 50 ? '#f59e0b' : '#e2e8f0'
                            } ${completionPercentage}%, #e2e8f0 0)`,
                        mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), white 0)',
                      },
                    }}
                  >
                    <Typography variant="h4" fontWeight={800}>
                      {completionPercentage}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {completionPercentage === 100
                      ? 'Excellent!'
                      : completionPercentage >= 75
                        ? 'Good Progress'
                        : completionPercentage >= 50
                          ? 'Almost There'
                          : 'Keep Going'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completionPercentage === 100
                      ? 'Your product is fully optimized'
                      : 'Complete all fields for best visibility'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Score Breakdown */}
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0f172a' }}>
                  How to Improve Your Score
                </Typography>

                <Stack spacing={2.5}>
                  {/* Product Name */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {productData.name.split(' ').length >= 3 ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          Product Name
                        </Typography>
                      </Stack>
                      <Chip
                        label={productData.name.split(' ').length >= 3 ? '15/15' : '0/15'}
                        size="small"
                        sx={{
                          bgcolor: productData.name.split(' ').length >= 3 ? '#dcfce7' : '#fee2e2',
                          color: productData.name.split(' ').length >= 3 ? '#16a34a' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.5 }}>
                      Use at least 3 words with product type, material & purpose
                    </Typography>
                    {productData.name.split(' ').length < 3 && (
                      <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.75rem' }}>
                        <Typography variant="caption">
                          <strong>Example:</strong> "Premium Cotton T-Shirt for Men"
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  {/* Category */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {selectedCategory ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          Category
                        </Typography>
                      </Stack>
                      <Chip
                        label={selectedCategory ? '10/10' : '0/10'}
                        size="small"
                        sx={{
                          bgcolor: selectedCategory ? '#dcfce7' : '#fee2e2',
                          color: selectedCategory ? '#16a34a' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.5 }}>
                      Select the most relevant category for your product
                    </Typography>
                  </Box>

                  {/* Product Images */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {images.length >= 3 ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          Product Images
                        </Typography>
                      </Stack>
                      <Chip
                        label={`${Math.min(images.length * 5, 20)}/20`}
                        size="small"
                        sx={{
                          bgcolor: images.length >= 3 ? '#dcfce7' : images.length > 0 ? '#fef3c7' : '#fee2e2',
                          color: images.length >= 3 ? '#16a34a' : images.length > 0 ? '#f59e0b' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.5 }}>
                      Upload at least 3-5 high-quality images (+5 points each, max 20)
                    </Typography>
                    {images.length < 3 && (
                      <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.75rem' }}>
                        <Typography variant="caption">
                          <strong>Tip:</strong> Show product from different angles
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  {/* Price */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {productData.price && productData.unit ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          Price & Unit
                        </Typography>
                      </Stack>
                      <Chip
                        label={productData.price && productData.unit ? '10/10' : '0/10'}
                        size="small"
                        sx={{
                          bgcolor: productData.price && productData.unit ? '#dcfce7' : '#fee2e2',
                          color: productData.price && productData.unit ? '#16a34a' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.5 }}>
                      Add competitive pricing with correct unit
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {productData.description.length > 100 ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          Description
                        </Typography>
                      </Stack>
                      <Chip
                        label={productData.description.length > 100 ? '15/15' : '0/15'}
                        size="small"
                        sx={{
                          bgcolor: productData.description.length > 100 ? '#dcfce7' : '#fee2e2',
                          color: productData.description.length > 100 ? '#16a34a' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.5 }}>
                      Write detailed description (minimum 100 characters)
                    </Typography>
                    {productData.description.length <= 100 && (
                      <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.75rem' }}>
                        <Typography variant="caption">
                          Include features, benefits, materials & uses
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  <Divider />

                  {/* Optional Fields */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                    Bonus Points (Optional)
                  </Typography>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {productData.minOrderQty ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                          Min. Order Quantity
                        </Typography>
                      </Stack>
                      <Chip
                        label={productData.minOrderQty ? '+5' : '+0'}
                        size="small"
                        sx={{
                          bgcolor: productData.minOrderQty ? '#dcfce7' : '#f1f5f9',
                          color: productData.minOrderQty ? '#16a34a' : '#64748b',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {productData.deliveryTime ? (
                          <CheckCircleOutline sx={{ color: '#16a34a', fontSize: 18 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                          Delivery Details
                        </Typography>
                      </Stack>
                      <Chip
                        label={productData.deliveryTime ? '+5' : '+0'}
                        size="small"
                        sx={{
                          bgcolor: productData.deliveryTime ? '#dcfce7' : '#f1f5f9',
                          color: productData.deliveryTime ? '#16a34a' : '#64748b',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Alert
                  severity={completionPercentage >= 75 ? "success" : "warning"}
                  icon={completionPercentage >= 75 ? <CheckCircleOutline /> : <Info />}
                  sx={{ fontSize: '0.75rem' }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {completionPercentage >= 75
                      ? 'Great! Products with 75%+ score get 5x more views'
                      : 'Products with complete info get 5x more inquiries'}
                  </Typography>
                </Alert>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Request Dialog */}
          <Dialog
            open={categoryRequestOpen}
            onClose={() => setCategoryRequestOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Request New Category
              </Typography>
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                helperText="Please provide as much detail as possible about the category"
              />

              <Alert severity="info" icon={<Info />} sx={{ fontSize: '0.875rem' }}>
                Your request will be sent to our admin team for review. We typically add new categories
                within 24-48 hours.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setCategoryRequestOpen(false)
                  setRequestedCategory('')
                }}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCategoryRequest}
                disabled={!requestedCategory.trim()}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  )
}

ProductCreateaddPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default ProductCreateaddPage

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