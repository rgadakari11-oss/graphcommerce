import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  ChangePasswordForm,
  WaitForCustomer,
  getCustomerAccountIsDisabled,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  LayoutTitle,
  SectionContainer,
  iconLock,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Box, Typography } from '@mui/material'
import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { AccountLayout } from '../../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function AccountAuthenticationPage() {
  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Authentication')} metaRobots={['noindex']} />

      <AccountLayout>
        <WaitForCustomer>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Trans id='Authentication' />
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              <Trans id='Manage your password and account security' />
            </Typography>
          </Box>

          <Box sx={{ maxWidth: '560px' }}>
            <SectionContainer
              labelLeft={
                <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                  <Trans id='Change Password' />
                </Typography>
              }
              sx={{
                '& .MuiFormControl-root': {
                  mb: 2,
                },
              }}
            >
              <ChangePasswordForm />
            </SectionContainer>
          </Box>
        </WaitForCustomer>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

AccountAuthenticationPage.pageOptions = pageOptions
export default AccountAuthenticationPage

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