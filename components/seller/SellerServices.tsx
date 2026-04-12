import {
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface SellerServicesProps {
  products: any[]
}

export default function SellerServices({ products }: SellerServicesProps) {
  if (!products || products.length === 0) return null

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CategoryOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          Products & Services
        </Typography>
        <Chip
          label={`${products.length} items`}
          size="small"
          sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Grid container spacing={2.5}>
        {products.map((product) => {
          const price =
            product?.price_range?.minimum_price?.regular_price?.value

          return (
            <Grid item xs={12} sm={6} md={4} key={product.uid}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 16px rgba(25,118,210,0.10)',
                  },
                }}
              >
                {/* IMAGE */}
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: '#f8f9fa',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={
                      product?.small_image?.url ||
                      '/images/placeholder-product.png'
                    }
                    alt={product?.name || 'Product'}
                    sx={{ objectFit: 'contain', p: 1.5 }}
                  />
                  {product?.categories?.length > 0 && (
                    <Chip
                      label={product.categories[0].name}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        height: 20,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </Box>

                {/* CONTENT */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    '&:last-child': { pb: 2 },
                  }}
                >
                  <Typography
                    component="a"
                    href={`/${product.url_key}.html`}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.5em',
                      color: 'text.primary',
                      textDecoration: 'none',
                      mb: 1,
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </Typography>

                  {product.location && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.3 }}
                    >
                      📍 {product.location}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {price ? (
                      <Typography
                        fontWeight={700}
                        color="primary.main"
                        sx={{ fontSize: '0.95rem' }}
                      >
                        ₹{price.toLocaleString('en-IN')}
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        Price on request
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        px: 1.5,
                        height: 30,
                      }}
                      onClick={() =>
                        console.log('Get best price for', product.name)
                      }
                    >
                      Get Price
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}