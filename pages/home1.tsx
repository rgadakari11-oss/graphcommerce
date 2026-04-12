import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { Box, Button, Container, Grid, TextField, Typography, Card, CardContent } from '@mui/material'
import React from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function HomePage() {
  return (
    <>
      <PageMeta title='B2B Marketplace - Home' />

      {/* HERO */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 10 } }}>
        <Container>
          <Grid container spacing={6} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography variant='h3' fontWeight={700} gutterBottom>
                India’s Trusted B2B Marketplace
              </Typography>

              <Typography variant='body1' color='text.secondary' mb={4}>
                Connect with verified suppliers, compare prices, and get the best bulk deals.
              </Typography>

              <Box display='flex' gap={2} flexWrap='wrap'>
                <Button variant='contained' size='large'>
                  Request Quote
                </Button>
                <Button variant='outlined' size='large'>
                  Browse Products
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* FIX: fallback image */}
              <Box
                component='img'
                src='https://via.placeholder.com/600x400?text=B2B+Marketplace'
                alt='B2B'
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* TRUST BADGES */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={3} textAlign='center'>
          {[
            'GST Verified Sellers',
            'No Middlemen',
            'Direct from Manufacturer',
            'Genuine Trade Leads',
          ].map((item) => (
            <Grid item xs={6} md={3} key={item}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f1f5f9',
                  fontWeight: 600,
                }}
              >
                {item}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CATEGORIES */}
      <Container sx={{ py: 6 }}>
        <Typography variant='h5' fontWeight={600} mb={3}>
          Explore Categories
        </Typography>

        <Grid container spacing={3}>
          {[
            'Agriculture',
            'Construction',
            'Electronics',
            'Clothing',
            'Healthcare',
            'Home Essentials',
          ].map((cat) => (
            <Grid item xs={6} sm={4} md={2} key={cat}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 2,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Typography fontWeight={600}>{cat}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* WHY US */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container>
          <Typography variant='h5' fontWeight={600} mb={4}>
            Why Choose Us
          </Typography>

          <Grid container spacing={4}>
            {[
              'Bulk Pricing Advantage',
              'Fast Delivery Across India',
              'Verified Suppliers',
              'Easy Inquiry Process',
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography fontWeight={600}>{item}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* INDUSTRIES */}
      <Container sx={{ py: 8 }}>
        <Typography variant='h5' fontWeight={600} mb={4}>
          Industries We Serve
        </Typography>

        <Grid container spacing={3}>
          {['Retail', 'Manufacturing', 'Hospitality', 'Healthcare'].map((item) => (
            <Grid item xs={6} md={3} key={item}>
              <Card
                sx={{
                  p: 3,
                  textAlign: 'center',
                  transition: '0.3s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Typography>{item}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Box sx={{ bgcolor: '#eef2ff', py: 8 }}>
        <Container>
          <Typography variant='h5' fontWeight={600} mb={4}>
            How It Works
          </Typography>

          <Grid container spacing={4}>
            {[
              'Submit Requirement',
              'Get Quotes',
              'Compare & Order',
              'Fast Delivery',
            ].map((step, i) => (
              <Grid item xs={12} md={3} key={step}>
                <Box textAlign='center'>
                  <Typography variant='h4' color='primary'>
                    {i + 1}
                  </Typography>
                  <Typography>{step}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* STATS */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} textAlign='center'>
          {[
            { label: 'Verified Suppliers', value: '10,000+' },
            { label: 'Products', value: '10K+' },
            { label: 'Industries', value: '20+' },
            { label: 'Cities', value: '30+' },
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.label}>
              <Typography variant='h4' fontWeight={700} color='primary'>
                {item.value}
              </Typography>
              <Typography>{item.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* LEAD FORM */}
      <Box sx={{ bgcolor: '#1e40af', py: 8 }}>
        <Container maxWidth='sm'>
          <Typography variant='h5' color='#fff' align='center' mb={4}>
            Get Best Bulk Deals
          </Typography>

          <Grid container spacing={2}>
            {['Your Name', 'Company Name', 'Phone Number'].map((label) => (
              <Grid item xs={12} key={label}>
                <TextField fullWidth label={label} variant='filled' />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField fullWidth label='Requirement' multiline rows={3} variant='filled' />
            </Grid>

            <Grid item xs={12}>
              <Button fullWidth variant='contained' color='secondary' size='large'>
                Request Quote
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CATALOG */}
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant='h6' mb={2}>
          Download Product Catalog
        </Typography>
        <Button variant='outlined'>Download PDF</Button>
      </Container>
    </>
  )
}

HomePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default HomePage

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