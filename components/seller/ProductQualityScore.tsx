import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip,
  Alert,
} from '@mui/material'
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  Info,
  Star,
} from '@mui/icons-material'

interface ImageData {
  url: string
  file?: File
  isCover?: boolean
}

interface ProductDataType {
  name: string
  price: string
  unit: string
  description: string
  minOrderQty: string
  deliveryTime: string
}

interface ProductQualityScoreProps {
  productData: ProductDataType
  selectedCategory: string
  images: ImageData[]
}

export const ProductQualityScore: React.FC<ProductQualityScoreProps> = ({
  productData,
  selectedCategory,
  images,
}) => {
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

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, p: 2.5, position: 'sticky', top: 24, border: '1px solid #e2e8f0' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1.125rem' }}>
        Product Quality Score
      </Typography>

      {/* Circular Progress */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '6px solid',
            borderColor: completionPercentage === 100 ? '#10b981' : completionPercentage >= 50 ? '#f59e0b' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              background: completionPercentage === 100
                ? 'conic-gradient(#10b981 100%, #e2e8f0 0)'
                : `conic-gradient(${completionPercentage >= 50 ? '#f59e0b' : '#e2e8f0'} ${completionPercentage}%, #e2e8f0 0)`,
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), white 0)',
            },
          }}
        >
          <Typography variant="h5" fontWeight={700}>{completionPercentage}%</Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          {completionPercentage === 100 ? 'Excellent!' : completionPercentage >= 75 ? 'Good Progress' : completionPercentage >= 50 ? 'Almost There' : 'Keep Going'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {completionPercentage === 100 ? 'Your product is fully optimized' : 'Complete all fields for best visibility'}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Score Breakdown */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
        How to Improve Your Score
      </Typography>

      <Stack spacing={2}>
        {/* Product Name */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {productData.name.split(' ').length >= 3 ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Product Name</Typography>
            </Stack>
            <Chip
              label={productData.name.split(' ').length >= 3 ? '15/15' : '0/15'}
              size="small"
              sx={{
                bgcolor: productData.name.split(' ').length >= 3 ? '#dcfce7' : '#fee2e2',
                color: productData.name.split(' ').length >= 3 ? '#10b981' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.4 }}>
            Use at least 3 words with product type, material & purpose
          </Typography>
          {productData.name.split(' ').length < 3 && (
            <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.7rem' }}>
              <Typography variant="caption"><strong>Example:</strong> "Premium Cotton T-Shirt for Men"</Typography>
            </Alert>
          )}
        </Box>

        {/* Category */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedCategory ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Category</Typography>
            </Stack>
            <Chip
              label={selectedCategory ? '10/10' : '0/10'}
              size="small"
              sx={{
                bgcolor: selectedCategory ? '#dcfce7' : '#fee2e2',
                color: selectedCategory ? '#10b981' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.4 }}>
            Select the most relevant category for your product
          </Typography>
        </Box>

        {/* Product Images */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {images.length >= 3 ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Product Images</Typography>
            </Stack>
            <Chip
              label={`${Math.min(images.length * 5, 20)}/20`}
              size="small"
              sx={{
                bgcolor: images.length >= 3 ? '#dcfce7' : images.length > 0 ? '#fef3c7' : '#fee2e2',
                color: images.length >= 3 ? '#10b981' : images.length > 0 ? '#f59e0b' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.4 }}>
            Upload at least 3-5 high-quality images (+5 points each, max 20)
          </Typography>
          {images.length < 3 && (
            <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.7rem' }}>
              <Typography variant="caption"><strong>Tip:</strong> Show product from different angles</Typography>
            </Alert>
          )}
        </Box>

        {/* Price */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {productData.price && productData.unit ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Price & Unit</Typography>
            </Stack>
            <Chip
              label={productData.price && productData.unit ? '10/10' : '0/10'}
              size="small"
              sx={{
                bgcolor: productData.price && productData.unit ? '#dcfce7' : '#fee2e2',
                color: productData.price && productData.unit ? '#10b981' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.4 }}>
            Add competitive pricing with correct unit
          </Typography>
        </Box>

        {/* Description */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {productData.description.length > 100 ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>Description</Typography>
            </Stack>
            <Chip
              label={productData.description.length > 100 ? '15/15' : '0/15'}
              size="small"
              sx={{
                bgcolor: productData.description.length > 100 ? '#dcfce7' : '#fee2e2',
                color: productData.description.length > 100 ? '#10b981' : '#ef4444',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3, lineHeight: 1.4 }}>
            Write detailed description (minimum 100 characters)
          </Typography>
          {productData.description.length <= 100 && (
            <Alert severity="info" sx={{ mt: 1, py: 0.5, fontSize: '0.7rem' }}>
              <Typography variant="caption">Include features, benefits, materials & uses</Typography>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Bonus Fields */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
          Bonus Points (Optional)
        </Typography>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              {productData.minOrderQty ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>Min. Order Quantity</Typography>
            </Stack>
            <Chip
              label={productData.minOrderQty ? '+5' : '+0'}
              size="small"
              sx={{
                bgcolor: productData.minOrderQty ? '#dcfce7' : '#f1f5f9',
                color: productData.minOrderQty ? '#10b981' : '#64748b',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              {productData.deliveryTime ? (
                <CheckCircleOutline sx={{ color: '#10b981', fontSize: 16 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#cbd5e1', fontSize: 16 }} />
              )}
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>Delivery Details</Typography>
            </Stack>
            <Chip
              label={productData.deliveryTime ? '+5' : '+0'}
              size="small"
              sx={{
                bgcolor: productData.deliveryTime ? '#dcfce7' : '#f1f5f9',
                color: productData.deliveryTime ? '#10b981' : '#64748b',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Alert
        severity={completionPercentage >= 75 ? 'success' : 'warning'}
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
  )
}