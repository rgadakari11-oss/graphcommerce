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
} from '@mui/material'

interface SellerServicesProps {
  products: any[]
}

export default function SellerServices({ products }: SellerServicesProps) {
  if (!products || products.length === 0) return null

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Products & Services
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => {
          const price =
            product?.price_range?.minimum_price?.regular_price?.value

          return (
            <Grid item xs={12} sm={6} md={4} key={product.uid}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                {/* ================= IMAGE ================= */}
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product?.small_image?.url ||
                    '/images/placeholder-product.png'
                  }
                  alt={product?.name || 'Product'}
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#fafafa',
                    p: 1,
                  }}
                />

                {/* ================= CONTENT ================= */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* ================= TOP ================= */}
                  <Box>
                    {/* Name + Price */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <Box flex={1}>
                        {/* Product Name (2 lines RESERVED) */}
                        <Typography
                          component="a"
                          href={`/${product.url_key}.html`}
                          fontWeight="semi-bold"
                          sx={{
                            minHeight: '2.6em', // 👈 reserves space for 2 lines
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: 'inherit',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          title={product.name}
                        >
                          {product.name}
                        </Typography>

                        {/* Category */}
                        {product?.categories?.length > 0 && (
                          <Chip
                            label={product.categories[0].name}
                            size="small"
                            variant="outlined"
                            sx={{
                              mt: 0.5,
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </Box>

                      {/* Price */}
                      {price && (
                        <Typography
                          fontWeight="semi-bold"
                          color="primary"
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          ₹ {price.toLocaleString('en-IN')}
                        </Typography>
                      )}
                    </Box>

                    {/* Location */}
                    {product.location && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        📍 {product.location}
                      </Typography>
                    )}
                  </Box>

                  {/* ================= CTA (BOTTOM) ================= */}
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        px: 2.5,
                      }}
                      onClick={() =>
                        console.log('Get best price for', product.name)
                      }
                    >
                      Get Best Price
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
