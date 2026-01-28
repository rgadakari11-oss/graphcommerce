import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  CustomerDocument,
  UpdateCustomerEmailForm,
  WaitForCustomer,
  getCustomerAccountIsDisabled,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  LayoutTitle,
  SectionContainer,
  iconEmailOutline,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Box, Typography, Skeleton } from '@mui/material'
import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { AccountLayout } from '../../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function AccountContactPage() {
  const dashboard = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const customer = dashboard.data?.customer

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Contact')} metaRobots={['noindex']} />

      <AccountLayout>
        <WaitForCustomer waitFor={dashboard}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              <Trans id='Contact' />
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              <Trans id='Manage your email address and contact preferences' />
            </Typography>
          </Box>

          <Box sx={{ maxWidth: '560px' }}>
            {customer ? (
              <SectionContainer
                labelLeft={
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    <Trans id='Email Address' />
                  </Typography>
                }
                sx={{
                  '& .MuiFormControl-root': {
                    mb: 2,
                  },
                }}
              >
                <UpdateCustomerEmailForm email={customer.email ?? ''} />
              </SectionContainer>
            ) : (
              <Box>
                <Skeleton variant='rectangular' height={60} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' height={60} />
              </Box>
            )}
          </Box>
        </WaitForCustomer>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

AccountContactPage.pageOptions = pageOptions
export default AccountContactPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  if (getCustomerAccountIsDisabled(context.locale)) return { notFound: true }

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