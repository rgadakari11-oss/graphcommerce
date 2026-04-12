import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function BusinessDetailsPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    console.log('Business Details:', data)

    // TODO:
    // Call your GraphQL mutation here to save business details
  }

  return (
    <>
      <PageMeta title='Business Details' />

      <Container maxWidth='md'>
        <Box mt={8} mb={10}>
          {/* Header */}
          <Typography variant='h4' fontWeight={600} gutterBottom>
            <Trans id='Enter Your Business Details' />
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={4}>
            <Trans id='Please provide accurate business address information for verification.' />
          </Typography>

          {/* Form Card */}
          <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
            <Box component='form' onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Business Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'Business Name')}
                    name='business_name'
                    required
                  />
                </Grid>

                {/* Pincode */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'Pincode')}
                    name='pincode'
                    inputProps={{ maxLength: 6 }}
                  />
                </Grid>

                {/* Plot / Building Details */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={i18n._(
                      /* i18n */ 'Plot No. / Bldg No. / Wing / Shop No. / Floor',
                    )}
                    name='plot_details'
                  />
                </Grid>

                {/* Building / Society */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={i18n._(
                      /* i18n */ 'Building Name / Market / Colony / Society',
                    )}
                    name='building_name'
                  />
                </Grid>

                {/* Street & Landmark */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'Street / Road Name')}
                    name='street'
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'Landmark')}
                    name='landmark'
                  />
                </Grid>

                {/* Area */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'Area')}
                    name='area'
                  />
                </Grid>

                {/* City & State */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'City')}
                    name='city'
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={i18n._(/* i18n */ 'State')}
                    name='state'
                  />
                </Grid>

                {/* Action */}
                <Grid item xs={12} mt={2}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    <Trans id='Save and Continue' />
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  )
}

BusinessDetailsPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default BusinessDetailsPage

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
      up: { href: '/', title: i18n._(/* i18n */ 'Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}
