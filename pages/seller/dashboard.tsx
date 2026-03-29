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
import { Box, Typography, Grid, Card, CardContent, alpha } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { SellerAccountLayout } from '../../components/account/Selleraccountlayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function SellerDashboardPage() {
  const customerQuery = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const stats = [
    {
      title: 'Total Sales',
      value: '$12,458',
      change: '+12.5%',
      icon: AttachMoneyIcon,
      color: '#10b981',
    },
    {
      title: 'Active Products',
      value: '48',
      change: '+3',
      icon: ShoppingBagIcon,
      color: '#3b82f6',
    },
    {
      title: 'Pending Inquiries',
      value: '7',
      change: '+2',
      icon: QuestionAnswerIcon,
      color: '#f59e0b',
    },
    {
      title: 'Monthly Growth',
      value: '23%',
      change: '+5.2%',
      icon: TrendingUpIcon,
      color: '#8b5cf6',
    },
  ]

  return (
    <>
      <PageMeta
        title={i18n._(/* i18n */ 'Seller Dashboard')}
        metaRobots={['noindex']}
      />

      <SellerAccountLayout>
        <WaitForCustomer waitFor={customerQuery}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: '1.75rem', md: '2rem' },
              }}
            >
              <Trans id='Welcome back!' />
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              <Trans id="Here's what's happening with your seller account today" />
            </Typography>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Grid item xs={6} md={3} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: stat.color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 12px ${alpha(stat.color, 0.15)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 36, md: 40 },
                            height: { xs: 36, md: 40 },
                            borderRadius: 2,
                            bgcolor: alpha(stat.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon sx={{ color: stat.color, fontSize: { xs: 20, md: 22 } }} />
                        </Box>
                      </Box>
                      <Typography
                        variant='h5'
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: stat.color,
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', md: '0.75rem' },
                          }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          {/* Quick Actions */}
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
              <Trans id='Quick Actions' />
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha('#1976d2', 0.02),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                      <Trans id='Add New Product' />
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <Trans id='List a new item for sale' />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha('#1976d2', 0.02),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                      <Trans id='View Inquiries' />
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <Trans id='Respond to customer questions' />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha('#1976d2', 0.02),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                      <Trans id='Manage Inventory' />
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <Trans id='Update stock and prices' />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </WaitForCustomer>
      </SellerAccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

SellerDashboardPage.pageOptions = pageOptions
export default SellerDashboardPage

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