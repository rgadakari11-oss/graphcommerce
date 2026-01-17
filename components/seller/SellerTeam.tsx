import { Paper, Grid, Avatar, Typography } from '@mui/material'

export default function SellerTeam() {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" fontWeight="bold">Meet Our Team</Typography>
      <Grid container spacing={2}>
        {['Som', 'Rakesh', 'Sonal', 'Amit'].map((n) => (
          <Grid item xs={6} md={3} key={n}>
            <Avatar sx={{ mx: 'auto', mb: 1 }}>{n[0]}</Avatar>
            <Typography align="center">{n}</Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
