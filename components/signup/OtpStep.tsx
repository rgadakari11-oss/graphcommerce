import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material'
import { Trans } from '@lingui/react'
import React from 'react'
import { Security as SecurityIcon } from '@mui/icons-material'

type Props = {
  mobile: string
  otp?: string               // 🔧 make optional (safer)
  setOtp: (v: string) => void
  onSubmit: () => void
  onResendOtp: () => void
  onChangeNumber: () => void
  loading?: boolean
  resendLoading?: boolean
}

export function OtpStep({
  mobile,
  otp = '',                  // 🔧 default empty string
  setOtp,
  onSubmit,
  onResendOtp,
  onChangeNumber,
  loading = false,
  resendLoading = false,
}: Props) {
  const theme = useTheme()

  // 🔒 Always produce exactly 6 boxes no matter what
  const otpDigits = React.useMemo(() => {
    const safeOtp = typeof otp === 'string' ? otp : ''
    const digits = safeOtp.replace(/\D/g, '').slice(0, 6)
    return Array.from({ length: 6 }, (_, i) => digits[i] || '')
  }, [otp])

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    const newDigits = [...otpDigits]
    newDigits[index] = digit

    const newOtp = newDigits.join('')
    setOtp(newOtp)

    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    setOtp(pasted)
    document.getElementById(`otp-${Math.min(pasted.length - 1, 5)}`)?.focus()
  }

  const isOtpComplete = otpDigits.every((d) => d !== '')

  return (
    <>
      {/* Header */}
      <Box textAlign="center" mb={3}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            margin: '0 auto 16px',
          }}
        >
          <SecurityIcon sx={{ fontSize: 32, color: 'success.main' }} />
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          <Trans id="Verify Your Number" />
        </Typography>

        <Typography variant="body2" color="text.secondary">
          <Trans id="Enter the 6-digit OTP sent to" />
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
          +91 {mobile}
        </Typography>

        <Button
          size="small"
          onClick={onChangeNumber}
          sx={{ textTransform: 'none', fontSize: '0.875rem', mt: 0.5 }}
        >
          <Trans id="Change Number" />
        </Button>
      </Box>

      {/* OTP Inputs */}
      <Box
        display="flex"
        justifyContent="center"
        gap={1.5}
        mb={3}
        sx={{ width: '100%' }}
      >
        {otpDigits.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-${index}`}
            type="tel"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autoComplete="one-time-code"
            fullWidth={false}
            variant="outlined"
            InputProps={{
              inputProps: {
                maxLength: 1,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  height: '56px',
                },
              },
            }}
            sx={{
              width: 52,
              '& .MuiOutlinedInput-root': {
                height: '56px',
                backgroundColor: '#fff',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#D0D0D0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#A0A0A0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: 0,
                textAlign: 'center',
              },
            }}
          />
        ))}
      </Box>

      {/* Verify Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onSubmit}
        disabled={!isOtpComplete || loading}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          mb: 2,
          background: 'linear-gradient(45deg, #0D47A1 30%, #1976D2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0A3D91 30%, #1565C0 90%)',
          },
          '&:disabled': {
            opacity: 0.6,
          },
        }}
      >
        {loading ? <Trans id="Verifying..." /> : <Trans id="Verify & Continue" />}
      </Button>

      {/* Resend */}
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <Trans id="Didn't receive the OTP?" />
        </Typography>

        <Button
          size="small"
          onClick={onResendOtp}
          disabled={resendLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {resendLoading ? <Trans id="Sending..." /> : <Trans id="Resend OTP" />}
        </Button>
      </Box>

      {/* Tip */}
      <Box
        mt={3}
        p={2}
        sx={{
          bgcolor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          💡 <Trans id="Tip: Check your SMS inbox. OTP is valid for 10 minutes." />
        </Typography>
      </Box>
    </>
  )
}
