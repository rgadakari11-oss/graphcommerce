import {
  Paper,
  Grid,
  Avatar,
  Typography,
  Button,
  Chip,
  Box,
  Container,
  useTheme,
} from '@mui/material'
import { SellerHeaderData } from './types'

interface Props {
  data: SellerHeaderData
}

export default function SellerHeader({ data }: Props) {
  const theme = useTheme()

  const {
    storeName,
    gstNumber,
    yearsInBusiness,
    trustSeal,
    phone,
    email,
    logoUrl,
    rating,
    ratingCount,
    responseRate,
  } = data

  return (
    <Paper
      elevation={1}
      sx={{
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        py: 2,
        mb: 3,
        borderRadius: 0,
        background: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <Grid container alignItems="center" spacing={2}>
          {/* ===== LOGO ===== */}
          <Grid item>
            <Avatar
              src={logoUrl}
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontSize: '1.8rem',
                fontWeight: 'bold',
              }}
            >
              {!logoUrl && storeName?.[0]}
            </Avatar>
          </Grid>

          {/* ===== STORE INFO ===== */}
          <Grid item xs>
            {/* Store name */}
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: theme.palette.primary.main, mb: 0.5 }}
            >
              {storeName}
            </Typography>

            {/* Chips + Rating */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {trustSeal && (
                <Chip
                  label="TrustSEAL"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    fontWeight: 'bold',
                    height: 24,
                  }}
                />
              )}

              {gstNumber && (
                <Chip
                  label={`GST: ${gstNumber}`}
                  size="small"
                  sx={{ fontWeight: 'bold', height: 24 }}
                />
              )}

              {yearsInBusiness && (
                <Chip
                  label={`${yearsInBusiness} yrs`}
                  size="small"
                  sx={{ fontWeight: 'bold', height: 24 }}
                />
              )}

              {responseRate && (
                <Chip
                  label={`${responseRate}% Response rate`}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    height: 24,
                    color: theme.palette.success.main,
                  }}
                />
              )}

              {rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}
                  >
                    ★★★★★
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, ml: 0.5 }}
                  >
                    {rating} {ratingCount && `(${ratingCount})`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* ===== ACTION BUTTONS ===== */}
          <Grid item sx={{ minWidth: 200, textAlign: 'right' }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {phone && (
                <Button
                  variant="contained"
                  sx={{
                    fontWeight: 'bold',
                    height: 32,
                    px: 2,
                    fontSize: 14,
                  }}
                  href={`tel:${phone}`}
                >
                  Mobile
                </Button>
              )}

              {email && (
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{
                    fontWeight: 'bold',
                    height: 32,
                    px: 2,
                    fontSize: 14,
                  }}
                  href={`mailto:${email}`}
                >
                  Email
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  )
}
