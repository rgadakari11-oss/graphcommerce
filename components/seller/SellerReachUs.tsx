// components/seller/SellerReachUs.tsx
import { Paper, Typography, Grid, Button, Box, Divider } from '@mui/material'

interface SellerReachUsProps {
  address: string
  city: string
  state: string
  country: string
  pincode: string
  gstNumber?: string
  googleMapUrl?: string // embed URL
  directionsUrl?: string // Google Maps directions URL
}

export default function SellerReachUs({
  address,
  city,
  state,
  country,
  pincode,
  gstNumber,
  googleMapUrl,
  directionsUrl,
}: SellerReachUsProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: 2,
      }}
    >
      {/* Section Title */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Reach Us
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Grid Layout */}
      <Grid container spacing={3}>
        {/* Address + Directions */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Address
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            {address},<br />
            {city}, {state},<br />
            {country} – {pincode}
            {gstNumber && <><br />GST: {gstNumber}</>}
          </Typography>

          {directionsUrl && (
            <Button
              variant="outlined"
              color="primary"
              href={directionsUrl}
              target="_blank"
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Get Directions
            </Button>
          )}
        </Grid>

        {/* Embedded Google Map */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: 150,
              borderRadius: 2,
              border: '1px solid #ddd',
              overflow: 'hidden',
              bgcolor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {googleMapUrl && (
              <iframe
                title="Seller Location"
                src={googleMapUrl}
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Inquiry Form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Send Us an Inquiry
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              placeholder="Your Name"
              style={{
                width: '100%',
                padding: 8,
                marginBottom: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="email"
              placeholder="Your Email"
              style={{
                width: '100%',
                padding: 8,
                marginBottom: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <textarea
              placeholder="Your Message"
              rows={3}
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
              sx={{ fontWeight: 'bold' }}
            >
              Submit Inquiry
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
