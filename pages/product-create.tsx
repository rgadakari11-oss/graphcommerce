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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Add,
  PlayArrow,
  PictureAsPdf,
  Image as ImageIcon,
  Lightbulb,
  CheckCircle,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { cacheFirst } from '@graphcommerce/graphql'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function ProductCreatePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    unit: 'Piece',
    description: '',
    minOrderQty: '',
    productionCapacity: '',
    productCode: '',
    deliveryTime: '',
    packagingDetails: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [productScore, setProductScore] = useState(20)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
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

  const scoreItems = [
    { label: 'Name (>=3 Words)', score: productData.name.split(' ').length >= 3 ? 10 : 0, max: 10 },
    { label: 'Primary Photo', score: images.length > 0 ? 10 : 0, max: 10 },
    { label: '2 or More Photos', score: images.length >= 2 ? 10 : 0, max: 10 },
    { label: 'Price (with Unit)', score: productData.price && productData.unit ? 20 : 0, max: 20 },
    { label: 'Description (>100 chars)', score: productData.description.length > 100 ? 5 : 0, max: 5 },
  ]

  const calculatedScore = scoreItems.reduce((acc, item) => acc + item.score, 0)

  React.useEffect(() => {
    setProductScore(calculatedScore)
  }, [calculatedScore])

  return (
    <>
      <PageMeta title="Create Product" metaRobots={['noindex']} />

      <Box sx={{
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        py: 4,
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 1,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Create New Product
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Fill in the details below to add your product to the marketplace
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} lg={9}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                }}
              >
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                      px: 2,
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        minHeight: 64,
                      },
                      '& .Mui-selected': {
                        color: '#4f46e5',
                      },
                    }}
                  >
                    <Tab label="Basic Details" />
                    <Tab label="Specification/Additional Details" />
                  </Tabs>
                </Box>

                {/* Tab Panel 1: Basic Details */}
                <TabPanel value={activeTab} index={0}>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Image Upload Section */}
                      <Grid item xs={12} md={5}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Product Images
                        </Typography>

                        <Box
                          sx={{
                            border: '2px dashed #d1d5db',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: '#f9fafb',
                            mb: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: '#4f46e5',
                              bgcolor: '#eef2ff',
                            },
                          }}
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                          />
                          <CloudUpload sx={{ fontSize: 48, color: '#9ca3af', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Click to upload images
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            PNG, JPG up to 5MB
                          </Typography>
                        </Box>

                        {/* Image Preview Grid */}
                        {images.length > 0 && (
                          <Grid container spacing={1}>
                            {images.map((img, index) => (
                              <Grid item xs={4} key={index}>
                                <Box sx={{ position: 'relative' }}>
                                  <img
                                    src={img}
                                    alt={`Product ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 8,
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(0,0,0,0.6)',
                                      color: 'white',
                                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                    }}
                                    onClick={() => removeImage(index)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  {index === 0 && (
                                    <Chip
                                      label="Primary"
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        bottom: 4,
                                        left: 4,
                                        bgcolor: '#4f46e5',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        )}

                        {/* Video & PDF Upload */}
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<PlayArrow />}
                            fullWidth
                            sx={{
                              textTransform: 'none',
                              borderColor: '#d1d5db',
                              color: '#6b7280',
                            }}
                          >
                            Add Video
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PictureAsPdf />}
                            fullWidth
                            sx={{
                              textTransform: 'none',
                              borderColor: '#d1d5db',
                              color: '#6b7280',
                            }}
                          >
                            Add PDF
                          </Button>
                        </Stack>

                        <Alert
                          icon={<Lightbulb />}
                          severity="info"
                          sx={{ mt: 2, fontSize: '0.875rem' }}
                        >
                          High-quality images improve product visibility
                        </Alert>
                      </Grid>

                      {/* Product Details Section */}
                      <Grid item xs={12} md={7}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Product Information
                        </Typography>

                        <Stack spacing={3}>
                          <TextField
                            fullWidth
                            label="Product/Service Name"
                            placeholder="e.g., Premium Cotton T-Shirt"
                            value={productData.name}
                            onChange={handleInputChange('name')}
                            variant="outlined"
                            helperText="Use descriptive name with at least 3 words"
                          />

                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                              Price
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  placeholder="Enter price"
                                  value={productData.price}
                                  onChange={handleInputChange('price')}
                                  type="number"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <FormControl fullWidth>
                                  <Select
                                    value={productData.unit}
                                    onChange={handleInputChange('unit')}
                                  >
                                    <MenuItem value="Piece">Piece</MenuItem>
                                    <MenuItem value="Carton">Carton</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                    <MenuItem value="Kg">Kg</MenuItem>
                                    <MenuItem value="Liter">Liter</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Box>

                          <TextField
                            fullWidth
                            label="Product/Service Description"
                            placeholder="Uses, Details, Benefits, etc."
                            value={productData.description}
                            onChange={handleInputChange('description')}
                            multiline
                            rows={6}
                            helperText={`${productData.description.length} / 4000 characters (minimum 100 recommended)`}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                {/* Tab Panel 2: Additional Details */}
                <TabPanel value={activeTab} index={1}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Specifications
                    </Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Add specifications to help buyers understand your product better
                    </Alert>

                    <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 600 }}>
                      Additional Details
                    </Typography>

                    <Stack spacing={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Minimum Order Quantity"
                            placeholder="e.g., 100"
                            value={productData.minOrderQty}
                            onChange={handleInputChange('minOrderQty')}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {productData.unit}
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Production Capacity"
                            placeholder="e.g., 1000 pieces/month"
                            value={productData.productionCapacity}
                            onChange={handleInputChange('productionCapacity')}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Product/Service Code"
                        placeholder="Your internal product code"
                        value={productData.productCode}
                        onChange={handleInputChange('productCode')}
                      />

                      <TextField
                        fullWidth
                        label="Delivery Time"
                        placeholder="e.g., 7-10 business days"
                        value={productData.deliveryTime}
                        onChange={handleInputChange('deliveryTime')}
                      />

                      <TextField
                        fullWidth
                        label="Packaging Details"
                        placeholder="Describe how the product will be packaged"
                        value={productData.packagingDetails}
                        onChange={handleInputChange('packagingDetails')}
                        multiline
                        rows={4}
                      />
                    </Stack>
                  </Box>
                </TabPanel>

                {/* Action Buttons */}
                <Divider />
                <Box sx={{ p: 3, bgcolor: '#f9fafb', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      borderColor: '#d1d5db',
                      color: '#6b7280',
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      textTransform: 'none',
                      px: 4,
                      bgcolor: '#10b981',
                      '&:hover': { bgcolor: '#059669' },
                    }}
                    onClick={() => {
                      if (activeTab === 0) {
                        setActiveTab(1)
                      } else {
                        // Handle submit
                        alert('Product submitted successfully!')
                      }
                    }}
                  >
                    {activeTab === 0 ? 'Save and Continue →' : 'Finish'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar - Product Score */}
            <Grid item xs={12} lg={3}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  position: 'sticky',
                  top: 24,
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Product Score:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: productScore < 50 ? '#ef4444' : productScore < 80 ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {productScore >= 50 ? 'Good' : 'Low'}
                    </Typography>
                  </Stack>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: productScore < 50 ? '#fef2f2' : productScore < 80 ? '#fffbeb' : '#f0fdf4',
                        border: `3px solid ${productScore < 50 ? '#ef4444' : productScore < 80 ? '#f59e0b' : '#10b981'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="h5" fontWeight="700">
                        {productScore}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={productScore}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: productScore < 50 ? '#ef4444' : productScore < 80 ? '#f59e0b' : '#10b981',
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Basic details
                </Typography>
                <Stack spacing={1.5}>
                  {scoreItems.map((item, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {item.label}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: item.score === item.max ? '#10b981' : '#ef4444',
                          }}
                        >
                          {item.score}/{item.max}
                        </Typography>
                        {item.score === item.max && (
                          <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Specifications
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Config Specs.
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>
                      0/10
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      Other Specs (4 or More)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>
                      0/10
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

ProductCreatePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default ProductCreatePage

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