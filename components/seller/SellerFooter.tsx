import { Box, Typography, Container, Divider } from '@mui/material'

export default function SellerFooter() {
  return (
    <Box
      component="footer"
      sx={{ mt: 6, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Right Solutions. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Verified B2B Marketplace
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}