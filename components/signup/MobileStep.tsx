// components/signup/MobileStep.tsx

import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import { Trans } from '@lingui/react'
import { i18n } from '@lingui/core'
import React from 'react'
import {
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'

type Props = {
  mobile: string
  setMobile: (v: string) => void
  onSubmit: () => void
  loading?: boolean
}

export function MobileStep({ mobile, setMobile, onSubmit, loading }: Props) {
  const theme = useTheme()

  return (
    <>
      <Box textAlign="center" mb={3}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            margin: '0 auto 16px',
          }}
        >
          <PhoneIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          <Trans id="Register Your Business" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Trans id="Enter your mobile number to get started" />
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter 10 digit mobile number"
        value={mobile}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '')
          if (value.length <= 10) setMobile(value)
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  pr: 1,
                  borderRight: '1px solid #E0E0E0',
                }}
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  🇮🇳
                </Box>
                <Typography>+91</Typography>
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
          },
        }}
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onSubmit}
        disabled={mobile.length !== 10 || loading}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          background: 'linear-gradient(45deg, #0D47A1 30%, #1976D2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0A3D91 30%, #1565C0 90%)',
          },
        }}
      >
        {loading ? <Trans id="Sending OTP..." /> : <Trans id="Send OTP" />}
      </Button>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <Trans id="Why register?" />
          </Typography>
        </Divider>
        <Box display="flex" flexDirection="column" gap={1}>
          {[
            i18n._(/* i18n */ 'Get unlimited business inquiries'),
            i18n._(/* i18n */ 'Showcase your products catalog'),
            i18n._(/* i18n */ 'Build trust with verified badge'),
          ].map((item, idx) => (
            <Box
              key={idx}
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ color: 'text.secondary' }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="body2">{item}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  )
}