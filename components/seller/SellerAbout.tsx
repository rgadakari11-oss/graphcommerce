import { Paper, Typography } from '@mui/material'

type SellerAboutProps = {
  aboutUs?: string | null
}

export default function SellerAbout({ aboutUs }: SellerAboutProps) {
  if (!aboutUs) return null

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" fontWeight="bold">
        About Us
      </Typography>

      <Typography sx={{ mt: 1 }}>
        {aboutUs}
      </Typography>
    </Paper>
  )
}
