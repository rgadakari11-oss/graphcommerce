import { Paper, Typography, Divider, Box } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

type SellerAboutProps = {
  aboutUs?: string | null
}

export default function SellerAbout({ aboutUs }: SellerAboutProps) {
  if (!aboutUs) return null

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
        <InfoOutlinedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          About Us
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography
        component="div"
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.8,
          '& p': { mb: 1.5 },
          '& ul, & ol': { pl: 2.5, mb: 1.5 },
          '& li': { mb: 0.5 },
        }}
        dangerouslySetInnerHTML={{ __html: aboutUs }}
      />
    </Paper>
  )
}