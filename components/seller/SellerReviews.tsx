// components/seller/SellerReviews.tsx
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Rating,
  LinearProgress,
} from '@mui/material'
import { useState } from 'react'

interface Review {
  name: string
  rating: number
  comment: string
  date: string
}

export default function SellerReviews() {
  // Static reviews for now
  const reviews: Review[] = [
    {
      name: 'Robert Karmazov',
      rating: 5,
      comment:
        "I recently had the opportunity to explore Pagedone's UI design system, and it left a lasting impression on my workflow. The system seamlessly blends user-friendly features with a robust set of design components, making it a go-to for creating visually stunning and consistent interfaces.",
      date: '20 days ago',
    },
    {
      name: 'Nilesh Shah',
      rating: 5,
      comment:
        "I recently had the opportunity to explore Pagedone's UI design system, and it left a lasting impression on my workflow. The system seamlessly blends user-friendly features with a robust set of design components, making it a go-to for creating visually stunning and consistent interfaces.",
      date: '1 month ago',
    },
    {
      name: 'Edna Watson',
      rating: 4,
      comment:
        "I recently had the opportunity to explore Pagedone's UI design system, and it left a lasting impression on my workflow. The system seamlessly blends user-friendly features with a robust set of design components, making it a go-to for creating visually stunning and consistent interfaces.",
      date: '8 months ago',
    },
  ]

  const [userRating, setUserRating] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userComment, setUserComment] = useState('')

  const handleSubmit = () => {
    alert('Review submitted (static demo)')
    setUserRating(null)
    setUserName('')
    setUserEmail('')
    setUserComment('')
  }

  // Calculate average rating
  const averageRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (star) =>
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
  )

  return (
    <Box mb={4}>
      {/* Main Section Title */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        What Our Customers Say
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Left: Average rating + distribution */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Average Rating
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h4">{averageRating.toFixed(1)}</Typography>
              <Rating value={averageRating} precision={0.1} readOnly />
            </Box>
            {ratingDistribution.map((percent, idx) => (
              <Box key={idx} display="flex" alignItems="center" mb={0.5}>
                <Typography variant="body2" sx={{ width: 20 }}>
                  {5 - idx}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    flex: 1,
                    mx: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#eee',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: '#2e7d32',
                    },
                  }}
                />
                <Typography variant="body2">{Math.round(percent)}%</Typography>
              </Box>
            ))}
          </Grid>

          {/* Right: Submit Review Form */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Submit Your Review
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Add Your Rating *
              </Typography>
              <Rating
                value={userRating}
                onChange={(_, value) => setUserRating(value)}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <input
                  type="text"
                  placeholder="Name *"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <input
                  type="email"
                  placeholder="Email *"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <textarea
                  placeholder="Write Your Review *"
                  rows={4}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                >
                  Submit Review
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Customer Feedbacks */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Customer Feedbacks
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {reviews.map((r, i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, backgroundColor: '#fafafa' }}
              >
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontWeight="bold">{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.date}
                  </Typography>
                </Box>
                <Rating value={r.rating} readOnly size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {r.comment}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
