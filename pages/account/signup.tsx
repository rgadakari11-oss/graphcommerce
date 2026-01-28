import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { LayoutTitle } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function SignupCustomerPage() {
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!mobile || mobile.length < 10) {
      alert(i18n._(/* i18n */ 'Please enter a valid mobile number'))
      return
    }

    setLoading(true)

    try {
      // 👉 Integrate OTP / API call here
      console.log('Signup mobile:', mobile)

      alert(i18n._(/* i18n */ 'Signup initiated'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Sign Up')} />
      <LayoutTitle>
        <Trans id='Create your account' />
      </LayoutTitle>

      <Container maxWidth='sm'>
        <Box mt={8} mb={12}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant='h4' gutterBottom>
                <Trans id='Sign up' />
              </Typography>

              <Typography variant='body2' color='text.secondary' mb={3}>
                <Trans id='Enter your mobile number to create your account' />
              </Typography>

              <TextField
                label={i18n._(/* i18n */ 'Mobile Number')}
                placeholder='Enter mobile number'
                fullWidth
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                }}
                sx={{ mb: 3 }}
              />

              <Button
                variant='contained'
                size='large'
                fullWidth
                onClick={handleSignup}
                disabled={loading}
              >
                <Trans id='Sign Up' />
              </Button>

              <Box mt={3} textAlign='center'>
                <Typography variant='body2' color='text.secondary'>
                  <Trans id='Already have an account?' />{' '}
                  <Button href='/account/signin' size='small'>
                    <Trans id='Sign In' />
                  </Button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  )
}

SignupCustomerPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default SignupCustomerPage

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
