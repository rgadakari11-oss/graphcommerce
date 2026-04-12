import { Grid, Typography, Box, Paper } from '@mui/material'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimelineIcon from '@mui/icons-material/Timeline'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

interface SellerStatsProps {
  yearsInBusiness: number
  clientRating: number | string
  completedProjects: string
  certifications: string
  awards: string
}

const statConfig = [
  {
    key: 'yearsInBusiness',
    label: 'Years in Business',
    icon: <TimelineIcon sx={{ fontSize: 22 }} />,
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    key: 'clientRating',
    label: 'Client Rating',
    icon: <StarHalfIcon sx={{ fontSize: 22 }} />,
    color: '#f57c00',
    bg: '#fff3e0',
  },
  {
    key: 'completedProjects',
    label: 'Completed Projects',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />,
    color: '#388e3c',
    bg: '#e8f5e9',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    icon: <WorkspacePremiumIcon sx={{ fontSize: 22 }} />,
    color: '#7b1fa2',
    bg: '#f3e5f5',
  },
  {
    key: 'awards',
    label: 'Awards',
    icon: <EmojiEventsIcon sx={{ fontSize: 22 }} />,
    color: '#c62828',
    bg: '#ffebee',
  },
]

export default function SellerStats({
  yearsInBusiness,
  clientRating,
  completedProjects,
  certifications,
  awards,
}: SellerStatsProps) {
  const values: Record<string, string | number> = {
    yearsInBusiness: yearsInBusiness ? `${yearsInBusiness}+` : '—',
    clientRating: clientRating || '—',
    completedProjects: completedProjects || '—',
    certifications: certifications || '—',
    awards: awards || '—',
  }

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
      <Grid container spacing={2}>
        {statConfig.map(({ key, label, icon, color, bg }) => (
          <Grid item xs={6} sm={4} md={12 / 5} key={key}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                bgcolor: bg,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  mb: 1,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.7)',
                }}
              >
                {icon}
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color, lineHeight: 1.1, mb: 0.4 }}
              >
                {values[key]}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.3 }}
              >
                {label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}