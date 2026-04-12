import { Paper, Grid } from '@mui/material'

export default function SellerGallery() {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={4} key={i}>
            <Paper sx={{ height: 100 }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
