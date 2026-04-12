'use client'

import { useState } from 'react'
import {
  Dialog,
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
  Avatar,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PhoneIcon from '@mui/icons-material/Phone'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useSellerAction } from '../hooks/useSellerAction'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SellerContactInfo {
  store_name?: string | null
  owner_name?: string | null
  phone?: string | null
  mobile?: string | null
  email?: string | null
  area?: string | null
  city?: string | null
  state?: string | null
  about_us?: string | null
  years_in_business?: number | null
  trust_seal?: boolean | null
  store_code?: string | null
}

export interface ViewSellerContactDialogProps {
  open: boolean
  onClose: () => void
  seller: SellerContactInfo | null | undefined
  productId: number
  sellerId: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ViewSellerContactDialog({
  open,
  onClose,
  seller,
  productId,
  sellerId,
}: ViewSellerContactDialogProps) {
  const { submit, loading } = useSellerAction()

  // Step 1 = collect phone, Step 2 = show seller info
  const [step, setStep] = useState<1 | 2>(1)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    if (!phone.trim()) { setPhoneError('Phone number is required'); return false }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { setPhoneError('Enter a valid 10-digit mobile number'); return false }
    setPhoneError(null)
    return true
  }

  // ── Submit phone → log action → reveal seller ───────────────────────────────
  async function handleReveal() {
    if (!validate()) return
    setApiError(null)

    const result = await submit({
      product_id: productId,
      seller_id: sellerId,
      action_type: 'VIEW_CONTACT',
      phone_number: phone.trim(),
    })

    if (result?.success) {
      setStep(2)
    } else {
      setApiError(result?.message ?? 'Something went wrong. Please try again.')
    }
  }

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  async function handleCopy(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Reset on close ──────────────────────────────────────────────────────────
  function handleClose() {
    if (loading) return
    onClose()
    setTimeout(() => {
      setStep(1)
      setPhone('')
      setPhoneError(null)
      setApiError(null)
    }, 300)
  }

  const primaryPhone = seller?.mobile || seller?.phone

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='xs'
      PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden' } }}
    >
      {/* ── Header ── */}
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
        <PhoneIcon sx={{ fontSize: 20, color: '#007a6e' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '15px', flex: 1 }}>
          {step === 1 ? 'View Seller Contact' : 'Seller Contact Details'}
        </Typography>
        <IconButton size='small' onClick={handleClose} disabled={loading}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 0 }}>

        {/* ══════════════ STEP 1 — Collect phone ══════════════ */}
        {step === 1 && (
          <Box>
            <Typography sx={{ fontSize: '12.5px', color: 'text.secondary', mb: 2 }}>
              Enter your phone number to view the seller's contact details.
            </Typography>

            {apiError && (
              <Alert severity='error' sx={{ mb: 2, fontSize: '12.5px' }}>{apiError}</Alert>
            )}

            <TextField
              label='Your Phone Number'
              placeholder='Enter your phone number'
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(null) }}
              error={!!phoneError}
              helperText={phoneError}
              fullWidth
              size='small'
              inputProps={{ maxLength: 10, inputMode: 'numeric' }}
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: '13px', color: 'text.secondary', ml: 0.5, mr: 0.25 }}>
                      +91
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <Typography sx={{ fontSize: '11px', color: 'text.disabled', mb: 1 }}>
              Your number will be shared with the seller so they can contact you.
            </Typography>
          </Box>
        )}

        {/* ══════════════ STEP 2 — Show seller info ══════════════ */}
        {step === 2 && (
          <Box>
            {/* ── Seller Header ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#e0f2f1',
                  color: '#007a6e',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                {seller?.store_name?.[0]?.toUpperCase() ?? 'S'}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                    {seller?.store_name ?? 'Seller'}
                  </Typography>
                  {seller?.trust_seal && (
                    <CheckCircleIcon sx={{ fontSize: 15, color: '#2e7d32' }} />
                  )}
                </Box>
                {seller?.years_in_business && (
                  <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>
                    {seller.years_in_business} Years in Business
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* ── Contact Rows ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {/* Phone / Mobile */}
              {primaryPhone && (
                <ContactRow
                  icon={<PhoneIcon sx={{ fontSize: 16, color: '#007a6e' }} />}
                  label='Phone'
                  value={primaryPhone}
                  copyKey='phone'
                  copied={copied}
                  onCopy={handleCopy}
                  highlight
                />
              )}

              {/* Owner Name */}
              {seller?.owner_name && (
                <ContactRow
                  icon={<PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  label='Contact Person'
                  value={seller.owner_name}
                  copyKey='owner'
                  copied={copied}
                  onCopy={handleCopy}
                />
              )}

              {/* Email */}
              {seller?.email && (
                <ContactRow
                  icon={<EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  label='Email'
                  value={seller.email}
                  copyKey='email'
                  copied={copied}
                  onCopy={handleCopy}
                />
              )}

              {/* Store */}
              {seller?.store_name && (
                <ContactRow
                  icon={<StorefrontIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  label='Store'
                  value={seller.store_name}
                  copyKey='store'
                  copied={copied}
                  onCopy={handleCopy}
                />
              )}

              {/* Location */}
              {(seller?.area || seller?.city) && (
                <ContactRow
                  icon={<LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                  label='Location'
                  value={[seller.area, seller.city, seller.state].filter(Boolean).join(', ')}
                  copyKey='location'
                  copied={copied}
                  onCopy={handleCopy}
                />
              )}
            </Box>

            {/* ── About ── */}
            {seller?.about_us && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  backgroundColor: '#f7f9fc',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
                  About Seller
                </Typography>
                <Typography
                  component='div'
                  sx={{ fontSize: '12px', color: 'text.primary', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: seller.about_us }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        {step === 1 ? (
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
              onClick={handleReveal}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} color='inherit' /> : undefined}
              sx={{
                backgroundColor: '#007a6e',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                flex: 2,
                '&:hover': { backgroundColor: '#00695c' },
              }}
            >
              {loading ? 'Verifying…' : 'View Contact Details'}
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant='contained'
            onClick={handleClose}
            sx={{
              backgroundColor: '#007a6e',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              '&:hover': { backgroundColor: '#00695c' },
            }}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

// ─── ContactRow sub-component ─────────────────────────────────────────────────

function ContactRow({
  icon,
  label,
  value,
  copyKey,
  copied,
  onCopy,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  copyKey: string
  copied: string | null
  onCopy: (value: string, key: string) => void
  highlight?: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: highlight ? '#b2dfdb' : 'divider',
        backgroundColor: highlight ? '#e0f2f1' : 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Box>
          <Typography sx={{ fontSize: '11px', color: 'text.secondary', lineHeight: 1 }}>
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: '13.5px',
              fontWeight: highlight ? 700 : 500,
              color: highlight ? '#007a6e' : 'text.primary',
              lineHeight: 1.4,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <IconButton
        size='small'
        onClick={() => onCopy(value, copyKey)}
        sx={{ color: copied === copyKey ? '#2e7d32' : 'text.disabled' }}
      >
        {copied === copyKey
          ? <CheckCircleIcon sx={{ fontSize: 16 }} />
          : <ContentCopyIcon sx={{ fontSize: 16 }} />
        }
      </IconButton>
    </Box>
  )
}