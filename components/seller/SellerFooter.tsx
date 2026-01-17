import { Box, Typography } from '@mui/material'

export default function SellerFooter() {
  return (
    <Box
      sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption">
        © {new Date().getFullYear()} Right Solutions.  All rights reserved.
      </Typography>
    </Box>
  )
}
