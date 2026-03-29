import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  alpha,
  Stack,
  Divider,
  Button,
  TextField,
  IconButton,
  Breadcrumbs,
  Link,
  MenuItem,
  InputAdornment,
  Collapse,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  RadioGroup,
  Radio
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PhoneIcon from '@mui/icons-material/Phone'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import ReplyIcon from '@mui/icons-material/Reply'
import EditNoteIcon from '@mui/icons-material/EditNote'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import { useRouter } from 'next/router'
import { useQuery, useMutation, gql } from '@graphcommerce/graphql'
import { useState } from 'react'
import type { GetServerSideProps } from 'next'

import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { SellerAccountLayout } from '../../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'
import { getSellerId } from '../../../lib/utils/getMobileNumber'

const sellerId = Number(getSellerId())

const SELLER_QUOTES_QUERY = gql`
  query SellerQuotes($seller_id: Int!) {
    customerSellerOrders(seller_id: $seller_id) {
      order_id
      order_number
      seller_id
      seller_total
      status
      created_at
      customer_name
      mobile_number
      delivery_date
      payment_terms
      additional_notes
      items {
        item_id
        name
        sku
        qty
        price
        row_total
        seller_id
        image_url
      }
      quote_responses {
        entity_id
        order_id
        seller_id
        actor_type
        response_type
        mobile_number
        payment_status
        payment_note
        address_status
        address_note
        price_status
        original_price
        revised_price
        price_note
        delivery_status
        requested_delivery_date
        revised_delivery_date
        delivery_note
        stock_status
        stock_note
        seller_message
        additional_note
        created_at
        updated_at
      }
    }
  }
`

const RESPOND_QUOTE_MUTATION = gql`
  mutation RespondQuote($input: RespondQuoteInput!) {
    respondQuote(input: $input) {
      success
      message
      response_id
    }
  }
`

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
      return { color: '#f59e0b', label: 'Pending, Your Action Required', bg: alpha('#f59e0b', 0.1) }
    case 'approved':
      return { color: '#10b981', label: 'APPROVED', bg: alpha('#10b981', 0.1) }
    case 'rejected':
      return { color: '#ef4444', label: 'REJECTED', bg: alpha('#ef4444', 0.1) }
    case 'replied':
      return { color: '#3b82f6', label: 'Waiting for Customer', bg: alpha('#3b82f6', 0.1) }
    default:
      return { color: '#6b7280', label: status.toUpperCase(), bg: alpha('#6b7280', 0.1) }
  }
}

function getPaymentLabel(term: string) {
  const map: Record<string, string> = {
    'net-30': 'Net 30 Days',
    'net-60': 'Net 60 Days',
    'net-90': 'Net 90 Days',
    cod: 'Cash on Delivery',
    prepaid: 'Prepaid',
  }
  return map[term] || term
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', py: 0.75 }}>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ minWidth: 140, fontWeight: 500, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  )
}

// ─── Status badge helpers for response fields ───────────────────────────────
function ResponseStatusBadge({
  status,
  type,
}: {
  status: string
  type: 'payment' | 'address' | 'price' | 'delivery' | 'stock' | 'response'
}) {
  const configs: Record<string, { color: string; bg: string; label: string }> = {
    // payment
    confirmed: { color: '#064e3b', bg: '#f0fdf4', label: 'Confirmed' },
    negotiable: { color: '#92400e', bg: '#fffbeb', label: 'Negotiable' },
    rejected: { color: '#7f1d1d', bg: '#fff5f5', label: 'Rejected' },
    // address
    issue: { color: '#92400e', bg: '#fffbeb', label: 'Issue Raised' },
    // price
    revised: { color: '#1e3a8a', bg: '#eff6ff', label: 'Revised' },
    // delivery
    // stock
    available: { color: '#064e3b', bg: '#f0fdf4', label: 'In Stock' },
    partial: { color: '#92400e', bg: '#fffbeb', label: 'Partial Stock' },
    // response types
    approved: { color: '#064e3b', bg: '#f0fdf4', label: 'Approved' },
    replied: { color: '#1e3a8a', bg: '#eff6ff', label: 'Reply Sent' },
  }
  const cfg = configs[status] || { color: '#374151', bg: '#f3f4f6', label: status }
  return (
    <Box
      component='span'
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.2,
        borderRadius: 0.75,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        border: '1px solid',
        borderColor: alpha(cfg.color, 0.2),
        lineHeight: 1.6,
      }}
    >
      {cfg.label}
    </Box>
  )
}

// ─── A single response card (seller or customer) ─────────────────────────────
function QuoteResponseCard({ response, customerName }: { response: any; customerName: string }) {
  const isSeller = response.actor_type === 'seller'

  const detailRows: { icon: React.ReactNode; label: string; status: string; note?: string; extra?: React.ReactNode }[] = []

  if (response.payment_status) {
    detailRows.push({
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 14 }} />,
      label: 'Payment',
      status: response.payment_status,
      note: response.payment_note,
    })
  }
  if (response.address_status) {
    detailRows.push({
      icon: <HomeOutlinedIcon sx={{ fontSize: 14 }} />,
      label: 'Address',
      status: response.address_status,
      note: response.address_note,
    })
  }
  if (response.price_status) {
    detailRows.push({
      icon: <PriceChangeOutlinedIcon sx={{ fontSize: 14 }} />,
      label: 'Price',
      status: response.price_status,
      note: response.price_note,
      extra:
        response.price_status === 'revised' && response.revised_price ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.2,
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 0.75,
              ml: 1,
            }}
          >
            <Typography variant='caption' sx={{ fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>
              ₹{response.revised_price.toLocaleString()}
            </Typography>
          </Box>
        ) : null,
    })
  }
  if (response.delivery_status) {
    detailRows.push({
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />,
      label: 'Delivery',
      status: response.delivery_status,
      note: response.delivery_note,
      extra:
        response.revised_delivery_date ? (
          <Typography variant='caption' sx={{ ml: 1, color: '#92400e', fontWeight: 600 }}>
            → {formatDate(response.revised_delivery_date)}
          </Typography>
        ) : null,
    })
  }
  if (response.stock_status) {
    detailRows.push({
      icon: <InventoryOutlinedIcon sx={{ fontSize: 14 }} />,
      label: 'Stock',
      status: response.stock_status,
      note: response.stock_note,
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSeller ? 'row-reverse' : 'row',
        gap: 1.5,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: isSeller ? '#6366f1' : getAvatarColor(customerName),
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '2px solid',
            borderColor: isSeller ? alpha('#6366f1', 0.3) : alpha(getAvatarColor(customerName), 0.3),
          }}
        >
          {isSeller ? <StorefrontIcon sx={{ fontSize: 18 }} /> : getInitials(customerName)}
        </Avatar>
        <Typography variant='caption' sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {isSeller ? 'You' : 'Customer'}
        </Typography>
      </Box>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: '82%',
          flex: 1,
        }}
      >
        {/* Header strip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.75,
            flexDirection: isSeller ? 'row-reverse' : 'row',
          }}
        >
          <Typography variant='caption' sx={{ fontWeight: 700, color: isSeller ? '#4f46e5' : '#374151' }}>
            {isSeller ? 'Your Response' : customerName}
          </Typography>
          <ResponseStatusBadge status={response.response_type} type='response' />
          <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>
            {formatDateTime(response.created_at)}
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: isSeller ? alpha('#6366f1', 0.25) : '#e2e8f0',
            borderRadius: isSeller ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
            bgcolor: isSeller ? alpha('#6366f1', 0.04) : '#fafafa',
            overflow: 'hidden',
          }}
        >
          {/* Detail rows */}
          {detailRows.length > 0 && (
            <Box sx={{ px: 2, pt: 1.75, pb: detailRows.length > 0 ? 1 : 1.75 }}>
              <Stack spacing={0.75}>
                {detailRows.map((row, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      py: 0.85,
                      px: 1.25,
                      bgcolor: '#fff',
                      border: '1px solid #f1f5f9',
                      borderRadius: 1.25,
                    }}
                  >
                    <Box sx={{ color: '#94a3b8', mt: 0.15, flexShrink: 0 }}>{row.icon}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: row.note ? 0.4 : 0 }}>
                        <Typography variant='caption' sx={{ fontWeight: 700, color: '#475569', minWidth: 56 }}>
                          {row.label}
                        </Typography>
                        <ResponseStatusBadge status={row.status} type='payment' />
                        {row.extra}
                      </Box>
                      {row.note && (
                        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, display: 'block' }}>
                          {row.note}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Additional note */}
          {response.additional_note && (
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderTop: detailRows.length > 0 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8', mt: 0.2, flexShrink: 0 }} />
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                  {response.additional_note}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Seller message fallback */}
          {response.seller_message && !response.additional_note && (
            <Box sx={{ px: 2, py: 1.25, borderTop: detailRows.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                {response.seller_message}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Quote Responses Thread ──────────────────────────────────────────────────
function QuoteResponsesThread({ responses, customerName }: { responses: any[]; customerName: string }) {
  if (!responses || responses.length === 0) return null

  const sorted = [...responses].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Section header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: alpha('#6366f1', 0.08),
              border: '1px solid',
              borderColor: alpha('#6366f1', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ForumOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
          </Box>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Response Thread
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {sorted.length} message{sorted.length !== 1 ? 's' : ''} exchanged
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 18, height: 18, bgcolor: '#6366f1', fontSize: '0.55rem' }}>
                <StorefrontIcon sx={{ fontSize: 10 }} />
              </Avatar>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.68rem' }}>You (Seller)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 18, height: 18, bgcolor: getAvatarColor(customerName), fontSize: '0.55rem' }}>
                {getInitials(customerName)}
              </Avatar>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.68rem' }}>Customer</Typography>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        <Stack spacing={3}>
          {sorted.map((response, idx) => (
            <QuoteResponseCard key={response.entity_id ?? idx} response={response} customerName={customerName} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

function SellerQuoteDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const orderId = Number(id)

  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const { data, loading } = useQuery(SELLER_QUOTES_QUERY, {
    variables: { seller_id: sellerId },
    skip: !sellerId,
    fetchPolicy: 'cache-and-network',
  })

  const quote = data?.customerSellerOrders?.find((q: any) => q.order_id === orderId)

  // Response form state
  const [replyOpen, setReplyOpen] = useState(false)
  const [responseStatus, setResponseStatus] = useState<'approved' | 'rejected' | 'replied'>('replied')
  const [revisedTotal, setRevisedTotal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Structured response fields
  const [confirmCOD, setConfirmCOD] = useState<'yes' | 'no' | 'negotiate'>('yes')
  const [confirmAddress, setConfirmAddress] = useState(true)
  const [addressNote, setAddressNote] = useState('')
  const [confirmPrice, setConfirmPrice] = useState(true)
  const [canRevisePrice, setCanRevisePrice] = useState(false)
  const [confirmDelivery, setConfirmDelivery] = useState(true)
  const [revisedDelivery, setRevisedDelivery] = useState('')
  const [confirmStock, setConfirmStock] = useState(true)
  const [stockNote, setStockNote] = useState('')
  const [additionalNote, setAdditionalNote] = useState('')

  const [respondQuote, { loading: submitting }] = useMutation(RESPOND_QUOTE_MUTATION)

  const handleSubmitResponse = async () => {
    setSubmitError('')
    try {
      const result = await respondQuote({
        variables: {
          input: {
            order_id: orderId,
            seller_id: quote.seller_id,
            mobile_number: quote.mobile_number,
            response_type: responseStatus,
            actor_type: 'seller',
            payment_status: confirmCOD === 'yes' ? 'confirmed' : confirmCOD === 'no' ? 'rejected' : 'negotiable',
            payment_note: confirmCOD === 'yes' ? 'Payment terms accepted as requested.' : confirmCOD === 'negotiate' ? 'Open to discuss adjusted payment terms.' : 'Cannot accept these payment terms.',
            address_status: confirmAddress ? 'confirmed' : 'issue',
            address_note: confirmAddress ? '' : addressNote,
            price_status: canRevisePrice ? 'revised' : 'confirmed',
            revised_price: canRevisePrice && revisedTotal ? parseFloat(revisedTotal) : undefined,
            price_note: canRevisePrice && revisedTotal ? `Revised total: ₹${revisedTotal}` : '',
            delivery_status: confirmDelivery ? 'confirmed' : 'revised',
            revised_delivery_date: !confirmDelivery && revisedDelivery ? revisedDelivery : undefined,
            delivery_note: !confirmDelivery ? (revisedDelivery ? `Earliest delivery: ${revisedDelivery}` : 'Date TBD') : '',
            stock_status: confirmStock ? 'available' : 'partial',
            stock_note: confirmStock ? '' : stockNote,
            additional_note: additionalNote.trim(),
          },
        },
      })

      if (result.data?.respondQuote?.success) {
        setSubmitted(true)
        setReplyOpen(false)
      } else {
        setSubmitError(result.data?.respondQuote?.message || 'Failed to send response. Please try again.')
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An error occurred. Please try again.')
    }
  }

  const statusConfig = quote ? getStatusConfig(quote.status) : getStatusConfig('pending')

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Quote Details')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>
          {/* Breadcrumb */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              href='/seller/quotes'
              underline='hover'
              color='inherit'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault()
                router.push('/seller/quotes')
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <Typography variant='body2'>Quote Requests</Typography>
            </Link>
            <Typography variant='body2' color='text.primary' fontWeight={600}>
              {loading ? 'Loading...' : `#${quote?.order_number || id}`}
            </Typography>
          </Breadcrumbs>

          {loading && (
            <Typography color='text.secondary'>Loading quote details...</Typography>
          )}

          {!loading && !quote && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant='h6' color='text.secondary'>
                Quote not found
              </Typography>
              <Button
                variant='outlined'
                sx={{ mt: 2 }}
                onClick={() => router.push('/seller/quotes')}
              >
                Back to Quotes
              </Button>
            </Box>
          )}

          {!loading && quote && (
            <Stack spacing={3}>
              {/* Page Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography variant='h5' sx={{ fontWeight: 700 }}>
                      Quote #{quote.order_number}
                    </Typography>
                    <Chip
                      label={statusConfig.label}
                      sx={{
                        bgcolor: statusConfig.bg,
                        color: statusConfig.color,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant='caption' color='text.secondary'>
                      Received on {formatDateTime(quote.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {!submitted && (
                  <Button
                    variant='contained'
                    startIcon={<ReplyIcon />}
                    onClick={() => setReplyOpen(!replyOpen)}
                    sx={{
                      bgcolor: '#6366f1',
                      '&:hover': { bgcolor: '#4f46e5' },
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                    }}
                  >
                    <Trans id='Respond to Quote' />
                  </Button>
                )}
              </Box>

              {submitted && (
                <Alert severity='success' icon={<CheckCircleOutlineIcon />} sx={{ borderRadius: 2 }}>
                  Your response has been sent to the customer successfully.
                </Alert>
              )}

              {submitError && !submitted && (
                <Alert severity='error' sx={{ borderRadius: 2 }}>
                  {submitError}
                </Alert>
              )}

              {/* ── Structured Response Form ── */}
              <Collapse in={replyOpen}>
                <Card
                  elevation={0}
                  sx={{ border: '2px solid #6366f1', borderRadius: 2.5, bgcolor: alpha('#6366f1', 0.015), overflow: 'visible' }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Form header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EditNoteIcon sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          <Trans id='Send Response' />
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Fill in what applies — the customer will see a clear summary of each point
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2}>

                      {/* ── 1. Payment / COD ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <PaymentsOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>Payment</Typography>
                          <Typography variant='caption' color='text.primary' sx={{ ml: 0.5 }}>
                            — Customer requested: <strong>{getPaymentLabel(quote.payment_terms)}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ px: 2.5, py: 2 }}>
                          <RadioGroup value={confirmCOD} onChange={(e) => setConfirmCOD(e.target.value as any)}>
                            {[
                              { value: 'yes', label: 'Confirmed — payment terms accepted as requested', color: '#064e3b', bg: '#f0fdf4', border: '#10b981' },
                              { value: 'negotiate', label: 'Partially — open to discuss adjusted terms', color: '#92400e', bg: '#fffbeb', border: '#f59e0b' },
                              { value: 'no', label: 'Not available — cannot accept these payment terms', color: '#7f1d1d', bg: '#fff5f5', border: '#ef4444' },
                            ].map((opt) => (
                              <Box
                                key={opt.value}
                                onClick={() => setConfirmCOD(opt.value as any)}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 1.5,
                                  px: 1.5, py: 1.1, mb: 0.75,
                                  borderRadius: 1.5, border: '1.5px solid',
                                  borderColor: confirmCOD === opt.value ? opt.border : '#e2e8f0',
                                  bgcolor: confirmCOD === opt.value ? opt.bg : 'transparent',
                                  cursor: 'pointer', transition: 'all 0.15s',
                                }}
                              >
                                <Radio value={opt.value} size='small' sx={{ p: 0, color: confirmCOD === opt.value ? opt.border : '#94a3b8', '&.Mui-checked': { color: opt.border } }} />
                                <Typography variant='body2' sx={{ fontWeight: confirmCOD === opt.value ? 700 : 500, color: confirmCOD === opt.value ? opt.color : 'text.secondary' }}>
                                  {opt.label}
                                </Typography>
                              </Box>
                            ))}
                          </RadioGroup>
                        </Box>
                      </Box>

                      {/* ── 2. Delivery Address ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: !confirmAddress ? '1px solid #e2e8f0' : 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <HomeOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>Delivery Address</Typography>
                          </Box>
                          <FormControlLabel
                            control={<Switch checked={confirmAddress} onChange={(e) => setConfirmAddress(e.target.checked)} size='small' sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981 !important' } }} />}
                            label={<Typography variant='caption' sx={{ fontWeight: 600, color: confirmAddress ? '#064e3b' : '#92400e' }}>{confirmAddress ? 'Can deliver to this address' : 'Issue with address'}</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Box>
                        {!confirmAddress && (
                          <Box sx={{ px: 2.5, py: 2 }}>
                            <TextField size='small' fullWidth placeholder='Describe the address issue or ask for clarification…' multiline rows={2} value={addressNote} onChange={(e) => setAddressNote(e.target.value)} />
                          </Box>
                        )}
                      </Box>

                      {/* ── 3. Pricing ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: canRevisePrice ? '1px solid #e2e8f0' : 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <PriceChangeOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>Quote Price</Typography>
                            <Box sx={{ px: 1, py: 0.25, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 0.75 }}>
                              <Typography variant='caption' sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#334155' }}>₹{quote.seller_total.toLocaleString()}</Typography>
                            </Box>
                          </Box>
                          <FormControlLabel
                            control={<Switch checked={canRevisePrice} onChange={(e) => setCanRevisePrice(e.target.checked)} size='small' sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#6366f1 !important' } }} />}
                            label={<Typography variant='caption' sx={{ fontWeight: 600, color: canRevisePrice ? '#4f46e5' : '#064e3b' }}>{canRevisePrice ? 'Revising price' : 'Price confirmed'}</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Box>
                        {canRevisePrice && (
                          <Box sx={{ px: 2.5, py: 2 }}>
                            <TextField
                              size='small' label='Revised Total' value={revisedTotal}
                              onChange={(e) => setRevisedTotal(e.target.value)}
                              type='number' placeholder={String(quote.seller_total)} sx={{ maxWidth: 200 }}
                              InputProps={{ startAdornment: <InputAdornment position='start'><Typography variant='body2' color='text.secondary'>₹</Typography></InputAdornment> }}
                              helperText='New total the customer will see'
                            />
                          </Box>
                        )}
                      </Box>

                      {/* ── 4. Delivery Date ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: !confirmDelivery ? '1px solid #e2e8f0' : 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>Delivery Date</Typography>
                            <Typography variant='caption' color='text.secondary'>Requested: <strong>{formatDate(quote.delivery_date)}</strong></Typography>
                          </Box>
                          <FormControlLabel
                            control={<Switch checked={confirmDelivery} onChange={(e) => setConfirmDelivery(e.target.checked)} size='small' sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981 !important' } }} />}
                            label={<Typography variant='caption' sx={{ fontWeight: 600, color: confirmDelivery ? '#064e3b' : '#92400e' }}>{confirmDelivery ? 'Date confirmed' : 'Need to revise'}</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Box>
                        {!confirmDelivery && (
                          <Box sx={{ px: 2.5, py: 2 }}>
                            <TextField size='small' label='Our earliest delivery date' value={revisedDelivery} onChange={(e) => setRevisedDelivery(e.target.value)} type='date' sx={{ maxWidth: 220 }} InputLabelProps={{ shrink: true }} />
                          </Box>
                        )}
                      </Box>

                      {/* ── 5. Stock ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: !confirmStock ? '1px solid #e2e8f0' : 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>Stock & Availability</Typography>
                          </Box>
                          <FormControlLabel
                            control={<Switch checked={confirmStock} onChange={(e) => setConfirmStock(e.target.checked)} size='small' sx={{ '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981 !important' } }} />}
                            label={<Typography variant='caption' sx={{ fontWeight: 600, color: confirmStock ? '#064e3b' : '#92400e' }}>{confirmStock ? 'All items in stock' : 'Stock issue'}</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Box>
                        {!confirmStock && (
                          <Box sx={{ px: 2.5, py: 2 }}>
                            <TextField size='small' fullWidth placeholder='e.g. Can supply 5 units now, remaining 3 available in 2 weeks.' multiline rows={2} value={stockNote} onChange={(e) => setStockNote(e.target.value)} />
                          </Box>
                        )}
                      </Box>

                      {/* ── 6. Additional Note ── */}
                      <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <InfoOutlinedIcon sx={{ fontSize: 17, color: '#6366f1' }} />
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>Additional Note</Typography>
                          <Typography variant='caption' color='text.disabled'>(optional)</Typography>
                        </Box>
                        <Box sx={{ px: 2.5, py: 2 }}>
                          <TextField size='small' fullWidth placeholder='Special handling, warranty, bulk discount, brand clarification, etc.' multiline rows={3} value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} />
                        </Box>
                      </Box>

                      {/* ── Action row ── */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pt: 0.5 }}>
                        <TextField
                          select label='Response Action' value={responseStatus}
                          onChange={(e) => setResponseStatus(e.target.value as any)}
                          size='small' sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        >
                          <MenuItem value='replied'><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ReplyIcon sx={{ fontSize: 16, color: '#3b82f6' }} />Reply with Information</Box></MenuItem>
                          <MenuItem value='approved'><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} />Approve Quote</Box></MenuItem>
                          <MenuItem value='rejected'><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CancelOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />Reject Quote</Box></MenuItem>
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Button variant='outlined' onClick={() => setReplyOpen(false)} sx={{ borderRadius: 1.5 }}>Cancel</Button>
                          <Button
                            variant='contained' onClick={handleSubmitResponse} disabled={submitting}
                            startIcon={responseStatus === 'approved' ? <CheckCircleOutlineIcon /> : responseStatus === 'rejected' ? <CancelOutlinedIcon /> : <ReplyIcon />}
                            sx={{
                              bgcolor: responseStatus === 'approved' ? '#10b981' : responseStatus === 'rejected' ? '#ef4444' : '#6366f1',
                              '&:hover': { bgcolor: responseStatus === 'approved' ? '#059669' : responseStatus === 'rejected' ? '#dc2626' : '#4f46e5' },
                              fontWeight: 600, borderRadius: 1.5, px: 3,
                            }}
                          >
                            {submitting ? 'Sending…' : 'Send Response'}
                          </Button>
                        </Box>
                      </Box>

                    </Stack>
                  </CardContent>
                </Card>
              </Collapse>

              {/* Main Content Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Customer Details */}
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <PersonOutlineIcon sx={{ color: 'text.secondary' }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        <Trans id='Customer Details' />
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(quote.customer_name),
                          width: 52,
                          height: 52,
                          fontSize: '1rem',
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(quote.customer_name)}
                      </Avatar>
                      <Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                          {quote.customer_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant='body2' color='text.secondary'>
                            {quote.mobile_number}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Order Info */}
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                      <ReceiptLongIcon sx={{ color: 'text.secondary' }} />
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        <Trans id='Order Information' />
                      </Typography>
                    </Box>

                    <InfoRow label='Order Number' value={`#${quote.order_number}`} />
                    <Divider sx={{ my: 0.5, opacity: 0.4 }} />
                    <InfoRow label='Payment Terms' value={getPaymentLabel(quote.payment_terms)} />
                    <Divider sx={{ my: 0.5, opacity: 0.4 }} />
                    <InfoRow
                      label='Requested Delivery'
                      value={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalShippingIcon sx={{ fontSize: 14 }} />
                          {formatDate(quote.delivery_date)}
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 0.5, opacity: 0.4 }} />
                    <InfoRow label='Quote Total' value={`₹${quote.seller_total.toLocaleString()}`} />
                  </CardContent>
                </Card>
              </Box>

              {/* Additional Notes */}
              {quote.additional_notes && (
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: alpha('#f59e0b', 0.4),
                    borderRadius: 2,
                    bgcolor: alpha('#f59e0b', 0.03),
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
                      <Trans id='Customer Notes' />
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                      {quote.additional_notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* ── Quote Response Thread ── */}
              {quote.quote_responses && quote.quote_responses.length > 0 && (
                <QuoteResponsesThread
                  responses={quote.quote_responses}
                  customerName={quote.customer_name}
                />
              )}

              {/* Items Section */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Section header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2.5,
                    }}
                  >
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                      <Trans id='Quoted Items' />
                    </Typography>
                    {quote.items.length > 0 && (
                      <Typography
                        variant='caption'
                        sx={{
                          px: 1.25,
                          py: 0.4,
                          bgcolor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: 1,
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        {quote.items.length} item{quote.items.length > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>

                  {quote.items.length === 0 ? (
                    <Box
                      sx={{
                        py: 5,
                        textAlign: 'center',
                        bgcolor: '#f8fafc',
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant='body2' color='text.secondary'>
                        No items attached to this quote
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={0}>
                      {/* Column headers */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 120px 120px',
                          px: 2,
                          py: 1,
                          bgcolor: '#f8fafc',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '8px 8px 0 0',
                        }}
                      >
                        {['Product', 'Qty', 'Unit Price', 'Line Total'].map((col, i) => (
                          <Typography
                            key={col}
                            variant='caption'
                            sx={{
                              fontWeight: 700,
                              color: 'text.secondary',
                              fontSize: '0.68rem',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              textAlign: i > 0 ? 'right' : 'left',
                            }}
                          >
                            {col}
                          </Typography>
                        ))}
                      </Box>

                      {/* Item rows */}
                      {quote.items.map((item: any, idx: number) => (
                        <Box
                          key={item.item_id}
                          sx={{
                            border: '1px solid',
                            borderTop: 'none',
                            borderColor: 'divider',
                            borderRadius: idx === quote.items.length - 1 ? '0 0 8px 8px' : 0,
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#fafafa' },
                            transition: 'background 0.1s',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 80px 120px 120px',
                              alignItems: 'center',
                              px: 2,
                              py: 2,
                              gap: 1,
                            }}
                          >
                            {/* Product identity */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                              <Box
                                sx={{
                                  width: 72, height: 72, borderRadius: 1.5,
                                  border: '1px solid', borderColor: 'divider',
                                  overflow: 'hidden', flexShrink: 0,
                                  bgcolor: '#f8fafc', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                {item.image_url ? (
                                  <Box
                                    component='img'
                                    src={item.image_url}
                                    alt={item.name}
                                    onError={(e: any) => { e.currentTarget.style.display = 'none' }}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <ReceiptLongIcon sx={{ fontSize: 24, color: '#cbd5e1' }} />
                                )}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.5, color: 'text.primary', mb: 0.75 }}>
                                  {item.name}
                                </Typography>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 0.75 }}>
                                  <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#64748b', letterSpacing: '0.02em' }}>
                                    SKU: {item.sku}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Qty */}
                            <Box sx={{ textAlign: 'right' }}>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 28, px: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: '#f8fafc' }}>
                                <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.qty}</Typography>
                              </Box>
                            </Box>

                            {/* Unit Price */}
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                ₹{item.price.toLocaleString()}
                              </Typography>
                            </Box>

                            {/* Line Total */}
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                                ₹{item.row_total.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>

                          {idx < quote.items.length - 1 && <Divider sx={{ mx: 2, opacity: 0.6 }} />}
                        </Box>
                      ))}

                      {/* Quote Total footer */}
                      <Box
                        sx={{
                          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                          gap: 3, mt: 2, pt: 2, borderTop: '2px solid', borderColor: 'divider', px: 1,
                        }}
                      >
                        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                          Quote Total
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.3px', color: 'text.primary' }}>
                          ₹{quote.seller_total.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}
        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

SellerQuoteDetailPage.pageOptions = pageOptions
export default SellerQuoteDetailPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)

  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  return {
    props: {
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
  }
}