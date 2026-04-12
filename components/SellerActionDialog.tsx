'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhoneIcon from '@mui/icons-material/Phone'
import ScaleIcon from '@mui/icons-material/Scale'
import type { SellerActionType } from '../hooks/useSellerAction'
import { useSellerAction } from '../hooks/useSellerAction'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SellerActionDialogProps {
  open: boolean
  onClose: () => void

  /** Which action triggered this dialog */
  actionType: SellerActionType

  /** Required context */
  productId: number
  sellerId: number

  /** Optional pre-fills */
  defaultQuantity?: number
  unitLabel?: string        // e.g. "Kg", "Box"

  /** If the logged-in customer's name/phone are already known, pass them to pre-fill */
  customerName?: string
  customerPhone?: string
}

// ─── Config per action type ───────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  SellerActionType,
  { title: string; subtitle: string; icon: React.ReactNode; accentColor: string; showQty: boolean }
> = {
  SUBMIT_REQUIREMENT: {
    title: 'Submit Your Requirement',
    subtitle: 'Tell the seller what you need and theyll get back to you with pricing.',
    icon: < RequestQuoteIcon sx={{ fontSize: 22 }} />,
    accentColor: '#1976d2',
    showQty: true,
  },
  NOTIFY_SELLER: {
    title: 'Notify Seller',
    subtitle: 'Let the seller know you are interested.They will reach out to you shortly.',
    icon: < NotificationsActiveIcon sx={{ fontSize: 22 }} />,
    accentColor: '#F9A825',
    showQty: false,
  },
  VIEW_CONTACT: {
    title: 'View Seller Contact',
    subtitle: 'Enter your phone number to view the seller contact details.',
    icon: <PhoneIcon sx={{ fontSize: 22 }} />,
    accentColor: '#007a6e',
    showQty: false,
  },
  GET_LATEST_PRICE: {                              // ← ADD THIS
    title: 'Get Latest Price',
    subtitle: 'Enter your phone number and the seller will send you the latest pricing.',
    icon: <RequestQuoteIcon sx={{ fontSize: 22 }} />,
    accentColor: '#1976d2',
    showQty: false,
  },

}

// ─── Component ────────────────────────────────────────────────────────────────

export function SellerActionDialog({
  open,
  onClose,
  actionType,
  productId,
  sellerId,
  defaultQuantity,
  unitLabel = '',
  customerName = '',
  customerPhone = '',
}: SellerActionDialogProps) {
  const cfg = ACTION_CONFIG[actionType]
  const { submit, loading } = useSellerAction()

  // Form state
  const [name, setName] = useState(customerName)
  const [phone, setPhone] = useState(customerPhone)
  const [quantity, setQuantity] = useState<string>(defaultQuantity ? String(defaultQuantity) : '')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; quantity?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate() {
    const next: typeof errors = {}
    if (!phone.trim()) next.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) next.phone = 'Enter a valid 10-digit Indian mobile number'
    if (cfg.showQty && !quantity) next.quantity = 'Quantity is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return
    setApiError(null)

    const result = await submit({
      product_id: productId,
      seller_id: sellerId,
      action_type: actionType,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: unitLabel || undefined,
      customer_name: name.trim(),
      phone_number: phone.trim(),
    })

    if (result?.success) {
      setSuccess(true)
    } else {
      setApiError(result?.message ?? 'Something went wrong. Please try again.')
    }
  }

  // ── Reset on close ──────────────────────────────────────────────────────────

  function handleClose() {
    if (loading) return
    // Reset after animation settles
    setTimeout(() => {
      setSuccess(false)
      setApiError(null)
      setErrors({})
      if (!customerName) setName('')
      if (!customerPhone) setPhone('')
      setQuantity(defaultQuantity ? String(defaultQuantity) : '')
    }, 300)
    onClose()
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='xs'
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header bar ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ color: cfg.accentColor, display: 'flex', alignItems: 'center' }}>{cfg.icon}</Box>
        <Typography sx={{ fontWeight: 700, fontSize: '15px', flex: 1 }}>{cfg.title}</Typography>
        <IconButton size='small' onClick={handleClose} disabled={loading}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 0 }}>
        {/* ── Success state ── */}
        {success ? (
          <Box
            sx={{
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              textAlign: 'center',
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 52, color: '#4caf50' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
              {actionType === 'SUBMIT_REQUIREMENT' ? 'Requirement Submitted!'
                : actionType === 'GET_LATEST_PRICE' ? 'Request Sent!'
                  : 'Seller Notified!'}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary', maxWidth: 260 }}>
              {actionType === 'SUBMIT_REQUIREMENT'
                ? 'The seller will review your requirement and contact you soon.'
                : actionType === 'GET_LATEST_PRICE'
                  ? 'The seller will reach out with the latest pricing shortly.'
                  : 'The seller has been notified of your interest and will reach out to you.'}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: '12.5px', color: 'text.secondary', mb: 2 }}>
              {cfg.subtitle}
            </Typography>

            {apiError && (
              <Alert severity='error' sx={{ mb: 2, fontSize: '12.5px' }}>
                {apiError}
              </Alert>
            )}

            <TextField
              label='Phone Number'
              placeholder='Enter your phone number'
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })) }}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
              size='small'
              inputProps={{ maxLength: 10, inputMode: 'numeric' }}
              sx={{ mb: 1.75 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: '13px', color: 'text.secondary', ml: 0.5, mr: 0.25 }}>+91</Typography>
                  </InputAdornment>
                ),
              }}
            />


            {/* ── Name ── */}
            <TextField
              label='Your Name'
              placeholder='Enter your name (optional)'
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              size='small'
              sx={{ mb: 1.75 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* ── Phone ── */}


            {/* ── Quantity (only for SUBMIT_REQUIREMENT) ── */}
            {cfg.showQty && (
              <TextField
                label='Quantity Required'
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: undefined })) }}
                error={!!errors.quantity}
                helperText={errors.quantity}
                fullWidth
                size='small'
                type='number'
                inputProps={{ min: 1 }}
                sx={{ mb: 1.75 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <ScaleIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: unitLabel ? (
                    <InputAdornment position='end'>
                      <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{unitLabel}</Typography>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
            )}
          </>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        {success ? (
          <Button
            fullWidth
            variant='contained'
            onClick={handleClose}
            sx={{
              backgroundColor: cfg.accentColor,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              '&:hover': { opacity: 0.9, backgroundColor: cfg.accentColor },
            }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              variant='outlined'
              onClick={handleClose}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1, flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} color='inherit' /> : undefined}
              sx={{
                backgroundColor: cfg.accentColor,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                flex: 2,
                '&:hover': { opacity: 0.9, backgroundColor: cfg.accentColor },
              }}
            >
              {loading
                ? 'Sending…'
                : actionType === 'SUBMIT_REQUIREMENT'
                  ? 'Submit Requirement'
                  : actionType === 'GET_LATEST_PRICE'
                    ? 'Get Latest Price'
                    : 'Notify Seller'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}