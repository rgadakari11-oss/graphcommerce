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
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText,
} from '@mui/material'
import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { SellerReviewsDocument, AddSellerReviewDocument } from '../../graphql/seller/Sellerreviews.gql'

export type SellerReviewsProps = {
  sellerId: number
}

interface FormErrors {
  userRating?: string
  userName?: string
  userEmail?: string
  userMobile?: string
  userComment?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_RE = /^[6-9]\d{9}$/

export default function SellerReviews({ sellerId }: SellerReviewsProps) {
  // ── Fetch reviews ──────────────────────────────────────────────────────────
  const { data, loading, error, refetch } = useQuery(SellerReviewsDocument, {
    variables: { seller_id: sellerId },
    skip: !sellerId,
  })

  const reviews = data?.sellerReviews ?? []

  // ── Derived stats ──────────────────────────────────────────────────────────
  const { averageRating, totalReviews, ratingDistribution } = useMemo(() => {
    if (!reviews.length)
      return { averageRating: 0, totalReviews: 0, ratingDistribution: [0, 0, 0, 0, 0] }

    const total = reviews.length
    const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
    const dist = [5, 4, 3, 2, 1].map(
      (star) => (reviews.filter((r: any) => r.rating === star).length / total) * 100,
    )
    return { averageRating: avg, totalReviews: total, ratingDistribution: dist }
  }, [reviews])

  // ── Mutation ───────────────────────────────────────────────────────────────
  const [addSellerReview, { loading: submitting }] = useMutation(AddSellerReviewDocument)

  // ── Form state ─────────────────────────────────────────────────────────────
  const [userRating, setUserRating] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userMobile, setUserMobile] = useState('')
  const [userCompany, setUserCompany] = useState('')
  const [userComment, setUserComment] = useState('')

  // Track which fields the user has interacted with
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): FormErrors => {
    const errs: FormErrors = {}

    if (!userRating)
      errs.userRating = 'Please select a star rating.'

    if (!userName.trim())
      errs.userName = 'Name is required.'
    else if (userName.trim().length < 2)
      errs.userName = 'Name must be at least 2 characters.'

    // if (!userEmail.trim())
    //   errs.userEmail = 'Email is required.'
    // else if (!EMAIL_RE.test(userEmail.trim()))
    //   errs.userEmail = 'Enter a valid email address.'

    if (!userMobile.trim())
      errs.userMobile = 'Mobile number is required.'
    else if (!MOBILE_RE.test(userMobile.trim()))
      errs.userMobile = 'Enter a valid 10-digit mobile number (starts with 6–9).'

    if (!userComment.trim())
      errs.userComment = 'Review text is required.'
    else if (userComment.trim().length < 10)
      errs.userComment = 'Review must be at least 10 characters.'

    return errs
  }

  // Re-validate a single field on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setFormErrors(validate())
  }

  const resetForm = () => {
    setUserRating(null)
    setUserName('')
    setUserEmail('')
    setUserMobile('')
    setUserCompany('')
    setUserComment('')
    setTouched({})
    setFormErrors({})
  }

  const handleSubmit = async () => {
    // Mark all required fields as touched so all errors surface at once
    setTouched({ userRating: true, userName: true, userMobile: true, userComment: true })
    const errs = validate()
    setFormErrors(errs)

    if (Object.keys(errs).length > 0) return // inline errors shown — stop here

    try {
      const { data: mutData } = await addSellerReview({
        variables: {
          seller_id: sellerId,
          customer_name: userName.trim(),
          customer_email: userEmail.trim(),
          customer_mobile: userMobile.trim(),
          company_name: userCompany.trim() || undefined,
          rating: userRating!,
          review: userComment.trim(),
        },
      })

      if (mutData?.addSellerReview?.success) {
        setSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' })
        resetForm()
        refetch()
      } else {
        setSnackbar({
          open: true,
          message: mutData?.addSellerReview?.message ?? 'Something went wrong.',
          severity: 'error',
        })
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit review. Please try again.', severity: 'error' })
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const formatDate = (dateStr: string) => {
    try {
      const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 30) return `${diffDays} days ago`
      if (diffDays < 60) return '1 month ago'
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      const yrs = Math.floor(diffDays / 365)
      return `${yrs} year${yrs > 1 ? 's' : ''} ago`
    } catch {
      return dateStr
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ReviewsOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>Customer Reviews</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* ── Loading / Error states ── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load reviews. Please refresh the page.
          </Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={4}>
            {/* ── RATING SUMMARY ── */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center', p: 2.5, border: '1px solid',
                  borderColor: 'divider', borderRadius: 2, mb: 2, bgcolor: '#fafafa',
                }}
              >
                {totalReviews > 0 ? (
                  <>
                    <Typography variant="h2" fontWeight={700} color="primary.main" lineHeight={1}>
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Rating value={averageRating} precision={0.5} readOnly sx={{ mt: 0.5, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No reviews yet. Be the first to review!
                  </Typography>
                )}
              </Box>

              {totalReviews > 0 && (
                <Box sx={{ px: 1 }}>
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <Typography variant="caption" sx={{ width: 14, fontWeight: 600 }}>{star}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={ratingDistribution[idx]}
                        sx={{
                          flex: 1, height: 7, borderRadius: 4, bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: star >= 4 ? 'success.main' : star === 3 ? 'warning.main' : 'error.main',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ width: 28 }}>
                        {Math.round(ratingDistribution[idx])}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* ── WRITE A REVIEW ── */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Write a Review</Typography>

              {/* ── Star rating with inline error ── */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Your Rating *</Typography>
                  <Rating
                    value={userRating}
                    onChange={(_, value) => {
                      setUserRating(value)
                      if (touched.userRating)
                        setFormErrors((prev) => ({ ...prev, userRating: value ? undefined : 'Please select a star rating.' }))
                    }}
                    onBlur={() => handleBlur('userRating')}
                  />
                </Box>
                {touched.userRating && formErrors.userRating && (
                  <FormHelperText error sx={{ mt: 0.25, ml: 0 }}>
                    {formErrors.userRating}
                  </FormHelperText>
                )}
              </Box>

              <Grid container spacing={1.5}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" placeholder="Your Name *"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value)
                      if (touched.userName)
                        setFormErrors((prev) => ({
                          ...prev,
                          userName: !e.target.value.trim()
                            ? 'Name is required.'
                            : e.target.value.trim().length < 2
                              ? 'Name must be at least 2 characters.'
                              : undefined,
                        }))
                    }}
                    onBlur={() => handleBlur('userName')}
                    error={touched.userName && !!formErrors.userName}
                    helperText={touched.userName && formErrors.userName ? formErrors.userName : ' '}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" type="email" placeholder="Your Email"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value)
                      if (touched.userEmail)
                        setFormErrors((prev) => ({
                          ...prev,
                          userEmail: !e.target.value.trim()
                            ? 'Email is required.'
                            : !EMAIL_RE.test(e.target.value.trim())
                              ? 'Enter a valid email address.'
                              : undefined,
                        }))
                    }}
                    onBlur={() => handleBlur('userEmail')}

                  />
                </Grid>

                {/* Mobile */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" type="tel"
                    placeholder="Mobile Number *"
                    value={userMobile}
                    inputProps={{ maxLength: 10 }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setUserMobile(val)
                      if (touched.userMobile)
                        setFormErrors((prev) => ({
                          ...prev,
                          userMobile: !val
                            ? 'Mobile number is required.'
                            : !MOBILE_RE.test(val)
                              ? 'Enter a valid 10-digit mobile number (starts with 6–9).'
                              : undefined,
                        }))
                    }}
                    onBlur={() => handleBlur('userMobile')}
                    error={touched.userMobile && !!formErrors.userMobile}
                    helperText={touched.userMobile && formErrors.userMobile ? formErrors.userMobile : ' '}
                  />
                </Grid>

                {/* Company (optional) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" placeholder="Company Name"
                    value={userCompany}
                    onChange={(e) => setUserCompany(e.target.value)}
                    helperText=" "
                  />
                </Grid>

                {/* Review text */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline rows={3} size="small"
                    placeholder="Share your experience with this seller... *"
                    value={userComment}
                    onChange={(e) => {
                      setUserComment(e.target.value)
                      if (touched.userComment)
                        setFormErrors((prev) => ({
                          ...prev,
                          userComment: !e.target.value.trim()
                            ? 'Review text is required.'
                            : e.target.value.trim().length < 10
                              ? 'Review must be at least 10 characters.'
                              : undefined,
                        }))
                    }}
                    onBlur={() => handleBlur('userComment')}
                    error={touched.userComment && !!formErrors.userComment}
                    helperText={
                      touched.userComment && formErrors.userComment
                        ? formErrors.userComment
                        : `${userComment.trim().length} / min 10 characters`
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      boxShadow: 'none',
                      border: '1.5px solid',
                      borderColor: 'primary.main',
                      '&:hover': {
                        boxShadow: 'none',
                        borderColor: 'primary.dark',
                      },
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* ── CUSTOMER FEEDBACK CARDS ── */}
        {!loading && !error && reviews.length > 0 && (
          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Customer Feedback</Typography>
            <Grid container spacing={2}>
              {reviews.map((r: any) => (
                <Grid item xs={12} md={4} key={r.id}>
                  <Box
                    sx={{
                      p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2,
                      height: '100%', display: 'flex', flexDirection: 'column',
                      bgcolor: 'background.paper', transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
                    }}
                  >
                    <FormatQuoteIcon sx={{ color: 'primary.light', fontSize: 32, mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.7, mb: 2 }}>
                      {r.review}
                    </Typography>
                    <Box>
                      <Rating value={r.rating} readOnly size="small" sx={{ mb: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'primary.main' }}>
                          {initials(r.customer_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={700} display="block">{r.customer_name}</Typography>
                          {r.company_name && (
                            <Typography variant="caption" color="text.secondary">{r.company_name}</Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatDate(r.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Success / server-error snackbar only — no more "fill required fields" here */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}