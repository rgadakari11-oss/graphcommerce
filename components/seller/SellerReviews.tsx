import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Rating,
  LinearProgress,
  Avatar,
  Divider,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'

export type SellerReviewsProps = {
  averageRating: number
  totalReviews: number
}

interface Review {
  name: string
  company?: string
  rating: number
  comment: string
  date: string
}

export default function SellerReviews({ averageRating, totalReviews }: SellerReviewsProps) {
  const reviews: Review[] = [
    {
      name: 'Robert Karmazov',
      company: 'TechBridge Solutions',
      rating: 5,
      comment:
        'Exceptional quality and timely delivery. Their team was highly professional throughout the project lifecycle. Would strongly recommend for B2B procurement.',
      date: '20 days ago',
    },
    {
      name: 'Nilesh Shah',
      company: 'Apex Industries',
      rating: 5,
      comment:
        'Outstanding experience. Their product range is comprehensive and the support team resolved our queries promptly. Excellent after-sales service.',
      date: '1 month ago',
    },
    {
      name: 'Edna Watson',
      company: 'Global Trade Co.',
      rating: 4,
      comment:
        'Very reliable vendor. Products meet our quality standards. Minor delays in one shipment, but communication was transparent throughout.',
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

  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (star) =>
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
  )

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

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
        <ReviewsOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          Customer Reviews
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        {/* ── RATING SUMMARY ── */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              textAlign: 'center',
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 2,
              bgcolor: '#fafafa',
            }}
          >
            <Typography variant="h2" fontWeight={700} color="primary.main" lineHeight={1}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating
              value={averageRating}
              precision={0.5}
              readOnly
              sx={{ mt: 0.5, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              Based on {totalReviews} verified reviews
            </Typography>
          </Box>

          <Box sx={{ px: 1 }}>
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <Box
                key={star}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}
              >
                <Typography variant="caption" sx={{ width: 14, fontWeight: 600 }}>
                  {star}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={ratingDistribution[idx]}
                  sx={{
                    flex: 1,
                    height: 7,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor:
                        star >= 4
                          ? 'success.main'
                          : star === 3
                            ? 'warning.main'
                            : 'error.main',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ width: 28 }}>
                  {Math.round(ratingDistribution[idx])}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* ── SUBMIT REVIEW ── */}
        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Write a Review
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Your Rating
            </Typography>
            <Rating
              value={userRating}
              onChange={(_, value) => setUserRating(value)}
            />
          </Box>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Your Name *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="Your Email *"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Share your experience with this seller..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                Submit Review
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── CUSTOMER FEEDBACKS ── */}
      <Box mt={4}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Customer Feedback
        </Typography>

        <Grid container spacing={2}>
          {reviews.map((r, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
                }}
              >
                <FormatQuoteIcon
                  sx={{ color: 'primary.light', fontSize: 32, mb: 0.5 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flex: 1, lineHeight: 1.7, mb: 2 }}
                >
                  {r.comment}
                </Typography>

                <Box>
                  <Rating value={r.rating} readOnly size="small" sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {initials(r.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">
                        {r.name}
                      </Typography>
                      {r.company && (
                        <Typography variant="caption" color="text.secondary">
                          {r.company}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 'auto' }}
                    >
                      {r.date}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  )
}