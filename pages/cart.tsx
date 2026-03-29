import { WaitForQueries } from '@graphcommerce/ecommerce-ui'
import type { PageOptions } from '@graphcommerce/framer-next-pages'
import {
  ApolloCartErrorAlert,
  CartStartCheckout,
  CartTotals,
  EmptyCart,
  getCartDisabled,
  useCartQuery,
} from '@graphcommerce/magento-cart'
import { CartPageDocument } from '@graphcommerce/magento-cart-checkout'
import { CouponAccordion } from '@graphcommerce/magento-cart-coupon'
import { CartCrosssellsScroller, CartItemsActionCards } from '@graphcommerce/magento-cart-items'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  FullPageMessage,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation, productListRenderer } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { cacheFirst } from '@graphcommerce/graphql'
import { gql, useMutation } from '@apollo/client'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

const SUBMIT_QUOTE_REQUEST = gql`
  mutation SubmitQuoteRequest($input: QuoteRequestInput!) {
    submitQuoteRequest(input: $input) {
      order_number
    }
  }
`


function CartPage() {
  const cart = useCartQuery(CartPageDocument, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })
  const [submitQuoteRequest, { loading: submitting }] = useMutation(SUBMIT_QUOTE_REQUEST)
  const { error, data } = cart
  const hasError = Boolean(error)

  const hasItems =
    (data?.cart?.total_quantity ?? 0) > 0 &&
    typeof data?.cart?.prices?.grand_total?.value !== 'undefined'

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    emailAddress: '',
    deliveryDate: '',
    paymentTerms: '',
    additionalNotes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.mobileNumber) {
      alert('Mobile number is required')
      return
    }

    if (!formData.emailAddress) {
      alert('Email is required')
      return
    }

    try {
      const cartId = data?.cart?.id

      if (!cartId) {
        alert('Cart not found')
        return
      }

      const response = await submitQuoteRequest({
        variables: {
          input: {
            cart_id: cartId,
            customer_name: formData.customerName,
            mobile_number: formData.mobileNumber,
            email: formData.emailAddress,
            delivery_date: formData.deliveryDate,
            payment_terms: formData.paymentTerms,
            additional_notes: formData.additionalNotes,
          },
        },
      })

      const orderNumber = response?.data?.submitQuoteRequest?.order_number

      if (orderNumber) {
        alert(`✅ Order placed successfully!\nOrder Number: ${orderNumber}`)
        window.location.href = `/checkout/success?order=${orderNumber}`
      }
    } catch (error: any) {
      console.error(error)
      alert(error?.message ?? 'Failed to place order')
    }
  }

  return (
    <>
      <PageMeta
        title="Request a Quote - Wholesale Portal"
        metaRobots={['noindex']}
      />

      {/* Main Heading Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5,
          px: 4,
          borderRadius: 2,
          mb: 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          What is a Quote Request?
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 800, mx: 'auto', mb: 1.5, lineHeight: 1.4 }}>
          A quote request lets you get <strong>customized pricing</strong> based on your specific needs. Unlike fixed prices, quotes are personalized for your quantity, delivery schedule, and requirements.
        </Typography>

        {/* Quick Benefits Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 900, mx: 'auto' }}>
          {['✓ Volume Discounts Available', '✓ Flexible Payment Terms', '✓ Custom Delivery Options', '✓ No Purchase Obligation'].map((benefit) => (
            <Chip
              key={benefit}
              label={benefit}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontWeight: 600,
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: 2.5 }}>
        <WaitForQueries
          waitFor={cart}
          fallback={
            <FullPageMessage icon={<CircularProgress />} title={<Trans id='Loading' />}>
              <Trans id='This may take a second' />
            </FullPageMessage>
          }
        >
          {hasItems ? (
            <>
              {/* Two Column Layout */}
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {/* Left Sidebar - Explanation */}
                <Grid item xs={12} lg={4} xl={3.5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      position: 'sticky',
                      top: 20,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {/* How It Works */}
                    <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🔄 How It Works
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { num: 1, title: 'Select Products', desc: 'Choose items and quantities you need from the product list' },
                        { num: 2, title: 'Provide Details', desc: 'Fill in your contact info and any special requirements' },
                        { num: 3, title: 'Submit Request', desc: 'Send your quote request to our sales team for review' },
                        { num: 4, title: 'Receive Quote', desc: 'Get your custom quote via SMS/Email within 24-48 hours' },
                        { num: 5, title: 'Review & Approve', desc: 'Negotiate terms if needed, then approve to place order' }
                      ].map((step) => (
                        <Box
                          key={step.num}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            p: 2.25,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: 2.5,
                            borderLeft: '4px solid #667eea',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(5px)',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 35,
                              height: 35,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 16,
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                            }}
                          >
                            {step.num}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} mb={0.5} fontSize="0.9375rem">
                              {step.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.8125rem" lineHeight={1.6}>
                              {step.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Content - Quote Request Form */}
                <Grid item xs={12} lg={8} xl={8.5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, sm: 4.5 },
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <span>🛒</span>
                      Your Quote Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Review your selected products and provide your information below
                    </Typography>

                    {/* Cart Items - Using the original cart items component */}
                    <Box sx={{ mb: 4 }}>
                      <CartItemsActionCards cart={data.cart} />
                    </Box>

                    {/* Coupon Section */}
                    <CouponAccordion sx={(theme) => ({ mt: theme.spacings.md, mb: 3 })} />

                    {/* Cart Summary - Styled like quote page */}
                    <Box
                      sx={{
                        background: '#f8fafc',
                        p: 3,
                        borderRadius: 2.5,
                        border: '2px dashed #cbd5e1',
                        mb: 4,
                      }}
                    >
                      <CartTotals containerMargin sx={{ typography: 'body1' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0', display: 'block', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                        <strong>Note:</strong> Final pricing may include volume discounts, custom shipping rates, and negotiated terms.
                      </Typography>
                    </Box>

                    {/* Error Alert */}
                    <ApolloCartErrorAlert error={error} />

                    <Divider sx={{ mb: 4, height: 2, background: 'linear-gradient(to right, #e2e8f0, transparent)' }} />

                    {/* Contact Information Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                      <Typography variant="h5" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <span>📋</span>
                        Contact Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Provide your details so we can send you a customized quote
                      </Typography>

                      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Enter your name"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            required
                            label="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            helperText="Required field"
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="email"
                            label="Email Address"
                            value={formData.emailAddress}
                            onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                            placeholder="your.email@example.com"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Expected Delivery Date"
                            value={formData.deliveryDate}
                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>

                      <FormControl fullWidth sx={{ mb: 2.5 }}>
                        <InputLabel>Preferred Payment Terms</InputLabel>
                        <Select
                          value={formData.paymentTerms}
                          label="Preferred Payment Terms"
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        >
                          <MenuItem value="">Select payment terms (optional)</MenuItem>
                          <MenuItem value="net-30">Net 30</MenuItem>
                          <MenuItem value="net-60">Net 60</MenuItem>
                          <MenuItem value="net-90">Net 90</MenuItem>
                          <MenuItem value="prepayment">Prepayment</MenuItem>
                          <MenuItem value="cod">Cash on Delivery</MenuItem>
                          <MenuItem value="installment">Installment Plan</MenuItem>
                          <MenuItem value="other">Other (specify in notes)</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Additional Notes"
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        placeholder={`Share any additional information:
• Delivery address or special delivery instructions
• Bulk discount requirements
• Custom specifications
• Payment preferences
• Any questions or special requests`}
                        sx={{ mb: 4 }}
                      />

                      {/* Submit Section */}
                      <Box sx={{ textAlign: 'center', pt: 4, borderTop: '2px solid #e2e8f0' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            px: 6,
                            py: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: 2.5,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            },
                          }}
                        >
                          📤 Submit Quote Request
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontSize: '0.8125rem' }}>
                          By submitting, you agree to our terms. Our team will respond within 24-48 business hours.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Cross-sells */}
                  <CartCrosssellsScroller
                    renderer={productListRenderer}
                    sx={(theme) => ({ mt: theme.spacings.lg })}
                  />
                </Grid>
              </Grid>

              {/* Benefits Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 4,
                }}
              >
                <Typography variant="h4" fontWeight={700} textAlign="center" mb={2.5}>
                  Why Request a Quote?
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 900, mx: 'auto', mb: 4, fontSize: '0.9375rem', lineHeight: 1.8 }}>
                  Discover the advantages of getting personalized pricing for your wholesale needs
                </Typography>

                <Grid container spacing={3}>
                  {[
                    { icon: '💵', title: 'Volume Discounts', desc: 'Save significantly on bulk orders with tiered pricing. The more you buy, the better your per-unit cost.' },
                    { icon: '📅', title: 'Flexible Payment Terms', desc: 'Negotiate Net 30, Net 60, or custom payment schedules that align with your cash flow and business cycle.' },
                    { icon: '🎯', title: 'Customized Solutions', desc: 'Get product configurations, packaging, and delivery options tailored to your specific requirements.' },
                    { icon: '⚡', title: 'Priority Service', desc: 'Quote customers receive dedicated account management, faster response times, and priority order processing.' },
                    { icon: '🔒', title: 'Price Protection', desc: 'Lock in competitive pricing for contract periods and protect your business from market fluctuations.' },
                    { icon: '📦', title: 'Logistics Support', desc: 'We coordinate shipping, handle warehousing if needed, and arrange scheduled deliveries to match your operations.' }
                  ].map((benefit, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: '2px solid #e2e8f0',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#667eea',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.1)',
                            transform: 'translateY(-3px)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 55,
                                height: 55,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 26,
                                flexShrink: 0,
                              }}
                            >
                              {benefit.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={600} fontSize="1.125rem">
                              {benefit.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" fontSize="0.875rem" lineHeight={1.6}>
                            {benefit.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* FAQ Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 5,
                }}
              >
                <Typography variant="h4" fontWeight={700} textAlign="center" mb={2.5}>
                  Frequently Asked Questions
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 900, mx: 'auto', mb: 4, fontSize: '0.9375rem', lineHeight: 1.8 }}>
                  Everything you need to know about requesting and managing quotes
                </Typography>

                <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>❓</span> How long does it take to receive a quote?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                        Most quote requests are processed within 24-48 business hours. For complex or large-volume requests, it may take up to 3-5 business days. You'll receive an email or SMS notification as soon as your quote is ready.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>📊</span> Is there a minimum order quantity?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                        We don't enforce strict minimums, but quotes become more competitive at higher volumes. Generally, orders over $5,000 qualify for better pricing tiers. However, we're happy to quote any order size if you have special requirements.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>⏰</span> How long is my quote valid?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                        Standard quotes are valid for 30 days from the issue date. If you need more time to decide, contact your sales representative - we can often extend the validity period. For long-term contracts, we can lock in pricing for 6-12 months or longer.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>💬</span> Can I negotiate the quoted price?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                        Absolutely! Our quotes are starting points for discussion. Factors that can improve your pricing include increasing order quantities, committing to recurring orders, flexible delivery schedules, prepayment or shorter payment terms, and bundling multiple products.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>💳</span> What payment terms are available?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem" mb={1}>
                        We offer flexible payment options based on your business relationship:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2.5, mt: 1.25, '& li': { mb: 1, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.6 } }}>
                        <li><strong>Net 30/60/90:</strong> Standard terms for approved businesses</li>
                        <li><strong>Prepayment:</strong> Often qualifies for additional discounts (2-5%)</li>
                        <li><strong>Installment Plans:</strong> Split large orders into scheduled payments</li>
                        <li><strong>Cash on Delivery:</strong> Available for immediate settlements</li>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ border: '2px solid #e2e8f0', borderRadius: '10px !important', mb: 2, '&:before': { display: 'none' }, '&:hover': { borderColor: '#667eea' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1rem' }}>
                        <span style={{ fontSize: 22 }}>📦</span> What's included in shipping costs?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                        Shipping costs in your quote cover standard ground freight to your delivery address. Large orders often qualify for free or reduced shipping. We can also adjust for expedited shipping, special handling, international shipping, or consolidated shipments to multiple locations.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Paper>

              {/* Footer */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 5,
                }}
              >
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem">
                  🔒 <strong>Your information is secure.</strong> We use industry-standard encryption and never share your data.
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem" mt={2}>
                  Questions? Contact us at <a href="tel:+15551234567" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>+1 (555) 123-4567</a> or <a href="mailto:quotes@wholesale.com" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>quotes@wholesale.com</a>
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} fontSize="0.875rem" mt={2}>
                  <a href="#" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a> • <a href="#" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a> • <a href="#" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Return Policy</a>
                </Typography>
              </Paper>
            </>
          ) : (
            <EmptyCart disableMargin>
              {error && <ApolloCartErrorAlert error={error} />}
            </EmptyCart>
          )}
        </WaitForQueries>
      </Container>
    </>
  )
}


CartPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default CartPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  if (getCartDisabled(context.locale)) return { notFound: true }

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
      up: { href: '/', title: i18n._('Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}