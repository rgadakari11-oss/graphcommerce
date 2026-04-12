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
  alpha,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import StorefrontIcon from '@mui/icons-material/Storefront'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead'
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import PersonIcon from '@mui/icons-material/Person'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@graphcommerce/graphql'
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'

import type { LayoutNavigationProps } from '../../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../../components'
import { AccountLayout } from '../../../../components/account/AccountLayout'
import { getMobileNumber } from '../../../../lib/utils/getMobileNumber'
import { graphqlSharedClient, graphqlSsrClient } from '../../../../lib/graphql/graphqlSsrClient'

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const CUSTOMER_QUOTES_QUERY = gql`
  query CustomerQuoteDetail($mobile_number: String!) {
    customerSellerOrders(mobile_number: $mobile_number) {
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

const CUSTOMER_RESPOND_MUTATION = gql`
  mutation CUSTOMER_RESPOND_MUTATION ($input: RespondQuoteInput!) {
    respondQuote(input: $input) {
      success
      message
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteItem = {
  item_id: number; name: string; sku: string; qty: number
  price: number; row_total: number; seller_id: number; image_url: string
}

type QuoteResponse = {
  entity_id: number; order_id: number; seller_id: number
  actor_type: 'seller' | 'customer'; response_type: string; mobile_number: string
  payment_status: string; payment_note: string
  address_status: string; address_note: string
  price_status: string; original_price: number; revised_price: number | null; price_note: string
  delivery_status: string; requested_delivery_date: string | null
  revised_delivery_date: string | null; delivery_note: string
  stock_status: string; stock_note: string
  seller_message: string | null; additional_note: string
  created_at: string; updated_at: string
}

type SellerOrder = {
  order_id: number; order_number: string; seller_id: number; seller_total: number
  status: string; created_at: string; customer_name: string; mobile_number: string
  delivery_date: string; payment_terms: string; additional_notes: string
  items: QuoteItem[]; quote_responses: QuoteResponse[]
}

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_MAP: Record<string, string> = {
  'net-30': 'Net 30 Days', 'net-60': 'Net 60 Days', 'net-90': 'Net 90 Days',
  cod: 'Cash on Delivery', prepaid: 'Prepaid', installment: 'Installment',
}

function formatDate(d: string) {
  try { const dt = new Date(d); if (isNaN(dt.getTime())) return '—'; return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '—' }
}
function formatDateTime(d: string) {
  try { return new Date(d).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d }
}
function getInitials(name: string) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) }
const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { color: string; bg: string; label: string; Icon: React.ElementType }> = {
  pending: { color: '#92400e', bg: '#fef3c7', label: 'Waiting for Seller Response', Icon: HourglassEmptyIcon },
  replied: { color: '#1e3a5f', bg: '#dbeafe', label: 'Seller Responded - Awaiting Your Approval', Icon: MarkChatReadIcon },
  approved: { color: '#064e3b', bg: '#d1fae5', label: 'Approved', Icon: CheckCircleIcon },
  rejected: { color: '#7f1d1d', bg: '#fee2e2', label: 'Rejected', Icon: CancelIcon },
  call: { color: '#4c1d95', bg: '#ede9fe', label: 'Settling on Call', Icon: PhoneCallbackIcon },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { color: '#334155', bg: '#f1f5f9', label: status, Icon: HourglassEmptyIcon }
  const { Icon } = cfg
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.4, py: 0.5, borderRadius: 1.5, bgcolor: cfg.bg, border: `1px solid ${alpha(cfg.color, 0.22)}` }}>
      <Icon sx={{ fontSize: 13, color: cfg.color }} />
      <Typography variant='caption' sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{cfg.label}</Typography>
    </Box>
  )
}

// ─── Field badge ─────────────────────────────────────────────────────────────

function FieldBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    confirmed: { color: '#064e3b', bg: '#f0fdf4', label: 'Confirmed' },
    negotiable: { color: '#92400e', bg: '#fffbeb', label: 'Negotiable' },
    rejected: { color: '#7f1d1d', bg: '#fff5f5', label: 'Rejected' },
    issue: { color: '#92400e', bg: '#fffbeb', label: 'Issue Raised' },
    revised: { color: '#1e3a8a', bg: '#eff6ff', label: 'Revised' },
    available: { color: '#064e3b', bg: '#f0fdf4', label: 'In Stock' },
    partial: { color: '#92400e', bg: '#fffbeb', label: 'Partial Stock' },
    approved: { color: '#064e3b', bg: '#f0fdf4', label: 'Approved' },
    replied: { color: '#1e3a8a', bg: '#eff6ff', label: 'Reply Sent' },
  }
  const cfg = map[status] ?? { color: '#374151', bg: '#f3f4f6', label: status }
  return (
    <Box component='span' sx={{ display: 'inline-block', px: 1, py: 0.2, borderRadius: 0.75, bgcolor: cfg.bg, color: cfg.color, fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.03em', border: '1px solid', borderColor: alpha(cfg.color, 0.2), lineHeight: 1.6 }}>
      {cfg.label}
    </Box>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.25, '&:not(:last-child)': { borderBottom: '1px solid #f1f5f9' } }}>
      <Box sx={{ color: '#94a3b8', mt: 0.1, flexShrink: 0, width: 18, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 130, fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
      <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
    </Box>
  )
}

// ─── Response bubble ──────────────────────────────────────────────────────────

function ResponseBubble({ response, customerName }: { response: QuoteResponse; customerName: string }) {
  const isSeller = response.actor_type === 'seller'
  const rows: { icon: React.ReactNode; label: string; status: string; note?: string; extra?: React.ReactNode }[] = []

  if (response.payment_status) rows.push({ icon: <PaymentsOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Payment', status: response.payment_status, note: response.payment_note || undefined })
  if (response.address_status) rows.push({ icon: <HomeOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Address', status: response.address_status, note: response.address_note || undefined })
  if (response.price_status) rows.push({
    icon: <PriceChangeOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Price', status: response.price_status, note: response.price_note || undefined,
    extra: response.price_status === 'revised' && response.revised_price != null ? (
      <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.15, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 0.75, ml: 0.75 }}>
        <Typography variant='caption' sx={{ fontWeight: 700, color: '#1e40af', fontFamily: 'monospace', fontSize: '0.72rem' }}>₹{response.revised_price.toLocaleString()}</Typography>
      </Box>
    ) : null,
  })
  if (response.delivery_status) rows.push({
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Delivery', status: response.delivery_status, note: response.delivery_note || undefined,
    extra: response.revised_delivery_date ? <Typography variant='caption' sx={{ ml: 0.75, color: '#92400e', fontWeight: 600, fontSize: '0.72rem' }}>→ {formatDate(response.revised_delivery_date)}</Typography> : null,
  })
  if (response.stock_status) rows.push({ icon: <InventoryOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Stock', status: response.stock_status, note: response.stock_note || undefined })

  return (
    <Box sx={{ display: 'flex', flexDirection: isSeller ? 'row' : 'row-reverse', gap: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isSeller ? '#6366f1' : avatarColor(customerName), border: '2px solid', borderColor: isSeller ? alpha('#6366f1', 0.3) : alpha(avatarColor(customerName), 0.3) }}>
          {isSeller
            ? <StorefrontIcon sx={{ fontSize: 18, color: '#fff' }} />
            : <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{getInitials(customerName)}</Typography>
          }
        </Box>
        <Typography variant='caption' sx={{ fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600 }}>{isSeller ? 'Seller' : 'You'}</Typography>
      </Box>

      <Box sx={{ maxWidth: '82%', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6, flexDirection: isSeller ? 'row' : 'row-reverse' }}>
          <FieldBadge status={response.response_type} />
          <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>{formatDateTime(response.created_at)}</Typography>
        </Box>
        <Box sx={{ border: '1px solid', borderColor: isSeller ? alpha('#6366f1', 0.2) : '#e2e8f0', borderRadius: isSeller ? '2px 12px 12px 12px' : '12px 2px 12px 12px', bgcolor: isSeller ? alpha('#6366f1', 0.03) : '#f8fafc', overflow: 'hidden' }}>
          {rows.length > 0 && (
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Stack spacing={0.6}>
                {rows.map((row, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75, px: 1.25, bgcolor: '#fff', border: '1px solid #f1f5f9', borderRadius: 1 }}>
                    <Box sx={{ color: '#94a3b8', mt: 0.15, flexShrink: 0 }}>{row.icon}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: row.note ? 0.3 : 0 }}>
                        <Typography variant='caption' sx={{ fontWeight: 700, color: '#475569', minWidth: 52, fontSize: '0.72rem' }}>{row.label}</Typography>
                        <FieldBadge status={row.status} />
                        {row.extra}
                      </Box>
                      {row.note && <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, display: 'block', fontSize: '0.72rem' }}>{row.note}</Typography>}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          {response.additional_note && (
            <Box sx={{ px: 2, py: 1.25, borderTop: rows.length > 0 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <InfoOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', mt: 0.25, flexShrink: 0 }} />
              <Typography variant='body2' color='text.primary' sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>{response.additional_note}</Typography>
            </Box>
          )}
          {response.seller_message && !response.additional_note && rows.length === 0 && (
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>{response.seller_message}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ item }: { item: QuoteItem }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '48px 1fr 56px 100px 110px', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, '&:not(:last-child)': { borderBottom: '1px solid #f1f5f9' } }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {item.image_url
          ? <Box component='img' src={item.image_url} alt={item.name} onError={(e: any) => { e.currentTarget.style.display = 'none' }} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <ReceiptLongIcon sx={{ fontSize: 18, color: '#cbd5e1' }} />
        }
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4, mb: 0.4 }}>{item.name}</Typography>
        <Box sx={{ display: 'inline-flex', px: 0.75, py: 0.15, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 0.5 }}>
          <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.63rem', color: '#64748b' }}>SKU: {item.sku}</Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Qty</Typography>
        <Typography variant='body2' sx={{ fontWeight: 700 }}>{item.qty}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Unit Price</Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>₹{item.price.toLocaleString()}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Line Total</Typography>
        <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>₹{item.row_total.toLocaleString()}</Typography>
      </Box>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CustomerQuoteDetailPage() {
  const router = useRouter()
  const { order_id, seller_id } = router.query
  const orderId = Number(order_id)
  const sellerId = Number(seller_id)

  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })
  const customer = customerQuery.data?.customer
  const mobileNumber = getMobileNumber()
  //const mobileNumber = '8652613468'

  const { data, loading, error, refetch } = useQuery(CUSTOMER_QUOTES_QUERY, {
    variables: { mobile_number: mobileNumber },
    skip: !mobileNumber,
    fetchPolicy: 'cache-and-network',
  })

  const [customerRespond] = useMutation(CUSTOMER_RESPOND_MUTATION)

  const sellerOrder: SellerOrder | undefined = data?.customerSellerOrders?.find(
    (o: SellerOrder) => o.order_id === orderId && o.seller_id === sellerId,
  )

  const sellerResponses = (sellerOrder?.quote_responses ?? [])
    .filter((r) => r.actor_type === 'seller')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const latestSeller = sellerResponses[0]
  const hasRevised = latestSeller?.price_status === 'revised' && latestSeller?.revised_price != null
  const displayTotal = hasRevised ? latestSeller!.revised_price! : (sellerOrder?.seller_total ?? 0)
  const hasResponses = (sellerOrder?.quote_responses?.length ?? 0) > 0
  const sortedResponses = [...(sellerOrder?.quote_responses ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const [localStatus, setLocalStatus] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectOther, setRejectOther] = useState('')
  const [acting, setActing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const currentStatus = localStatus ?? sellerOrder?.status ?? 'pending'
  const canAct = hasResponses && sellerResponses.length > 0 && !['approved', 'rejected', 'call'].includes(currentStatus)

  const handleAction = async (action: 'approved' | 'rejected' | 'call', reason?: string) => {
    setActing(true); setActionError(''); setActionSuccess('')
    try {
      await customerRespond({ variables: { input: { order_id: orderId, seller_id: sellerId, mobile_number: mobileNumber, actor_type: 'customer', response_type: action, additional_note: reason ?? '' } } })
      setLocalStatus(action)
      const msgs = { approved: 'Quote approved! The seller will proceed with your order.', rejected: 'Quote rejected. The seller has been notified.', call: 'Noted! The seller will call you shortly to finalize the terms.' }
      setActionSuccess(msgs[action])
      await refetch()
    } catch (e: any) {
      setActionError(e?.message || 'Action failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Quote Details')} metaRobots={['noindex']} />
      <AccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* Breadcrumb */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link underline='hover' color='inherit' sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); router.push('/account/quotes') }}>
              <ArrowBackIcon sx={{ fontSize: 15 }} />
              <Typography variant='body2'>My Quotes</Typography>
            </Link>
            <Typography variant='body2' color='text.primary' fontWeight={600}>
              {loading ? 'Loading…' : sellerOrder ? `#${sellerOrder.order_number}` : `Order #${order_id}`}
            </Typography>
          </Breadcrumbs>

          {/* Loading */}
          {loading && !data && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
              <CircularProgress size={28} /><Typography color='text.secondary'>Loading quote details…</Typography>
            </Box>
          )}

          {error && <Alert severity='error' sx={{ borderRadius: 2 }}>Failed to load quote. Please refresh and try again.</Alert>}

          {!loading && !sellerOrder && !error && (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <RequestQuoteIcon sx={{ fontSize: 52, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }} />
              <Typography variant='h6' color='text.secondary' sx={{ mb: 0.5 }}>Quote not found</Typography>
              <Button variant='outlined' sx={{ mt: 1, borderRadius: 1.5 }} onClick={() => router.push('/account/quotes')}>Back to My Quotes</Button>
            </Box>
          )}

          {sellerOrder && (
            <Stack spacing={3}>

              {/* ── Page header ── */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
                      Quote #{sellerOrder.order_number}
                    </Typography>
                    <StatusBadge status={currentStatus} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant='caption' color='text.secondary'>Submitted on {formatDateTime(sellerOrder.created_at)}</Typography>
                  </Box>
                </Box>
                {/* Seller pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StorefrontIcon sx={{ fontSize: 17, color: '#475569' }} />
                  </Box>
                  <Box>
                    <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.62rem', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seller</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>Seller #{sellerOrder.seller_id}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Alerts */}
              {actionSuccess && (
                <Alert severity={currentStatus === 'rejected' ? 'error' : currentStatus === 'call' ? 'info' : 'success'} sx={{ borderRadius: 2 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{actionSuccess}</Typography>
                </Alert>
              )}
              {actionError && <Alert severity='error' sx={{ borderRadius: 2 }}>{actionError}</Alert>}

              {/* ── Two-column grid ── */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3, alignItems: 'start' }}>

                {/* ── LEFT: details ── */}
                <Stack spacing={3}>

                  {/* Order summary */}
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.75, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <RequestQuoteIcon sx={{ fontSize: 18, color: '#64748b' }} />
                      <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Order Summary</Typography>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <InfoRow icon={<ReceiptLongIcon sx={{ fontSize: 16 }} />} label='Order Number' value={<Box component='span' sx={{ fontFamily: 'monospace' }}>#{sellerOrder.order_number}</Box>} />
                      <InfoRow icon={<PaymentsOutlinedIcon sx={{ fontSize: 16 }} />} label='Payment Terms' value={PAYMENT_MAP[sellerOrder.payment_terms] || sellerOrder.payment_terms} />
                      <InfoRow icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} label='Requested Delivery' value={formatDate(sellerOrder.delivery_date)} />
                      <InfoRow
                        icon={<PriceChangeOutlinedIcon sx={{ fontSize: 16 }} />}
                        label='Quote Total'
                        value={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {hasRevised && <Typography component='span' sx={{ color: 'text.disabled', textDecoration: 'line-through', fontWeight: 400, fontSize: '0.85rem' }}>₹{sellerOrder.seller_total.toLocaleString()}</Typography>}
                            <Typography component='span' sx={{ fontWeight: 800, color: hasRevised ? '#064e3b' : 'text.primary', fontSize: '1rem' }}>₹{displayTotal.toLocaleString()}</Typography>
                            {hasRevised && <Box component='span' sx={{ px: 0.75, py: 0.15, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 0.75, fontSize: '0.65rem', fontWeight: 700, color: '#064e3b' }}>Revised</Box>}
                          </Box>
                        }
                      />
                      {sellerOrder.additional_notes && (
                        <InfoRow icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />} label='Your Note' value={<Typography component='span' sx={{ fontStyle: 'italic', color: 'text.primary', fontWeight: 400 }}>"{sellerOrder.additional_notes}"</Typography>} />
                      )}
                    </CardContent>
                  </Card>

                  {/* Items */}
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.75, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <ReceiptLongIcon sx={{ fontSize: 18, color: '#64748b' }} />
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Quoted Items</Typography>
                      </Box>
                      {sellerOrder.items.length > 0 && (
                        <Box sx={{ px: 1.25, py: 0.3, bgcolor: '#e2e8f0', borderRadius: 1, fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                          {sellerOrder.items.length} item{sellerOrder.items.length !== 1 ? 's' : ''}
                        </Box>
                      )}
                    </Box>
                    {sellerOrder.items.length === 0 ? (
                      <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography variant='body2' color='text.disabled' sx={{ fontStyle: 'italic' }}>No items attached</Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '48px 1fr 56px 100px 110px', gap: 2, px: 2.5, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                          {['', 'Product', 'Qty', 'Unit Price', 'Line Total'].map((col, i) => (
                            <Typography key={i} variant='caption' sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i > 2 ? 'right' : 'left' }}>{col}</Typography>
                          ))}
                        </Box>
                        {sellerOrder.items.map((item) => <ProductRow key={item.item_id} item={item} />)}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2.5, px: 2.5, py: 2, borderTop: '2px solid #f1f5f9', bgcolor: '#fafafa' }}>
                          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>Quote Total</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {hasRevised && <Typography variant='body2' sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>₹{sellerOrder.seller_total.toLocaleString()}</Typography>}
                            <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.3px', color: hasRevised ? '#064e3b' : 'text.primary' }}>₹{displayTotal.toLocaleString()}</Typography>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Card>

                  {/* Response thread — always open on detail page */}
                  {hasResponses && (
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: alpha('#6366f1', 0.2), borderRadius: 2.5, overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 1.75, bgcolor: alpha('#6366f1', 0.04), borderBottom: '1px solid', borderBottomColor: alpha('#6366f1', 0.12) }}>
                        <ForumOutlinedIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#4f46e5' }}>Response Thread</Typography>
                        <Box sx={{ ml: 0.5, px: 1, py: 0.15, bgcolor: '#6366f1', borderRadius: 5 }}>
                          <Typography variant='caption' sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}>{sortedResponses.length}</Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <StorefrontIcon sx={{ fontSize: 9, color: '#fff' }} />
                            </Box>
                            <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>Seller</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: avatarColor(sellerOrder.customer_name), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <PersonIcon sx={{ fontSize: 9, color: '#fff' }} />
                            </Box>
                            <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>You</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ px: 2.5, py: 2.5 }}>
                        <Stack spacing={3}>
                          {sortedResponses.map((r, i) => (
                            <ResponseBubble key={r.entity_id ?? i} response={r} customerName={sellerOrder.customer_name} />
                          ))}
                        </Stack>
                      </Box>
                    </Card>
                  )}

                  {/* No responses yet */}
                  {!hasResponses && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#fffbeb', border: '1px solid', borderColor: alpha('#f59e0b', 0.3), borderRadius: 2 }}>
                      <HourglassEmptyIcon sx={{ color: '#92400e', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant='body2' sx={{ color: '#92400e', fontWeight: 500, lineHeight: 1.6 }}>Waiting for the seller to review and respond to your quote request.</Typography>
                    </Box>
                  )}
                </Stack>

                {/* ── RIGHT: sticky decision panel ── */}
                <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
                  <Card elevation={0} sx={{ border: '2px solid', borderColor: canAct ? '#6366f1' : 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                    <Box sx={{ px: 2.5, py: 2, bgcolor: canAct ? alpha('#6366f1', 0.04) : '#f8fafc', borderBottom: '1px solid', borderBottomColor: canAct ? alpha('#6366f1', 0.15) : '#f1f5f9' }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 0.25 }}>Your Decision</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {canAct ? "Review the seller's response and choose how to proceed."
                          : currentStatus === 'pending' ? 'Waiting for the seller to respond before you can act.'
                            : 'You have already responded to this quote.'}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2.5 }}>
                      <Stack spacing={2}>

                        {/* Latest seller offer summary */}
                        {latestSeller && (
                          <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.25 }}>Latest Seller Offer</Typography>
                            <Stack spacing={0.85}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>Price</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <FieldBadge status={latestSeller.price_status} />
                                  {hasRevised && <Typography variant='caption' sx={{ fontWeight: 700, color: '#064e3b', fontFamily: 'monospace' }}>₹{latestSeller.revised_price?.toLocaleString()}</Typography>}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>Payment</Typography>
                                <FieldBadge status={latestSeller.payment_status} />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>Delivery</Typography>
                                <FieldBadge status={latestSeller.delivery_status} />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>Stock</Typography>
                                <FieldBadge status={latestSeller.stock_status} />
                              </Box>
                            </Stack>
                          </Box>
                        )}

                        {/* Action buttons */}
                        {canAct && (
                          <Stack spacing={1.25}>
                            <Button fullWidth variant='contained' size='large'
                              startIcon={acting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CheckCircleOutlineIcon />}
                              disabled={acting} onClick={() => handleAction('approved')}
                              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700, borderRadius: 1.75, py: 1.5, fontSize: '0.9rem', textTransform: 'none', boxShadow: `0 4px 14px ${alpha('#10b981', 0.35)}` }}
                            >
                              Approve Quote
                            </Button>
                            <Button fullWidth variant='outlined' size='large'
                              startIcon={<PhoneCallbackIcon />} disabled={acting} onClick={() => setCallOpen(true)}
                              sx={{ borderColor: '#3b82f6', color: '#1e3a5f', '&:hover': { bgcolor: alpha('#3b82f6', 0.05), borderColor: '#2563eb' }, fontWeight: 700, borderRadius: 1.75, py: 1.5, fontSize: '0.9rem', textTransform: 'none' }}
                            >
                              Settle on Call
                            </Button>
                            <Button fullWidth variant='text' size='large'
                              startIcon={<CancelOutlinedIcon />} disabled={acting} onClick={() => setRejectOpen(true)}
                              sx={{ color: '#dc2626', '&:hover': { bgcolor: alpha('#ef4444', 0.06) }, fontWeight: 600, borderRadius: 1.75, py: 1.25, fontSize: '0.85rem', textTransform: 'none' }}
                            >
                              Reject Quote
                            </Button>
                          </Stack>
                        )}

                        {/* Already acted */}
                        {!canAct && !['pending'].includes(currentStatus) && (
                          <Box sx={{ textAlign: 'center', py: 1 }}>
                            <StatusBadge status={currentStatus} />
                            <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 1, fontSize: '0.72rem' }}>
                              {currentStatus === 'approved' && 'You approved this quote.'}
                              {currentStatus === 'rejected' && 'You rejected this quote.'}
                              {currentStatus === 'call' && 'You requested a call to negotiate.'}
                            </Typography>
                          </Box>
                        )}

                        {/* Pending - no seller response */}
                        {currentStatus === 'pending' && !hasResponses && (
                          <Box sx={{ textAlign: 'center', py: 1 }}>
                            <HourglassEmptyIcon sx={{ fontSize: 28, color: '#f59e0b', display: 'block', mx: 'auto', mb: 0.75 }} />
                            <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>Actions will be available once the seller responds.</Typography>
                          </Box>
                        )}

                        <Divider sx={{ opacity: 0.5 }} />

                        <Button fullWidth variant='text' startIcon={<ArrowBackIcon />}
                          onClick={() => router.push('/account/quotes')}
                          sx={{ color: 'text.secondary', fontWeight: 600, borderRadius: 1.5, textTransform: 'none', py: 1 }}
                        >
                          Back to My Quotes
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Box>

              </Box>
            </Stack>
          )}

          {/* ── Reject dialog ── */}
          <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Reject This Quote</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>Help the seller understand why this quote didn't work for you.</Typography>
              <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>Select a reason</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                {['Price is too high', "Delivery date doesn't work", 'Found a better offer', "Product specs don't match", 'Payment terms not suitable', 'No longer needed', 'Other'].map((reason) => (
                  <Box key={reason} onClick={() => setRejectReason(reason)}
                    sx={{ px: 1.5, py: 0.6, borderRadius: 5, border: '1.5px solid', borderColor: rejectReason === reason ? '#dc2626' : '#e2e8f0', bgcolor: rejectReason === reason ? '#fff5f5' : '#f8fafc', color: rejectReason === reason ? '#dc2626' : '#475569', fontWeight: rejectReason === reason ? 700 : 500, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none', '&:hover': { borderColor: '#dc2626', bgcolor: '#fff5f5', color: '#dc2626' } }}>
                    <Typography variant='caption' sx={{ fontWeight: 'inherit', color: 'inherit', fontSize: 'inherit' }}>{reason}</Typography>
                  </Box>
                ))}
              </Box>
              {rejectReason === 'Other' && (
                <TextField multiline rows={3} fullWidth size='small' placeholder="Tell the seller more about why this quote didn't work…" value={rejectOther} onChange={(e) => setRejectOther(e.target.value)} autoFocus />
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button variant='outlined' onClick={() => { setRejectOpen(false); setRejectReason(''); setRejectOther('') }} sx={{ borderRadius: 1.5 }}>Cancel</Button>
              <Button variant='contained'
                disabled={!rejectReason || (rejectReason === 'Other' && !rejectOther.trim()) || acting}
                onClick={() => { const r = rejectReason === 'Other' ? rejectOther.trim() : rejectReason; setRejectOpen(false); handleAction('rejected', r) }}
                sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, '&.Mui-disabled': { bgcolor: '#fca5a5', color: '#fff' }, borderRadius: 1.5, fontWeight: 600 }}
              >
                Confirm Rejection
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Call dialog ── */}
          <Dialog open={callOpen} onClose={() => setCallOpen(false)} maxWidth='xs' fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Settle on a Call</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, bgcolor: '#f0f9ff', borderRadius: 1.5, mb: 2 }}>
                <PhoneCallbackIcon sx={{ color: '#1e3a5f', fontSize: 22, mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.3 }}>Seller #{sellerOrder?.seller_id} will call you to negotiate.</Typography>
                  <Typography variant='caption' color='text.secondary'>They'll reach you at: <strong>{sellerOrder?.mobile_number}</strong></Typography>
                </Box>
              </Box>
              <Typography variant='body2' color='text.secondary'>By confirming, you're letting the seller know you prefer to negotiate the terms over a phone call.</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button variant='outlined' onClick={() => setCallOpen(false)} sx={{ borderRadius: 1.5 }}>Cancel</Button>
              <Button variant='contained' disabled={acting} onClick={() => { setCallOpen(false); handleAction('call') }}
                sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#1e40af' }, borderRadius: 1.5, fontWeight: 600 }}>
                {acting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm'}
              </Button>
            </DialogActions>
          </Dialog>

        </WaitForCustomer>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

CustomerQuoteDetailPage.pageOptions = pageOptions
export default CustomerQuoteDetailPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  return {
    props: {
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
  }
}