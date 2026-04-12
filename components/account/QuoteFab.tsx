import { Fab } from '@mui/material'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import { useState, useEffect } from 'react'

export function QuoteFab({ loading, success }: { loading?: boolean; success?: boolean }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (success) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }
  }, [success])

  return (
    <Fab
      variant="extended"
      sx={{
        bgcolor: success ? '#10b981' : '#f59e0b',
        color: '#fff',
        px: 2,
        minHeight: 36,
        boxShadow: pulse ? '0 0 0 6px rgba(16,185,129,0.25)' : 'none',
        transform: pulse ? 'scale(1.05)' : 'scale(1)',
        transition: 'all .25s ease',
        '&:hover': {
          bgcolor: success ? '#059669' : '#d97706',
        },
      }}
    >
      <RequestQuoteOutlinedIcon sx={{ mr: 1 }} />
      {loading ? 'Adding…' : success ? 'Added' : 'Quote'}
    </Fab>
  )
}
