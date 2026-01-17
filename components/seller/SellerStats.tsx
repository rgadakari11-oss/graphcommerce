// components/seller/SellerStats.tsx
import { Paper, Grid, Typography, Box, Rating } from '@mui/material'

interface SellerStatsProps {
  yearsInBusiness: number
  clientRating: number | string
  completedProjects: string
  certifications: string
  awards: string
}

export default function SellerStats({
  yearsInBusiness,
  clientRating,
  completedProjects,
  certifications,
  awards,
}: SellerStatsProps) {
  const ratingValue = Number(clientRating) || 0

  const stats = [
    { label: 'Years in Business', value: yearsInBusiness + '+' },
    { label: 'Rating', value: ratingValue, isRating: true },
    { label: 'Completed Projects', value: completedProjects },
    { label: 'Certifications', value: certifications },
    { label: 'Awards', value: awards },
  ]

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid item xs={6} sm={4} md={2.4} key={s.label}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              {s.isRating ? (
                <>
                  <Rating
                    value={s.value}
                    precision={0.5}
                    readOnly
                  />
                  {/* <Typography variant="caption" sx={{ display: 'block' }}>
                    {s.value}/5
                  </Typography> */}
                </>
              ) : (
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mb: 0.5 }}
                >
                  {s.value || '-'}
                </Typography>
              )}

              <Typography variant="body2" color="textSecondary">
                {s.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
