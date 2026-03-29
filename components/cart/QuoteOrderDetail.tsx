/**
 * QuoteOrderDetail.tsx
 *
 * A component to display a customer order that originated from a Quote Request.
 * Shows all quote form fields and seller_id per line item.
 *
 * Usage: Drop into your account/orders/[number].tsx page or embed it
 * inside whatever component renders order details.
 */

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { gql, useQuery } from '@graphcommerce/graphql'

// ─── GraphQL Query ─────────────────────────────────────────────────────────────

export const GET_QUOTE_ORDER_DETAIL = gql`
  query GetQuoteOrderDetail($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }) {
        items {
          id
          number
          status
          order_date
          total {
            grand_total {
              value
              currency
            }
            subtotal {
              value
              currency
            }
            taxes {
              amount {
                value
                currency
              }
              title
            }
            discounts {
              amount {
                value
                currency
              }
              label
            }
          }
          # Quote-specific custom fields
          quote_customer_name
          quote_mobile_number
          quote_email_address
          quote_delivery_date
          quote_payment_terms
          quote_additional_notes
          # Line items including seller_id
          items {
            id
            product_name
            product_sku
            quantity_ordered
            quantity_shipped
            quantity_canceled
            product_sale_price {
              value
              currency
            }
            discounts {
              amount {
                value
                currency
              }
              label
            }
            seller_id
          }
          payment_methods {
            name
            type
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          billing_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
          }
        }
      }
    }
  }
`

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Money {
  value: number
  currency: string
}

interface OrderItem {
  id: string
  product_name: string
  product_sku: string
  quantity_ordered: number
  quantity_shipped?: number
  quantity_canceled?: number
  product_sale_price: Money
  discounts?: Array<{ amount: Money; label: string }>
  seller_id?: string | null
}

interface OrderAddress {
  firstname: string
  lastname: string
  street: string[]
  city: string
  region?: string
  postcode: string
  country_code: string
  telephone?: string
}

interface CustomerOrder {
  id: string
  number: string
  status: string
  order_date: string
  total: {
    grand_total: Money
    subtotal: Money
    taxes?: Array<{ amount: Money; title: string }>
    discounts?: Array<{ amount: Money; label: string }>
  }
  quote_customer_name?: string | null
  quote_mobile_number?: string | null
  quote_email_address?: string | null
  quote_delivery_date?: string | null
  quote_payment_terms?: string | null
  quote_additional_notes?: string | null
  items: OrderItem[]
  payment_methods?: Array<{ name: string; type: string }>
  shipping_address?: OrderAddress | null
  billing_address?: OrderAddress | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatMoney(money: Money): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currency,
  }).format(money.value)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatAddress(addr: OrderAddress): string {
  return [
    `${addr.firstname} ${addr.lastname}`,
    ...(addr.street ?? []),
    `${addr.city}, ${addr.region ?? ''} ${addr.postcode}`,
    addr.country_code,
    addr.telephone ? `Tel: ${addr.telephone}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function formatPaymentTerms(terms: string): string {
  const map: Record<string, string> = {
    'net-30': 'Net 30',
    'net-60': 'Net 60',
    'net-90': 'Net 90',
    prepayment: 'Prepayment',
    cod: 'Cash on Delivery',
    installment: 'Installment Plan',
    other: 'Other',
  }
  return map[terms] ?? terms
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <Typography
      variant="h6"
      fontWeight={700}
      mb={2}
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <span>{icon}</span> {title}
    </Typography>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ minWidth: 160 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

// ─── Quote Details Panel ───────────────────────────────────────────────────────

function QuoteDetailsPanel({ order }: { order: CustomerOrder }) {
  const hasAnyQuoteField =
    order.quote_customer_name ||
    order.quote_mobile_number ||
    order.quote_email_address ||
    order.quote_delivery_date ||
    order.quote_payment_terms ||
    order.quote_additional_notes

  if (!hasAnyQuoteField) return null

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '2px solid #667eea',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%)',
        mb: 3,
      }}
    >
      <SectionHeader icon="📋" title="Quote Request Details" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Customer Name" value={order.quote_customer_name} />
          <InfoRow label="Mobile Number" value={order.quote_mobile_number} />
          <InfoRow label="Email Address" value={order.quote_email_address} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow
            label="Expected Delivery"
            value={order.quote_delivery_date ? formatDate(order.quote_delivery_date) : null}
          />
          <InfoRow
            label="Payment Terms"
            value={order.quote_payment_terms ? formatPaymentTerms(order.quote_payment_terms) : null}
          />
        </Grid>
        {order.quote_additional_notes && (
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" fontWeight={600} color="text.secondary" mb={0.5}>
              Additional Notes:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                background: 'white',
                p: 2,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              {order.quote_additional_notes}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  )
}

// ─── Order Items Table ─────────────────────────────────────────────────────────

function OrderItemsTable({ items }: { items: OrderItem[] }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <SectionHeader icon="🛒" title="Ordered Items" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Seller ID
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Unit Price
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Qty Ordered
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Qty Shipped
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Row Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                sx={{ '&:hover': { background: '#f8fafc' }, transition: 'background 0.2s' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.product_name}
                  </Typography>
                  {item.discounts?.map((d) => (
                    <Chip
                      key={d.label}
                      size="small"
                      label={`${d.label}: -${formatMoney(d.amount)}`}
                      color="success"
                      variant="outlined"
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {item.product_sku}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {item.seller_id ? (
                    <Chip
                      label={item.seller_id}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{formatMoney(item.product_sale_price)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{item.quantity_ordered}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{item.quantity_shipped ?? 0}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {formatMoney({
                      value: item.product_sale_price.value * item.quantity_ordered,
                      currency: item.product_sale_price.currency,
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

// ─── Order Summary Panel ───────────────────────────────────────────────────────

function OrderSummaryPanel({ order }: { order: CustomerOrder }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <SectionHeader icon="🧾" title="Order Summary" />

      {/* Status / Date Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          label={order.status}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Placed on {formatDate(order.order_date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Order #{order.number}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Totals */}
      <Box sx={{ maxWidth: 360, ml: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
          <Typography variant="body2">{formatMoney(order.total.subtotal)}</Typography>
        </Box>
        {order.total.discounts?.map((d) => (
          <Box key={d.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="success.main">{d.label}</Typography>
            <Typography variant="body2" color="success.main">-{formatMoney(d.amount)}</Typography>
          </Box>
        ))}
        {order.total.taxes?.map((t) => (
          <Box key={t.title} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">{t.title}</Typography>
            <Typography variant="body2">{formatMoney(t.amount)}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" fontWeight={700}>Grand Total</Typography>
          <Typography variant="body1" fontWeight={700} color="#667eea">
            {formatMoney(order.total.grand_total)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

// ─── Address Panels ────────────────────────────────────────────────────────────

function AddressPanels({ order }: { order: CustomerOrder }) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {order.shipping_address && (
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionHeader icon="📦" title="Shipping Address" />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {formatAddress(order.shipping_address)}
            </Typography>
          </Paper>
        </Grid>
      )}
      {order.billing_address && (
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <SectionHeader icon="💳" title="Billing Address" />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {formatAddress(order.billing_address)}
            </Typography>
            {order.payment_methods?.map((pm) => (
              <Chip
                key={pm.type}
                label={pm.name}
                size="small"
                variant="outlined"
                sx={{ mt: 1.5 }}
              />
            ))}
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}

// ─── Main Export ───────────────────────────────────────────────────────────────

interface QuoteOrderDetailProps {
  orderNumber: string
}

export function QuoteOrderDetail({ orderNumber }: QuoteOrderDetailProps) {
  const { data, loading, error } = useQuery(GET_QUOTE_ORDER_DETAIL, {
    variables: { orderNumber },
    fetchPolicy: 'cache-and-network',
  })

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading order details...</Typography>
      </Box>
    )
  }

  if (error || !data?.customer?.orders?.items?.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Unable to load order details. Please try again.</Typography>
      </Box>
    )
  }

  const order: CustomerOrder = data.customer.orders.items[0]

  return (
    <Box>
      {/* Order Summary */}
      <OrderSummaryPanel order={order} />

      {/* Quote Request Details (highlighted) */}
      <QuoteDetailsPanel order={order} />

      {/* Line Items with seller_id column */}
      <OrderItemsTable items={order.items} />

      {/* Addresses */}
      <AddressPanels order={order} />
    </Box>
  )
}

export default QuoteOrderDetail
