import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Typography,
  alpha,
  Stack,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead'
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import PersonIcon from '@mui/icons-material/Person'
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, gql } from '@graphcommerce/graphql'
import { useRouter } from 'next/router'

import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { AccountLayout } from '../../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'
import { getMobileNumber } from '../../../lib/utils/getMobileNumber'

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const CUSTOMER_QUOTES_QUERY = gql`
  query CustomerQuotes($mobile_number: String!) {
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
  mutation CustomerRespondQuote($input: CustomerRespondQuoteInput!) {
    customerRespondQuote(input: $input) {
      success
      message
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteItem = {
  item_id: number
  name: string
  sku: string
  qty: number
  price: number
  row_total: number
  seller_id: number
  image_url: string
}

type QuoteResponse = {
  entity_id: number
  order_id: number
  seller_id: number
  actor_type: 'seller' | 'customer'
  response_type: string
  mobile_number: string
  payment_status: string
  payment_note: string
  address_status: string
  address_note: string
  price_status: string
  original_price: number
  revised_price: number | null
  price_note: string
  delivery_status: string
  requested_delivery_date: string | null
  revised_delivery_date: string | null
  delivery_note: string
  stock_status: string
  stock_note: string
  seller_message: string | null
  additional_note: string
  created_at: string
  updated_at: string
}

type SellerOrder = {
  order_id: number
  order_number: string
  seller_id: number
  seller_total: number
  status: string
  created_at: string
  customer_name: string
  mobile_number: string
  delivery_date: string
  payment_terms: string
  additional_notes: string
  items: QuoteItem[]
  quote_responses: QuoteResponse[]
}

type GroupedOrder = {
  order_id: number
  order_number: string
  created_at: string
  delivery_date: string
  payment_terms: string
  additional_notes: string
  customer_name: string
  mobile_number: string
  sellerOrders: SellerOrder[]
}

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { color: string; bg: string; dot: string; label: string; Icon: React.ElementType }> = {
  pending: { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b', label: 'Waiting for Seller Response', Icon: HourglassEmptyIcon },
  replied: { color: '#1e3a5f', bg: '#dbeafe', dot: '#3b82f6', label: 'Seller Responded – Action Needed', Icon: MarkChatReadIcon },
  approved: { color: '#064e3b', bg: '#d1fae5', dot: '#10b981', label: 'Approved', Icon: CheckCircleIcon },
  rejected: { color: '#7f1d1d', bg: '#fee2e2', dot: '#ef4444', label: 'Rejected', Icon: CancelIcon },
  call: { color: '#4c1d95', bg: '#ede9fe', dot: '#8b5cf6', label: 'Settling on Call', Icon: PhoneCallbackIcon },
}

const PAYMENT_MAP: Record<string, string> = {
  'net-30': 'Net 30', 'net-60': 'Net 60', 'net-90': 'Net 90',
  cod: 'Cash on Delivery', prepaid: 'Prepaid', installment: 'Installment',
}

const FIELD_BADGE_CFG: Record<string, { color: string; bg: string; label: string }> = {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    const date = new Date(String(d).endsWith('Z') ? d : d + 'Z')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
  } catch { return '—' }
}

function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    const date = new Date(String(d).endsWith('Z') ? d : d + 'Z')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const h = date.getUTCHours().toString().padStart(2, '0')
    const m = date.getUTCMinutes().toString().padStart(2, '0')
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${h}:${m}`
  } catch { return String(d) }
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']
function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function groupByOrder(orders: SellerOrder[]): GroupedOrder[] {
  const map = new Map<number, GroupedOrder>()
  for (const o of orders) {
    if (!map.has(o.order_id)) {
      map.set(o.order_id, {
        order_id: o.order_id,
        order_number: o.order_number,
        created_at: o.created_at,
        delivery_date: o.delivery_date,
        payment_terms: o.payment_terms,
        additional_notes: o.additional_notes,
        customer_name: o.customer_name,
        mobile_number: o.mobile_number,
        sellerOrders: [],
      })
    }
    map.get(o.order_id)!.sellerOrders.push(o)
  }
  return Array.from(map.values()).sort((a, b) => b.order_id - a.order_id)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { color: '#334155', bg: '#f1f5f9', dot: '#94a3b8', label: status, Icon: HourglassEmptyIcon }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 6,
      background: cfg.bg, border: `1px solid ${cfg.color}33`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
    </span>
  )
}

function FieldBadge({ status }: { status: string }) {
  const cfg = FIELD_BADGE_CFG[status] ?? { color: '#374151', bg: '#f3f4f6', label: status }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
      background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700,
      border: `1px solid ${cfg.color}33`, letterSpacing: '0.03em', lineHeight: 1.6,
    }}>{cfg.label}</span>
  )
}

function ResponseBubble({ response, customerName }: { response: QuoteResponse; customerName: string }) {
  const isSeller = response.actor_type === 'seller'

  const rows: { icon: React.ReactNode; label: string; status: string; note?: string; extra?: React.ReactNode }[] = []

  if (response.payment_status) rows.push({ icon: <PaymentsOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Payment', status: response.payment_status, note: response.payment_note || undefined })
  if (response.address_status) rows.push({ icon: <HomeOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Address', status: response.address_status, note: response.address_note || undefined })
  if (response.price_status) rows.push({
    icon: <PriceChangeOutlinedIcon sx={{ fontSize: 13 }} />,
    label: 'Price',
    status: response.price_status,
    note: response.price_note || undefined,
    extra: response.price_status === 'revised' && response.revised_price != null ? (
      <span style={{ marginLeft: 6, padding: '1px 6px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, fontSize: 11, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>
        ₹{String(response.revised_price)}
      </span>
    ) : null,
  })
  if (response.delivery_status) rows.push({
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} />,
    label: 'Delivery',
    status: response.delivery_status,
    note: response.delivery_note || undefined,
    extra: response.revised_delivery_date ? (
      <span style={{ marginLeft: 6, fontSize: 11, color: '#92400e', fontWeight: 600 }}>→ {formatDate(response.revised_delivery_date)}</span>
    ) : null,
  })
  if (response.stock_status) rows.push({ icon: <InventoryOutlinedIcon sx={{ fontSize: 13 }} />, label: 'Stock', status: response.stock_status, note: response.stock_note || undefined })

  return (
    <div style={{ display: 'flex', flexDirection: isSeller ? 'row' : 'row-reverse', gap: 12, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: isSeller ? '#6366f1' : avatarColor(customerName),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isSeller ? 14 : 11, fontWeight: 700, color: '#fff',
          border: `2px solid ${isSeller ? '#6366f133' : avatarColor(customerName) + '33'}`,
        }}>
          {isSeller ? <StorefrontIcon sx={{ fontSize: 17, color: '#fff' }} /> : getInitials(customerName)}
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{isSeller ? 'Seller' : 'You'}</span>
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '85%', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexDirection: isSeller ? 'row' : 'row-reverse' }}>
          <FieldBadge status={response.response_type} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{formatDateTime(response.created_at)}</span>
        </div>
        <div style={{
          border: `1px solid ${isSeller ? '#6366f133' : '#e2e8f0'}`,
          borderRadius: isSeller ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
          background: isSeller ? '#6366f108' : '#f8fafc',
          overflow: 'hidden',
        }}>
          {rows.length > 0 && (
            <div style={{ padding: '12px 16px 8px' }}>
              {rows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: 6, marginBottom: 4 }}>
                  <div style={{ color: '#94a3b8', marginTop: 2, flexShrink: 0 }}>{row.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: row.note ? 3 : 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 11, color: '#475569', minWidth: 52 }}>{row.label}</span>
                      <FieldBadge status={row.status} />
                      {row.extra}
                    </div>
                    {row.note && <span style={{ fontSize: 11, color: '#64748b' }}>{row.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {response.additional_note && (
            <div style={{ padding: '10px 16px', borderTop: rows.length > 0 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <InfoOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', mt: 0.25, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{response.additional_note}</span>
            </div>
          )}
          {response.seller_message && !response.additional_note && rows.length === 0 && (
            <div style={{ padding: '10px 16px' }}>
              <span style={{ fontSize: 12, color: '#475569' }}>{response.seller_message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResponseThread({ responses, customerName, open, onToggle }: {
  responses: QuoteResponse[]
  customerName: string
  open: boolean
  onToggle: () => void
}) {
  if (!responses || responses.length === 0) return null
  const sorted = [...responses].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const latest = sorted[sorted.length - 1]

  return (
    <div style={{ border: '1px solid #6366f133', borderRadius: 8, background: '#6366f108', overflow: 'hidden', marginTop: 8 }}>
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: '#6366f10a',
        borderBottom: open ? '1px solid #6366f120' : 'none',
        cursor: 'pointer',
      }}>
        <ForumOutlinedIcon sx={{ fontSize: 16, color: '#6366f1' }} />
        <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: 13 }}>Response Thread</span>
        <span style={{ padding: '1px 7px', background: '#6366f1', borderRadius: 10, fontSize: 10, fontWeight: 700, color: '#fff' }}>{sorted.length}</span>
        {!open && latest && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {latest.actor_type === 'seller' ? 'Seller' : 'You'}: {latest.additional_note || latest.seller_message || `${latest.response_type} response`}
          </span>
        )}
        {open && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StorefrontIcon sx={{ fontSize: 9, color: '#fff' }} />
              </Box>
              <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>Seller</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: avatarColor(latest?.actor_type === 'customer' ? latest?.mobile_number ?? 'C' : 'C'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonIcon sx={{ fontSize: 9, color: '#fff' }} />
              </Box>
              <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>You</Typography>
            </Box>
          </Box>
        )}
        <span style={{ marginLeft: open ? 8 : 'auto' as any, color: '#6366f1', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 12 }}>▼</span>
      </div>
      {open && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sorted.map((r, i) => <ResponseBubble key={r.entity_id ?? i} response={r} customerName={customerName} />)}
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, icon, note, accentColor }: {
  label: string; value: number; icon: string; note?: string; accentColor: string
}) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
      background: '#fff', borderTop: `3px solid ${accentColor}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, background: accentColor + '14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accentColor, flexShrink: 0, fontSize: 18,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 3 }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, marginTop: 2 }}>{note}</div>}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CustomerQuotesPage() {
  const router = useRouter()
  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })
  const mobileNumber = getMobileNumber()

  const { data, loading, error, refetch } = useQuery(CUSTOMER_QUOTES_QUERY, {
    variables: { mobile_number: mobileNumber },
    skip: !mobileNumber,
    fetchPolicy: 'cache-and-network',
  })

  const [customerRespond] = useMutation(CUSTOMER_RESPOND_MUTATION)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({})

  const allSellerOrders: SellerOrder[] = data?.customerSellerOrders ?? []
  const groupedOrders = groupByOrder(allSellerOrders)

  const awaitingCount = allSellerOrders.filter((o) => o.status === 'pending').length
  const needsActionCount = allSellerOrders.filter((o) => o.status === 'replied').length

  const filteredOrders = useMemo(() => {
    return groupedOrders.filter((order) => {
      const matchSearch = !search ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.order_number.includes(search)
      const matchStatus = statusFilter === 'all' ||
        order.sellerOrders.some((so) => so.status === statusFilter)
      return matchSearch && matchStatus
    })
  }, [groupedOrders, search, statusFilter])

  const toggleThread = (key: string) => setExpandedThreads((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleAction = async (
    orderId: number,
    sellerId: number,
    action: 'approved' | 'rejected' | 'call',
    reason?: string,
  ) => {
    await customerRespond({
      variables: {
        input: {
          order_id: orderId,
          seller_id: sellerId,
          mobile_number: mobileNumber,
          actor_type: 'customer',
          response_type: action,
          additional_note: reason ?? '',
        },
      },
    })
    await refetch()
  }

  const cols = ['ORDER', 'SELLER', 'QUOTE VALUE', 'PAYMENT TERMS', 'DELIVERY BY', 'STATUS', '']

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'My Quotes')} metaRobots={['noindex']} />

      <AccountLayout>
        <WaitForCustomer waitFor={customerQuery}>
          <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, letterSpacing: '-0.3px' }}>
                <Trans id='My Quotes' />
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Track your quote requests and respond to seller offers
              </Typography>
            </Box>

            {/* KPI Strip */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
              <KpiCard label="Quote Requests" value={groupedOrders.length} icon="🧾" accentColor="#334155" />
              <KpiCard label="Awaiting Response" value={awaitingCount} icon="⏳" accentColor="#92400e" note={awaitingCount > 0 ? 'Seller reviewing' : undefined} />
              <KpiCard label="Needs Your Action" value={needsActionCount} icon="💬" accentColor="#1e3a5f" note={needsActionCount > 0 ? 'Response received' : undefined} />
              <KpiCard label="Total Seller Quotes" value={allSellerOrders.length} icon="🏪" accentColor="#475569" />
            </div>

            {/* Loading */}
            {loading && !data && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                <CircularProgress size={28} />
                <Typography color='text.secondary'>Loading your quotes…</Typography>
              </Box>
            )}

            {/* Error */}
            {error && (
              <Alert severity='error' sx={{ borderRadius: 2, mb: 2 }}>
                Failed to load quotes. Please refresh and try again.
              </Alert>
            )}

            {/* No mobile number */}
            {!loading && !mobileNumber && (
              <Alert severity='info' sx={{ borderRadius: 2 }}>
                Please add a mobile number to your account to view your quotes.
              </Alert>
            )}

            {/* Empty */}
            {!loading && mobileNumber && groupedOrders.length === 0 && !error && (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <RequestQuoteIcon sx={{ fontSize: 52, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1.5 }} />
                <Typography variant='h6' color='text.secondary' sx={{ mb: 0.5 }}>No quote requests yet</Typography>
                <Typography variant='body2' color='text.disabled'>Your submitted quote requests will appear here.</Typography>
              </Box>
            )}

            {/* Table */}
            {groupedOrders.length > 0 && (
              <>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or order no."
                      style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#334155', background: '#fff', outline: 'none', minWidth: 260 }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8' }}>≡</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ paddingLeft: 28, paddingRight: 28, height: 36, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#334155', background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 160 }}
                    >
                      <option value="all">All Statuses</option>
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8', pointerEvents: 'none' }}>▼</span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                    {filteredOrders.flatMap((o) => o.sellerOrders).length} of {allSellerOrders.length} quotes
                  </span>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {cols.map((c) => (
                          <th key={c} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '56px 0', color: '#94a3b8', fontSize: 13 }}>No quotes found</td></tr>
                      )}

                      {filteredOrders.map((order, oi) =>
                        order.sellerOrders.map((so, si) => {
                          const isReplied = so.status === 'replied'
                          const leftBorder = isReplied ? '3px solid #3b82f6' : so.status === 'pending' ? '3px solid #f59e0b' : '3px solid transparent'
                          const threadKey = `${so.order_id}-${so.seller_id}`
                          const threadOpen = !!expandedThreads[threadKey]
                          const hasResponses = (so.quote_responses?.length ?? 0) > 0
                          const latestSeller = so.quote_responses
                            ?.filter((r) => r.actor_type === 'seller')
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                          const displayTotal = (latestSeller?.price_status === 'revised' && latestSeller?.revised_price != null)
                            ? latestSeller.revised_price
                            : so.seller_total
                          const isFirst = si === 0
                          const detailUrl = `/account/quotes/${so.order_id}/${so.seller_id}`

                          return (
                            <React.Fragment key={threadKey}>
                              {/* Order separator */}
                              {oi > 0 && si === 0 && (
                                <tr style={{ pointerEvents: 'none' }}>
                                  <td colSpan={7} style={{ padding: 0, border: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 32, background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                      <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
                                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                        Quote #{order.order_number}
                                      </span>
                                      <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Order header row */}
                              {isFirst && (
                                <tr style={{ background: '#f8fafc' }}>
                                  <td colSpan={7} style={{ padding: '10px 16px 8px', borderLeft: '3px solid #334155', borderBottom: 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>#{order.order_number}</span>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>⏱ {formatDateTime(order.created_at)}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>🚚 Deliver by {formatDate(order.delivery_date)}</span>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>· {PAYMENT_MAP[order.payment_terms] || order.payment_terms}</span>
                                      </div>
                                      {order.additional_notes && (
                                        <span style={{ fontSize: 11, color: '#92400e', background: '#fffbeb', padding: '2px 8px', borderRadius: 5, border: '1px solid #fde68a', fontStyle: 'italic' }}>
                                          📝 "{order.additional_notes}"
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Seller quote main row */}
                              <tr
                                style={{ cursor: 'pointer', background: '#fff' }}
                                onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => { (c as HTMLElement).style.background = '#f8fafc' })}
                                onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => { (c as HTMLElement).style.background = '#fff' })}
                              >
                                <td style={{ padding: '14px 14px 6px', borderLeft: leftBorder, borderBottom: 'none' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {isReplied && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />}
                                    {so.status === 'pending' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />}
                                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, color: '#0f172a' }}>#{so.order_number}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 14px 6px', borderBottom: 'none' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                      <StorefrontIcon sx={{ fontSize: 16, color: '#475569' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Seller #{so.seller_id}</div>
                                      {latestSeller?.price_status === 'revised' && (
                                        <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>Price revised</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 14px 6px', borderBottom: 'none' }}>
                                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>₹{String(displayTotal)}</span>
                                  {latestSeller?.price_status === 'revised' && latestSeller?.original_price && (
                                    <span style={{ display: 'block', fontSize: 10, color: '#94a3b8', textDecoration: 'line-through' }}>₹{String(latestSeller.original_price)}</span>
                                  )}
                                </td>
                                <td style={{ padding: '14px 14px 6px', fontWeight: 600, fontSize: 13, color: '#0f172a', borderBottom: 'none' }}>
                                  {PAYMENT_MAP[so.payment_terms] || so.payment_terms}
                                </td>
                                <td style={{ padding: '14px 14px 6px', fontWeight: 600, fontSize: 13, color: '#0f172a', borderBottom: 'none' }}>
                                  🚚 {formatDate(so.delivery_date)}
                                </td>
                                <td style={{ padding: '14px 14px 6px', borderBottom: 'none' }}>
                                  <StatusBadge status={so.status} />
                                </td>
                                <td style={{ padding: '14px 14px 6px', textAlign: 'right', borderBottom: 'none' }}>
                                  <button
                                    onClick={() => router.push(detailUrl)}
                                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#475569' }}
                                  >→</button>
                                </td>
                              </tr>

                              {/* Product sub-rows */}
                              {so.items.map((item, ii) => (
                                <tr key={item.item_id} style={{ background: '#fff' }}
                                  onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => { (c as HTMLElement).style.background = '#f8fafc' })}
                                  onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => { (c as HTMLElement).style.background = '#fff' })}
                                >
                                  <td colSpan={7} style={{ paddingTop: ii === 0 ? 4 : 2, paddingBottom: ii === so.items.length - 1 && !hasResponses ? 16 : 2, paddingLeft: 14, paddingRight: 14, borderLeft: leftBorder, borderBottom: 'none' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 72px 110px 110px', alignItems: 'center', gap: 20, padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                      <div style={{ width: 44, height: 44, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                        {item.image_url
                                          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          : <span style={{ fontSize: 16, color: '#cbd5e1' }}>📄</span>
                                        }
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{item.name}</div>
                                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#64748b' }}>SKU: {item.sku}</span>
                                      </div>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>QTY</div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{item.qty}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>UNIT PRICE</div>
                                        <div style={{ fontWeight: 500, fontSize: 13, color: '#475569' }}>₹{String(item.price)}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>LINE TOTAL</div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>₹{String(item.row_total)}</div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                              {/* Response thread row */}


                              {/* {hasResponses && (
                                <tr style={{ background: '#fff' }}>
                                  <td colSpan={7} style={{ padding: '4px 14px 16px', borderLeft: leftBorder, borderBottom: 'none' }}>
                                    <ResponseThread
                                      responses={so.quote_responses}
                                      customerName={order.customer_name}
                                      open={threadOpen}
                                      onToggle={() => toggleThread(threadKey)}
                                    />
                                    {so.status === 'replied' && (
                                      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                                        <button
                                          onClick={() => handleAction(so.order_id, so.seller_id, 'call')}
                                          style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                                        >
                                          📞 Discuss on Call
                                        </button>
                                        <button
                                          onClick={() => handleAction(so.order_id, so.seller_id, 'rejected')}
                                          style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 12, fontWeight: 600, color: '#b91c1c', cursor: 'pointer' }}
                                        >
                                          ✕ Reject
                                        </button>
                                        <button
                                          onClick={() => handleAction(so.order_id, so.seller_id, 'approved')}
                                          style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#064e3b', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                                        >
                                          ✓ Approve
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )} */}


                            </React.Fragment>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <p style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                  Blue rows indicate seller has responded and need your action
                </p>
              </>
            )}
          </div>
        </WaitForCustomer>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

CustomerQuotesPage.pageOptions = pageOptions
export default CustomerQuotesPage

export const getStaticProps = async (context) => {
  try {
    console.log("🔥 getStaticProps started")

    const client = graphqlSharedClient(context)
    const staticClient = graphqlSsrClient(context)

    console.log("🟡 Running layout query")

    const layout = await staticClient.query({
      query: LayoutDocument,
      fetchPolicy: cacheFirst(staticClient),
    })

    console.log("✅ Layout success")

    return {
      props: {
        ...layout.data,
      },
      revalidate: 60 * 20,
    }

  } catch (error: any) {
    console.log("🚨 ERROR INSIDE getStaticProps")
    console.log("Message:", error?.message)
    console.log("Full error:", error)

    throw error
  }
}