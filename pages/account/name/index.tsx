import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  ChangeNameForm,
  CustomerDocument,
  WaitForCustomer,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { LayoutTitle, SectionContainer, iconId } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Box, Typography, Skeleton } from '@mui/material'
import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { AccountLayout } from '../../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function AccountNamePage() {
  const dashboard = useCustomerQuery(CustomerDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const customer = dashboard.data?.customer

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Name')} metaRobots={['noindex']} />

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
              <Trans id='Name' />
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              <Trans id='Update your personal information' />
            </Typography>
          </Box>

          <Box sx={{ maxWidth: '560px' }}>
            {customer ? (
              <SectionContainer
                labelLeft={
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    <Trans id='Personal Details' />
                  </Typography>
                }
                sx={{
                  '& .MuiFormControl-root': {
                    mb: 2,
                  },
                }}
              >
                <ChangeNameForm
                  prefix={customer.prefix ?? ''}
                  firstname={customer.firstname ?? ''}
                  lastname={customer.lastname ?? ''}
                />
              </SectionContainer>
            ) : (
              <Box>
                <Skeleton variant='rectangular' height={60} sx={{ mb: 2 }} />
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

AccountNamePage.pageOptions = pageOptions
export default AccountNamePage

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