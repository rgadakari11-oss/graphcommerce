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
  alpha,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Paper,
  LinearProgress,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplyIcon from '@mui/icons-material/Reply'
import PhoneIcon from '@mui/icons-material/Phone'
import { useRouter } from 'next/router'
import { useQuery, gql } from '@graphcommerce/graphql'
import { useState, useMemo } from 'react'
import React from 'react'

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
    }
  }
`

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#92400e', bg: '#fef3c7', label: 'Pending, Your Action Required' },
  approved: { color: '#064e3b', bg: '#d1fae5', label: 'Approved' },
  rejected: { color: '#7f1d1d', bg: '#fee2e2', label: 'Rejected' },
  replied: { color: '#1e3a5f', bg: '#dbeafe', label: 'Waiting for Customer' },
}

const PAYMENT_MAP: Record<string, string> = {
  'net-30': 'Net 30',
  'net-60': 'Net 60',
  'net-90': 'Net 90',
  cod: 'Cash on Delivery',
  prepaid: 'Prepaid',
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon,
  note,
  accentColor,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  note?: string
  accentColor: string
}) {
  return (
    <Box
      sx={{
        flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 0' },
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 1.75, sm: 2.5 },
        py: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        borderTop: '3px solid',
        borderTopColor: accentColor,
      }}
    >
      <Box
        sx={{
          width: { xs: 34, sm: 40 },
          height: { xs: 34, sm: 40 },
          borderRadius: 1.5,
          bgcolor: alpha(accentColor, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant='h5'
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            color: 'text.primary',
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.1rem', sm: '1.5rem' },
          }}
        >
          {value}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            display: 'block',
            mt: 0.25,
            fontSize: { xs: '0.62rem', sm: '0.75rem' },
          }}
        >
          {label}
        </Typography>
        {note && (
          <Typography
            variant='caption'
            sx={{ color: accentColor, fontWeight: 700, fontSize: '0.63rem' }}
          >
            {note}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// ─── Mobile Quote Card ────────────────────────────────────────────────────────
function QuoteCard({ quote, onClick }: { quote: any; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[quote.status] || {
    color: '#374151',
    bg: '#f3f4f6',
    label: quote.status,
  }
  const isPending = quote.status === 'pending'

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        border: '1px solid',
        borderColor: isPending ? '#f59e0b' : 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: '#fff',
        borderLeft: isPending ? '4px solid #f59e0b' : '1px solid',
        borderLeftColor: isPending ? '#f59e0b' : 'divider',
        '&:active': { bgcolor: '#f8fafc' },
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: 2,
          pt: 2,
          pb: 1.5,
        }}
      >
        {/* Left: Order + Customer */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {isPending && (
              <Box
                sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0 }}
              />
            )}
            <Typography
              variant='body2'
              sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
              #{quote.order_number}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, ml: 'auto' }}>
              <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
              <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>
                {formatDate(quote.created_at)}
              </Typography>
            </Box>
          </Box>

          {/* Customer Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 26,
                height: 26,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: '#e2e8f0',
                color: '#334155',
                flexShrink: 0,
              }}
            >
              {getInitials(quote.customer_name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'text.primary' }}
              >
                {quote.customer_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <PhoneIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
                <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.65rem' }}>
                  {quote.mobile_number}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right: Arrow */}
        <IconButton
          size='small'
          sx={{ bgcolor: '#f1f5f9', borderRadius: 1.5, ml: 1, flexShrink: 0 }}
        >
          <ArrowForwardIcon sx={{ fontSize: 14, color: '#475569' }} />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Meta Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 0,
          px: 2,
          py: 1.25,
        }}
      >
        {/* Value */}
        <Box>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              color: 'text.disabled',
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.3,
            }}
          >
            Quote Value
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
            ₹{quote.seller_total.toLocaleString()}
          </Typography>
        </Box>

        {/* Payment */}
        <Box>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              color: 'text.disabled',
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.3,
            }}
          >
            Payment
          </Typography>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.primary' }}
          >
            {PAYMENT_MAP[quote.payment_terms] || quote.payment_terms}
          </Typography>
        </Box>

        {/* Delivery */}
        <Box>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              color: 'text.disabled',
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.3,
            }}
          >
            Delivery
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <LocalShippingIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.primary' }}
            >
              {formatDate(quote.delivery_date)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Status */}
      <Box sx={{ px: 2, pb: 1.25 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1.25,
            py: 0.4,
            borderRadius: 1,
            bgcolor: statusCfg.bg,
            border: `1px solid ${alpha(statusCfg.color, 0.2)}`,
          }}
        >
          <Box
            sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: statusCfg.color, flexShrink: 0 }}
          />
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, color: statusCfg.color, fontSize: '0.68rem' }}
          >
            {statusCfg.label}
          </Typography>
        </Box>
      </Box>

      {/* Product Items */}
      {quote.items.length > 0 && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ px: 2, py: 1.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {quote.items.map((item: any) => (
              <Box
                key={item.item_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  bgcolor: '#fafafa',
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.image_url ? (
                    <Box
                      component='img'
                      src={item.image_url}
                      alt={item.name}
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ReceiptLongIcon sx={{ fontSize: 15, color: '#cbd5e1' }} />
                  )}
                </Box>

                {/* Name + SKU */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: 'text.primary',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#64748b' }}
                  >
                    SKU: {item.sku}
                  </Typography>
                </Box>

                {/* Qty × Price */}
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary' }}
                  >
                    ₹{item.row_total.toLocaleString()}
                  </Typography>
                  <Typography variant='caption' color='text.disabled' sx={{ fontSize: '0.62rem' }}>
                    {item.qty} × ₹{item.price.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}

      {quote.items.length === 0 && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant='caption' color='text.disabled' sx={{ fontStyle: 'italic' }}>
            No products attached to this quote
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function SellerQuotesPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const { data, loading } = useQuery(SELLER_QUOTES_QUERY, {
    variables: { seller_id: sellerId },
    skip: !sellerId,
    fetchPolicy: 'cache-and-network',
  })
  const quotes: any[] = data?.customerSellerOrders || []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      const matchSearch =
        !search ||
        q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        q.order_number.includes(search)
      const matchStatus = statusFilter === 'all' || q.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [quotes, search, statusFilter])

  const totalValue = quotes.reduce((s: number, q: any) => s + q.seller_total, 0)
  const pendingCount = quotes.filter((q) => q.status === 'pending').length
  const repliedCount = quotes.filter((q) => q.status === 'replied').length

  const statusOptions = ['all', 'pending', 'replied', 'approved', 'rejected']

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Quote Requests')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>
          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.3px',
                fontSize: { xs: '1.15rem', sm: '1.5rem' },
              }}
            >
              <Trans id='Quote Requests' />
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 0.5, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}
            >
              <Trans id='Review and respond to customer price requests' />
            </Typography>
          </Box>

          {/* KPI Strip — 2×2 on mobile, 4×1 on desktop */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            <KpiCard
              label='Total Quotes'
              value={quotes.length}
              icon={<ReceiptLongIcon fontSize='small' />}
              accentColor='#334155'
            />
            <KpiCard
              label='Pending Response'
              value={pendingCount}
              icon={<PendingActionsIcon fontSize='small' />}
              note={pendingCount > 0 ? 'Action required' : undefined}
              accentColor='#92400e'
            />
            <KpiCard
              label='Replied'
              value={repliedCount}
              icon={<ReplyIcon fontSize='small' />}
              accentColor='#1e3a5f'
            />
            <KpiCard
              label='Total Quote Value'
              value={`₹${totalValue.toLocaleString()}`}
              icon={<CheckCircleOutlineIcon fontSize='small' />}
              accentColor='#064e3b'
            />
          </Box>

          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 },
              mb: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <TextField
              size='small'
              placeholder='Search by customer or order no.'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#fff' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <TextField
                select
                size='small'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  minWidth: { xs: 0, sm: 160 },
                  flex: { xs: 1, sm: 'none' },
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#fff' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <FilterListIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s === 'all' ? 'All Statuses' : STATUS_CONFIG[s]?.label || s}
                  </MenuItem>
                ))}
              </TextField>

              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ whiteSpace: 'nowrap', alignSelf: 'center', flexShrink: 0 }}
              >
                {filtered.length}/{quotes.length}
              </Typography>
            </Box>
          </Box>

          {/* Loading */}
          {loading && <LinearProgress sx={{ borderRadius: 1, mb: 2, height: 3 }} />}

          {/* ── MOBILE: Card List ── */}
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!loading && filtered.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ReceiptLongIcon
                    sx={{ fontSize: 40, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    No quotes found
                  </Typography>
                </Box>
              )}
              {filtered.map((quote) => (
                <QuoteCard
                  key={quote.order_id}
                  quote={quote}
                  onClick={() => router.push(`/seller/quotes/${quote.order_id}`)}
                />
              ))}
            </Box>
          ) : (
            /* ── DESKTOP: Table ── */
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {[
                      'Quote',
                      'Customer',
                      'Quote Value',
                      'Payment Terms',
                      'Delivery By',
                      'Status',
                      '',
                    ].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, border: 0 }}>
                        <ReceiptLongIcon
                          sx={{
                            fontSize: 40,
                            color: 'text.disabled',
                            display: 'block',
                            mx: 'auto',
                            mb: 1,
                          }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          No quotes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {filtered.map((quote, quoteIdx) => {
                    const statusCfg = STATUS_CONFIG[quote.status] || {
                      color: '#374151',
                      bg: '#f3f4f6',
                      label: quote.status,
                    }
                    const isPending = quote.status === 'pending'

                    return (
                      <React.Fragment key={quote.order_id}>
                        {/* ── Quote group separator ── */}
                        {quoteIdx > 0 && (
                          <TableRow
                            sx={{ '& td': { p: 0, border: 0 }, pointerEvents: 'none' }}
                          >
                            <TableCell colSpan={7}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  px: 2,
                                  py: 0,
                                  height: 32,
                                  bgcolor: '#f1f5f9',
                                  borderTop: '1px solid #e2e8f0',
                                  borderBottom: '1px solid #e2e8f0',
                                }}
                              >
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#cbd5e1' }} />
                                <Typography
                                  variant='caption'
                                  sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Quote #{filtered[quoteIdx].order_number}
                                </Typography>
                                <Box sx={{ flex: 1, height: '1px', bgcolor: '#cbd5e1' }} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* ── Row 1: Order meta ── */}
                        <TableRow
                          onClick={() => router.push(`/seller/quotes/${quote.order_id}`)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: '#fff',
                            '&:hover td': { bgcolor: '#f8fafc' },
                            '& td': { borderBottom: 'none' },
                            '& td:first-of-type': {
                              borderLeft: isPending
                                ? '3px solid #f59e0b'
                                : '3px solid transparent',
                            },
                          }}
                        >
                          <TableCell sx={{ pt: 2.5, pb: 1, pl: isPending ? 1.5 : 2 }}>
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}
                            >
                              {isPending && (
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: '#f59e0b',
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  color: 'text.primary',
                                }}
                              >
                                #{quote.order_number}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                                pl: isPending ? 1.75 : 0,
                              }}
                            >
                              <AccessTimeIcon sx={{ fontSize: 11, color: 'text.primary' }} />
                              <Typography
                                variant='caption'
                                color='text.primary'
                                sx={{ fontSize: '0.68rem' }}
                              >
                                {formatDate(quote.created_at)}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: '#e2e8f0',
                                  color: '#334155',
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(quote.customer_name)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant='body2'
                                  sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}
                                >
                                  {quote.customer_name}
                                </Typography>
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}
                                >
                                  <PhoneIcon sx={{ fontSize: 11, color: 'text.primary' }} />
                                  <Typography
                                    variant='caption'
                                    color='text.primary'
                                    sx={{ fontSize: '0.68rem' }}
                                  >
                                    {quote.mobile_number}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}
                            >
                              ₹{quote.seller_total.toLocaleString()}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600, color: 'text.primary' }}
                            >
                              {PAYMENT_MAP[quote.payment_terms] || quote.payment_terms}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <LocalShippingIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                              >
                                {formatDate(quote.delivery_date)}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.6,
                                px: 1.25,
                                py: 0.4,
                                borderRadius: 1,
                                bgcolor: statusCfg.bg,
                                border: `1px solid ${alpha(statusCfg.color, 0.2)}`,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  bgcolor: statusCfg.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontWeight: 700,
                                  color: statusCfg.color,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {statusCfg.label}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ pt: 2.5, pb: 1, textAlign: 'right' }}>
                            <Tooltip title='View & Respond'>
                              <IconButton
                                size='small'
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: '#e2e8f0' },
                                }}
                              >
                                <ArrowForwardIcon sx={{ fontSize: 15, color: '#475569' }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        {/* ── Product rows ── */}
                        {quote.items.length === 0 ? (
                          <TableRow
                            onClick={() =>
                              router.push(`/account/seller/quotes/${quote.order_id}`)
                            }
                            sx={{
                              cursor: 'pointer',
                              bgcolor: '#fff',
                              '&:hover td': { bgcolor: '#f8fafc' },
                              '& td': { borderBottom: 'none' },
                              '& td:first-of-type': {
                                borderLeft: isPending
                                  ? '3px solid #f59e0b'
                                  : '3px solid transparent',
                              },
                            }}
                          >
                            <TableCell
                              colSpan={7}
                              sx={{ pt: 0.5, pb: 2.5, pl: isPending ? 1.5 : 2, pr: 2 }}
                            >
                              <Typography
                                variant='caption'
                                color='text.disabled'
                                sx={{ fontStyle: 'italic' }}
                              >
                                No products attached to this quote
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          quote.items.map((item: any, itemIdx: number) => {
                            const isLastItem = itemIdx === quote.items.length - 1
                            return (
                              <TableRow
                                key={item.item_id}
                                onClick={() =>
                                  router.push(`/account/seller/quotes/${quote.order_id}`)
                                }
                                sx={{
                                  cursor: 'pointer',
                                  bgcolor: '#fff',
                                  '&:hover td': { bgcolor: '#f8fafc' },
                                  '& td': { borderBottom: 'none' },
                                  '& td:first-of-type': {
                                    borderLeft: isPending
                                      ? '3px solid #f59e0b'
                                      : '3px solid transparent',
                                  },
                                }}
                              >
                                <TableCell
                                  colSpan={7}
                                  sx={{
                                    pt: itemIdx === 0 ? 0.5 : 0.25,
                                    pb: isLastItem ? 2.5 : 0.25,
                                    pl: isPending ? 1.5 : 2,
                                    pr: 2,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns: '44px 1fr 72px 110px 110px',
                                      alignItems: 'center',
                                      gap: 2.5,
                                      px: 2,
                                      py: 1.5,
                                      border: '1px solid #e2e8f0',
                                      borderRadius: 1.5,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 1,
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        bgcolor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {item.image_url ? (
                                        <Box
                                          component='img'
                                          src={item.image_url}
                                          alt={item.name}
                                          onError={(e: any) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                          }}
                                        />
                                      ) : (
                                        <ReceiptLongIcon sx={{ fontSize: 18, color: '#cbd5e1' }} />
                                      )}
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          fontWeight: 600,
                                          color: 'text.primary',
                                          lineHeight: 1.4,
                                          mb: 0.4,
                                        }}
                                      >
                                        {item.name}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          px: 0.75,
                                          py: 0.15,
                                          borderRadius: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant='caption'
                                          sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.63rem',
                                            color: '#64748b',
                                            letterSpacing: '0.02em',
                                          }}
                                        >
                                          SKU: {item.sku}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          display: 'block',
                                          color: 'text.disabled',
                                          fontSize: '0.62rem',
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          mb: 0.3,
                                        }}
                                      >
                                        Qty
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ fontWeight: 700, color: 'text.primary' }}
                                      >
                                        {item.qty}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          display: 'block',
                                          color: 'text.disabled',
                                          fontSize: '0.62rem',
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          mb: 0.3,
                                        }}
                                      >
                                        Unit Price
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: 'text.secondary', fontWeight: 500 }}
                                      >
                                        ₹{item.price.toLocaleString()}
                                      </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography
                                        variant='caption'
                                        sx={{
                                          display: 'block',
                                          color: 'text.disabled',
                                          fontSize: '0.62rem',
                                          fontWeight: 600,
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.05em',
                                          mb: 0.3,
                                        }}
                                      >
                                        Line Total
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ fontWeight: 700, color: 'text.primary' }}
                                      >
                                        ₹{item.row_total.toLocaleString()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filtered.length > 0 && (
            <Typography
              variant='caption'
              color='text.disabled'
              sx={{ mt: 1.5, display: 'block', textAlign: 'right' }}
            >
              {isMobile
                ? 'Amber border = action required'
                : 'Rows highlighted in amber require your response'}
            </Typography>
          )}
        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

SellerQuotesPage.pageOptions = pageOptions
export default SellerQuotesPage

export const getStaticProps: GetPageStaticProps = async (context) => {
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
    revalidate: 60 * 20,
  }
}