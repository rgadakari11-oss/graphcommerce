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
import {
  Box,
  Typography,
  Chip,
  Avatar,
  alpha,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Menu,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import PhoneIcon from '@mui/icons-material/Phone'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ScaleIcon from '@mui/icons-material/Scale'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useState, useMemo } from 'react'

import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { getSellerId } from '../../lib/utils/getMobileNumber'


// ─── GraphQL ─────────────────────────────────────────────────────────────────
const sellerId = Number(getSellerId())

const GET_SELLER_ACTIVITIES = gql`
  query GetSellerActivities($seller_id: Int!) {
    getSellerActivities(seller_id: $seller_id) {
      entity_id
      product_id
      sku
      image
      product_url
      product_name
      action_type
      customer_name
      phone_number
      quantity
      unit
      status
      created_at
    }
  }
`

const UPDATE_ACTIVITY_STATUS = gql`
  mutation UpdateSellerActivityStatus($entity_id: Int!, $status: String!) {
    updateSellerActivityStatus(entity_id: $entity_id, status: $status) {
      success
      message
    }
  }
`

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerActivity {
  entity_id: number
  product_id: number
  sku?: string | null
  image?: string | null
  product_url?: string | null
  product_name?: string | null
  action_type: string
  customer_name?: string | null
  phone_number?: string | null
  quantity?: number | null
  unit?: string | null
  status?: string | null
  created_at: string
}

// ─── Status config ────────────────────────────────────────────────────────────

type StatusKey = 'PENDING' | 'CONTACTED' | 'INTERESTED' | 'CLOSED' | 'NOT_INTERESTED'

const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#757575', bg: '#f5f5f5' },
  CONTACTED: { label: 'Contacted', color: '#1565c0', bg: '#e3f2fd' },
  INTERESTED: { label: 'Interested', color: '#2e7d32', bg: '#e8f5e9' },
  CLOSED: { label: 'Closed', color: '#00695c', bg: '#e0f2f1' },
  NOT_INTERESTED: { label: 'Not Interested', color: '#b71c1c', bg: '#ffebee' },
}

const STATUS_OPTIONS: StatusKey[] = ['PENDING', 'CONTACTED', 'INTERESTED', 'CLOSED', 'NOT_INTERESTED']

const getStatusMeta = (status?: string | null) =>
  STATUS_META[(status as StatusKey) ?? 'PENDING'] ?? STATUS_META.PENDING

// ─── Action config ────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SUBMIT_REQUIREMENT: { label: 'Requirement', color: '#1565c0', bg: '#e3f2fd', icon: <RequestQuoteIcon sx={{ fontSize: 13 }} /> },
  NOTIFY_SELLER: { label: 'Notify', color: '#e65100', bg: '#fff3e0', icon: <NotificationsActiveIcon sx={{ fontSize: 13 }} /> },
  VIEW_CONTACT: { label: 'View Contact', color: '#00695c', bg: '#e0f2f1', icon: <VisibilityOutlinedIcon sx={{ fontSize: 13 }} /> },
  GET_LATEST_PRICE: { label: 'Latest Price', color: '#4e342e', bg: '#efebe9', icon: <PriceChangeOutlinedIcon sx={{ fontSize: 13 }} /> },
}

const getActionMeta = (type: string) =>
  ACTION_META[type] ?? { label: type, color: '#546e7a', bg: '#eceff1', icon: <RequestQuoteIcon sx={{ fontSize: 13 }} /> }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
    const diffHrs = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHrs / 24)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function getInitials(name?: string | null) {
  if (!name?.trim()) return '?'
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_PALETTE = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#b71c1c', '#00695c', '#827717', '#880e4f']
const avatarColor = (id: number) => AVATAR_PALETTE[id % AVATAR_PALETTE.length]

const MEDIA_BASE = '/pub/media/catalog/product'
function resolveImage(image?: string | null): string | null {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${MEDIA_BASE}${image}`
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  return (
    <Box sx={{
      flex: '1 1 120px', minWidth: 110, px: 1.75, py: 1.5,
      borderRadius: 2, border: '1px solid', borderColor: alpha(color, 0.22),
      backgroundColor: alpha(color, 0.05),
      display: 'flex', alignItems: 'center', gap: 1.25,
    }}>
      <Box sx={{
        width: 34, height: 34, borderRadius: '9px',
        backgroundColor: alpha(color, 0.14),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '20px', fontWeight: 800, color, lineHeight: 1 }}>{count}</Typography>
        <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', mt: 0.2 }}>{label}</Typography>
      </Box>
    </Box>
  )
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  entityId,
  currentStatus,
  onUpdated,
}: {
  entityId: number
  currentStatus?: string | null
  onUpdated: (entityId: number, newStatus: string) => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [updating, setUpdating] = useState(false)
  const [updateStatus] = useMutation(UPDATE_ACTIVITY_STATUS)
  const meta = getStatusMeta(currentStatus)

  const handleSelect = async (status: StatusKey) => {
    setAnchorEl(null)
    if (status === currentStatus) return
    setUpdating(true)
    try {
      await updateStatus({ variables: { entity_id: entityId, status } })
      onUpdated(entityId, status)
    } catch (e) {
      console.error('Failed to update status', e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Tooltip title='Update status' arrow>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            px: 1,
            py: 0.35,
            borderRadius: 1,
            border: '1px solid',
            borderColor: alpha(meta.color, 0.35),
            backgroundColor: meta.bg,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            '&:hover': { opacity: 0.8 },
            minWidth: 100,
          }}
        >
          {updating ? (
            <CircularProgress size={11} thickness={5} sx={{ color: meta.color, mx: 'auto' }} />
          ) : (
            <>
              <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: meta.color, flex: 1 }}>
                {meta.label}
              </Typography>
              <ExpandMoreIcon sx={{ fontSize: 14, color: meta.color, flexShrink: 0 }} />
            </>
          )}
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 160 },
        }}
      >
        {STATUS_OPTIONS.map((s) => {
          const sm = STATUS_META[s]
          return (
            <MenuItem
              key={s}
              onClick={() => handleSelect(s)}
              selected={s === currentStatus}
              sx={{
                py: 0.75,
                px: 1.5,
                gap: 1,
                '&.Mui-selected': { backgroundColor: alpha(sm.color, 0.08) },
                '&:hover': { backgroundColor: alpha(sm.color, 0.06) },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sm.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '12.5px', fontWeight: s === currentStatus ? 700 : 400, color: sm.color }}>
                {sm.label}
              </Typography>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}

// ─── Table Header ─────────────────────────────────────────────────────────────

function TableHeader() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'grid' },
        gridTemplateColumns: '40px 2fr 2fr 1fr 1fr 1fr 130px auto',
        gap: 2,
        px: 2.5,
        py: 1.25,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px 12px 0 0',
      }}
    >
      {['', 'Customer', 'Product', 'SKU', 'Quantity', 'Action Type', 'Status', 'Time'].map((h) => (
        <Typography key={h} sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {h}
        </Typography>
      ))}
    </Box>
  )
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({
  item,
  onStatusUpdated,
}: {
  item: SellerActivity
  onStatusUpdated: (entityId: number, newStatus: string) => void
}) {
  const meta = getActionMeta(item.action_type)
  const imgSrc = resolveImage(item.image)
  const hasName = !!item.customer_name?.trim()

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '40px 1fr auto',
          md: '40px 2fr 2fr 1fr 1fr 1fr 130px auto',
        },
        alignItems: 'center',
        gap: { xs: 1, md: 2 },
        px: { xs: 2, md: 2.5 },
        py: { xs: 2, md: 1.25 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { backgroundColor: alpha(meta.color, 0.025) },
        transition: 'background 0.15s',
      }}
    >
      {/* Avatar */}
      <Avatar sx={{ width: 34, height: 34, fontSize: '12px', fontWeight: 700, backgroundColor: avatarColor(item.entity_id), display: { xs: 'none', sm: 'flex' } }}>
        {getInitials(item.customer_name)}
      </Avatar>

      {/* Customer */}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
          {hasName ? item.customer_name : 'Anonymous'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <PhoneIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{item.phone_number || '—'}</Typography>
        </Box>

        {/* Mobile extras */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexWrap: 'wrap', gap: 1, mt: 0.75, alignItems: 'center' }}>
          {imgSrc && (
            <Box sx={{ width: 28, height: 28, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box component='img' src={imgSrc} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          )}
          <Typography sx={{ fontSize: '12px', color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
            {item.product_name || `#${item.product_id}`}
          </Typography>
          {item.quantity && (
            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{item.quantity} {item.unit || ''}</Typography>
          )}
          <Chip size='small' label={meta.label} sx={{ height: 18, fontSize: '10px', fontWeight: 700, backgroundColor: meta.bg, color: meta.color }} />
          <StatusDropdown entityId={item.entity_id} currentStatus={item.status} onUpdated={onStatusUpdated} />
        </Box>
      </Box>

      {/* Product — desktop */}
      <Box
        component={item.product_url ? 'a' : 'div'}
        href={item.product_url ?? undefined}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center', gap: 1,
          textDecoration: 'none',
          cursor: item.product_url ? 'pointer' : 'default',
          '&:hover .pname': item.product_url ? { color: 'primary.main', textDecoration: 'underline' } : {},
        }}
      >
        <Box sx={{
          width: 38, height: 38, borderRadius: 1.25, overflow: 'hidden', flexShrink: 0,
          border: '1px solid', borderColor: 'divider', backgroundColor: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {imgSrc ? (
            <Box component='img' src={imgSrc} alt={item.product_name ?? ''} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.currentTarget.style.display = 'none' }} />
          ) : (
            <BrokenImageOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          )}
        </Box>
        <Typography className='pname' sx={{ fontSize: '12.5px', fontWeight: 500, color: 'text.primary', transition: 'color 0.15s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.product_name || `Product #${item.product_id}`}
        </Typography>
      </Box>

      {/* SKU */}
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
        {item.sku || '—'}
      </Typography>

      {/* Quantity */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
        {item.quantity ? (
          <>
            <ScaleIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{item.quantity} {item.unit || ''}</Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>—</Typography>
        )}
      </Box>

      {/* Action chip */}
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Chip
          icon={<Box sx={{ color: `${meta.color} !important`, display: 'flex', ml: '6px !important' }}>{meta.icon}</Box>}
          label={meta.label}
          size='small'
          sx={{ height: 22, fontSize: '11px', fontWeight: 600, backgroundColor: meta.bg, color: meta.color, '& .MuiChip-label': { px: 1 } }}
        />
      </Box>

      {/* Status dropdown */}
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <StatusDropdown
          entityId={item.entity_id}
          currentStatus={item.status}
          onUpdated={onStatusUpdated}
        />
      </Box>

      {/* Time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
        <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: '11px', color: 'text.disabled', whiteSpace: 'nowrap' }}>
          {formatDate(item.created_at)}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function SellerInquiriesPage() {
  const customerQuery = useCustomerQuery(CustomerDocument, { fetchPolicy: 'cache-and-network' })

  const { data, loading, error } = useQuery(GET_SELLER_ACTIVITIES, {
    variables: { seller_id: sellerId },
    fetchPolicy: 'cache-and-network',
  })

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  // Local status overrides so UI updates instantly without refetch
  const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({})

  const handleStatusUpdated = (entityId: number, newStatus: string) => {
    setStatusOverrides((prev) => ({ ...prev, [entityId]: newStatus }))
  }

  const rawActivities: SellerActivity[] = data?.getSellerActivities ?? []

  // Merge status overrides into activities
  const activities = useMemo(
    () => rawActivities.map((a) => ({
      ...a,
      status: statusOverrides[a.entity_id] ?? a.status,
    })),
    [rawActivities, statusOverrides],
  )

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach((a) => { counts[a.action_type] = (counts[a.action_type] ?? 0) + 1 })
    return counts
  }, [activities])

  const filtered = useMemo(
    () => activities.filter((a) => {
      const matchesType = filterType === 'ALL' || a.action_type === filterType
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        (a.customer_name ?? '').toLowerCase().includes(q) ||
        (a.phone_number ?? '').includes(q) ||
        (a.product_name ?? '').toLowerCase().includes(q) ||
        (a.sku ?? '').toLowerCase().includes(q)
      return matchesType && matchesSearch
    }),
    [activities, filterType, search],
  )

  const actionTypes = ['ALL', ...Array.from(new Set(activities.map((a) => a.action_type)))]

  return (
    <>
      <PageMeta title={i18n._('Customer Inquiries')} metaRobots={['noindex']} />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.65rem' }, letterSpacing: '-0.02em' }}>
              Customer Inquiries
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: 'text.secondary', mt: 0.5 }}>
              All customer interactions logged against your products
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 3 }}>
            <StatCard label='Total' count={activities.length} color='#455a64' icon={<RequestQuoteIcon sx={{ fontSize: 17 }} />} />
            <StatCard label='Requirements' count={stats['SUBMIT_REQUIREMENT'] ?? 0} color='#1565c0' icon={<RequestQuoteIcon sx={{ fontSize: 17 }} />} />
            <StatCard label='Notifications' count={stats['NOTIFY_SELLER'] ?? 0} color='#e65100' icon={<NotificationsActiveIcon sx={{ fontSize: 17 }} />} />
            <StatCard label='Price Requests' count={stats['GET_LATEST_PRICE'] ?? 0} color='#4e342e' icon={<PriceChangeOutlinedIcon sx={{ fontSize: 17 }} />} />
            <StatCard label='Contact Views' count={stats['VIEW_CONTACT'] ?? 0} color='#00695c' icon={<VisibilityOutlinedIcon sx={{ fontSize: 17 }} />} />
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size='small'
              placeholder='Search by name, phone, product, SKU…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: '1 1 220px', maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size='small' sx={{ minWidth: 155 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={<FilterListIcon sx={{ fontSize: 15, color: 'text.disabled', mr: 0.5 }} />}
              >
                {actionTypes.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t === 'ALL' ? 'All Types' : getActionMeta(t).label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography sx={{ fontSize: '12px', color: 'text.secondary', ml: 'auto' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Table */}
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'background.paper' }}>
            <TableHeader />

            {loading && (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={22} thickness={4} />
                <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Loading inquiries…</Typography>
              </Box>
            )}

            {error && !loading && (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '13px', color: 'error.main' }}>Failed to load inquiries. Please try again.</Typography>
              </Box>
            )}

            {!loading && !error && filtered.length === 0 && (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'text.secondary' }}>
                  {search || filterType !== 'ALL' ? 'No matching inquiries' : 'No inquiries yet'}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.disabled', mt: 0.5 }}>
                  {search || filterType !== 'ALL' ? 'Try adjusting your search or filter' : 'Customer interactions will appear here'}
                </Typography>
              </Box>
            )}

            {!loading && !error && filtered.map((item) => (
              <ActivityRow key={item.entity_id} item={item} onStatusUpdated={handleStatusUpdated} />
            ))}
          </Box>

        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = { Layout: LayoutNavigation }
SellerInquiriesPage.pageOptions = pageOptions
export default SellerInquiriesPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  return {
    props: {
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}