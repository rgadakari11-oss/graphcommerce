import { useQuery } from '@graphcommerce/graphql'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { Row } from '@graphcommerce/next-ui'
import { Box, Grid, LinearProgress, Typography } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import React from 'react'
import { ProductReviews, ProductReviewsProps } from '@graphcommerce/magento-review'

type ReviewsProps = ProductReviewsProps & { title: React.ReactNode }

export function Reviews(props: ReviewsProps) {
  const { title, reviews, review_count } = props
  const { data, loading } = useQuery(StoreConfigDocument)

  if (!reviews || loading) return null
  if (!data?.storeConfig?.product_reviews_enabled) return null

  const ratingSummary = [
    { label: 'Five', value: 80 },
    { label: 'Four', value: 65 },
    { label: 'Three', value: 10 },
    { label: 'Two', value: 5 },
    { label: 'One', value: 2 },
  ]

  return (
    <Row maxWidth="lg" id="reviews">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          {title}
        </Typography>

        {/* Rating Summary */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            {ratingSummary.map((r) => (
              <Box
                key={r.label}
                display="flex"
                alignItems="center"
                gap={2}
                mb={1.5}
              >
                <Typography width={60}>{r.label}</Typography>
                <StarIcon color="warning" fontSize="small" />
                <LinearProgress
                  variant="determinate"
                  value={r.value}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: '#FFF3CD',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#FFC107',
                    },
                  }}
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                backgroundColor: '#FFFBEA',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" fontWeight={700} color="warning.main">
                4.3
              </Typography>
              <Box display="flex" justifyContent="center" gap={0.5} my={1}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} color="warning" />
                ))}
              </Box>
              <Typography>{review_count} Ratings</Typography>
            </Box>
          </Grid>
        </Grid>

        <ProductReviews {...props} />
      </Box>
    </Row>
  )
}
