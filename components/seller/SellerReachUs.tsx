import {
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Divider,
  TextField,
  Chip,
} from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'

interface SellerReachUsProps {
  address: string
  city: string
  state: string
  country: string
  pincode: string
  gstNumber?: string
  googleMapUrl?: string
  directionsUrl?: string
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
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        mb: 3,
      }}
    >
      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <LocationOnOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          Reach Us
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* ── ADDRESS ── */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Office Address
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
              {address}
              <br />
              {city}, {state}
              <br />
              {country} – {pincode}
            </Typography>
            {gstNumber && (
              <Chip
                label={`GST: ${gstNumber}`}
                size="small"
                variant="outlined"
                sx={{ mt: 1.5, fontSize: '0.7rem', fontWeight: 600 }}
              />
            )}
          </Box>

          {directionsUrl && (
            <Button
              variant="outlined"
              startIcon={<DirectionsOutlinedIcon />}
              href={directionsUrl}
              target="_blank"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 1.5,
                mb: 2,
              }}
            >
              Get Directions
            </Button>
          )}

          {/* MAP */}
          <Box
            sx={{
              width: '100%',
              height: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              bgcolor: '#e8ecf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {googleMapUrl ? (
              <iframe
                title="Seller Location"
                src={googleMapUrl}
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Map not available
              </Typography>
            )}
          </Box>
        </Grid>

        {/* ── INQUIRY FORM ── */}
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            Send an Inquiry
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Your Name *"
                label="Name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="you@company.com"
                label="Email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="+91 XXXXX XXXXX"
                label="Phone"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Bulk Supply"
                label="Subject"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                label="Message"
                placeholder="Describe your requirement in detail..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="medium"
                startIcon={<SendOutlinedIcon />}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                Submit Inquiry
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}