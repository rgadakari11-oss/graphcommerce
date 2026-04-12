import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Divider,
  Box,
} from '@mui/material'

interface SellerSidebarProps {
  onAbout: () => void
  onProducts: () => void
  onGallery: () => void
  onReachUs: () => void
  gstNumber?: string
  location?: string
  phone?: string
  email?: string
}

export default function SellerSidebar({
  onAbout,
  onProducts,
  onGallery,
  onReachUs,
  gstNumber,
  location,
  phone,
  email,
}: SellerSidebarProps) {
  return (
    <Box sx={{ position: 'sticky', top: 32 }}>
      {/* ================= NAVIGATION ================= */}
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Typography sx={{ p: 2, pb: 1 }} fontWeight="bold">
          Our Company
        </Typography>

        <Divider />

        <List dense>
          <ListItem button onClick={onAbout}>
            <ListItemText primary="About Us" />
          </ListItem>

          <ListItem button onClick={onProducts}>
            <ListItemText primary="Products & Services" />
          </ListItem>

          <ListItem button onClick={onGallery}>
            <ListItemText primary="Reviews & Rating" />
          </ListItem>

          <ListItem button onClick={onReachUs}>
            <ListItemText primary="Reach Us" />
          </ListItem>
        </List>

        <Divider />

        <Button
          fullWidth
          sx={{ py: 1.5, fontWeight: 'bold', color: 'error.main' }}
        >
          Download Brochure
        </Button>
      </Paper>

      {/* ================= QUICK CONTACT ================= */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          Quick Contact
        </Typography>

        {gstNumber && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            <strong>GST:</strong> {gstNumber}
          </Typography>
        )}

        {location && (
          <Typography variant="caption" display="block">
            <strong>Location:</strong> {location}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        {phone && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1, fontWeight: 'bold' }}
            href={`tel:${phone}`}
          >
            Call Now
          </Button>
        )}

        {email && (
          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 1, fontWeight: 'bold' }}
            href={`mailto:${email}`}
          >
            Email Us
          </Button>
        )}

        <Button
          variant="outlined"
          fullWidth
          sx={{ fontWeight: 'bold' }}
          onClick={onReachUs}
        >
          Send Inquiry
        </Button>
      </Paper>
    </Box>
  )
}
