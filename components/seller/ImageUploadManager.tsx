import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  Avatar,
  IconButton,
  Stack,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Star,
  StarBorder,
  DragIndicator,
  SwapHoriz,
  ArrowBack,
  Info,
  Image as ImageIcon,
} from '@mui/icons-material'

interface ImageData {
  url: string
  file?: File
  isCover?: boolean
}

interface ImageUploadManagerProps {
  images: ImageData[]
  setImages: (images: ImageData[]) => void
  errors: { images: boolean }
  setErrors: (errors: any) => void
  setSnackbar: (snackbar: any) => void
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  images,
  setImages,
  errors,
  setErrors,
  setSnackbar,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

  // Set cover image
  const setCoverImage = (index: number) => {
    const newImages = [...images]
    newImages.forEach(img => img.isCover = false)
    newImages[index].isCover = true

    const [coverImage] = newImages.splice(index, 1)
    newImages.unshift(coverImage)

    setImages(newImages)

    setSnackbar({
      open: true,
      message: 'Cover image updated successfully',
      severity: 'success',
    })
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    newImages.forEach((img, idx) => img.isCover = idx === 0)

    setImages(newImages)
    setDraggedIndex(null)

    setSnackbar({
      open: true,
      message: 'Image order updated',
      severity: 'success',
    })
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Move image up in order
  const moveImageUp = (index: number) => {
    if (index === 0) return

    const newImages = [...images]
    const temp = newImages[index - 1]
    newImages[index - 1] = newImages[index]
    newImages[index] = temp

    newImages.forEach((img, idx) => img.isCover = idx === 0)

    setImages(newImages)
  }

  // Move image down in order
  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return

    const newImages = [...images]
    const temp = newImages[index + 1]
    newImages[index + 1] = newImages[index]
    newImages[index] = temp

    newImages.forEach((img, idx) => img.isCover = idx === 0)

    setImages(newImages)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const maxSize = 1024 * 1024 // 500 KB in bytes
      const validFiles: ImageData[] = []
      const invalidFiles: string[] = []

      Array.from(files).forEach((file) => {
        if (file.size <= maxSize) {
          validFiles.push({
            url: URL.createObjectURL(file),
            file: file,
            isCover: images.length === 0 && validFiles.length === 0,
          })
        } else {
          invalidFiles.push(file.name)
        }
      })

      if (validFiles.length > 0) {
        setImages([...images, ...validFiles])
        if (errors.images) {
          setErrors((prev: any) => ({ ...prev, images: false }))
        }
      }

      if (invalidFiles.length > 0) {
        setSnackbar({
          open: true,
          message: `The following image(s) exceed 500 KB and were not uploaded: ${invalidFiles.join(', ')}`,
          severity: 'error',
        })
      }
    }
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)

    if (images[index].isCover && newImages.length > 0) {
      newImages[0].isCover = true
    }

    setImages(newImages)
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ImageIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
        Product Media *
      </Typography>

      {/* Upload Zone */}
      <Box
        sx={{
          border: errors.images ? '2px dashed #ef4444' : '2px dashed #cbd5e1',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: errors.images ? '#fef2f2' : '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s',
          mb: 2,
          '&:hover': {
            borderColor: errors.images ? '#ef4444' : '#3b82f6',
            bgcolor: errors.images ? '#fef2f2' : '#eff6ff',
          },
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input type="file" id="file-input" multiple accept="image/*" hidden onChange={handleImageUpload} />
        <Avatar sx={{ width: 48, height: 48, bgcolor: errors.images ? '#fee2e2' : '#dbeafe', mx: 'auto', mb: 1.5 }}>
          <CloudUpload sx={{ fontSize: 24, color: errors.images ? '#ef4444' : '#3b82f6' }} />
        </Avatar>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Upload Product Images
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Drag & drop or click to browse • PNG, JPG
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Recommended: 500×500 pixels • Max file size: 1 MB per image
        </Typography>
      </Box>

      {errors.images && (
        <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>
            Please upload at least one product image
          </Typography>
        </Alert>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <Alert severity="info" icon={<Info />} sx={{ mb: 2, py: 1 }}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
            Image Management Tips:
          </Typography>
          <Typography variant="caption" component="div" sx={{ fontSize: '0.7rem' }}>
            • Click the <Star sx={{ fontSize: 12, verticalAlign: 'middle', mx: 0.3 }} /> icon to set as cover image
          </Typography>
          <Typography variant="caption" component="div" sx={{ fontSize: '0.7rem' }}>
            • Drag images to reorder them
          </Typography>
          <Typography variant="caption" component="div" sx={{ fontSize: '0.7rem' }}>
            • First image is always shown as the main product image
          </Typography>
        </Alert>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <Grid container spacing={1.5}>
          {images.map((img, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <Card
                elevation={0}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  border: img.isCover || index === 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  cursor: 'grab',
                  transition: 'all 0.2s',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transform: draggedIndex === index ? 'scale(0.95)' : 'scale(1)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                {/* Drag Handle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    zIndex: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    borderRadius: 1,
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                  }}
                >
                  <DragIndicator sx={{ fontSize: 16, color: 'white' }} />
                </Box>

                {/* Image */}
                <Box sx={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
                  <img
                    src={img.url}
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

                {/* Action Buttons */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    zIndex: 2,
                  }}
                >
                  {/* Set as Cover Button */}
                  <Tooltip title={img.isCover || index === 0 ? "Cover Image" : "Set as Cover"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!img.isCover && index !== 0) {
                          setCoverImage(index)
                        }
                      }}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: img.isCover || index === 0 ? '#fbbf24' : 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.9)',
                        },
                      }}
                    >
                      {img.isCover || index === 0 ? (
                        <Star sx={{ fontSize: 16 }} />
                      ) : (
                        <StarBorder sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* Delete Button */}
                  <Tooltip title="Remove Image">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      sx={{
                        bgcolor: 'rgba(220, 38, 38, 0.9)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(185, 28, 28, 1)',
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Order Indicators */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    zIndex: 2,
                  }}
                >
                  {/* Move Up */}
                  {index > 0 && (
                    <Tooltip title="Move Left">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImageUp(index)
                        }}
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          width: 24,
                          height: 24,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                        }}
                      >
                        <ArrowBack sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <Tooltip title="Move Right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImageDown(index)
                        }}
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          width: 24,
                          height: 24,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                        }}
                      >
                        <SwapHoriz sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* Cover Badge */}
                {(img.isCover || index === 0) && (
                  <Chip
                    label="Cover Photo"
                    size="small"
                    icon={<Star sx={{ fontSize: 14, color: 'white !important' }} />}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      bgcolor: '#3b82f6',
                      color: 'white',
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                )}

                {/* Position Number */}
                <Chip
                  label={`#${index + 1}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: 32,
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}