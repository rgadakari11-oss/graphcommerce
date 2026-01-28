import type { PageOptions } from '@graphcommerce/framer-next-pages'
import {
  AccountAddresses,
  AccountDashboardAddressesDocument,
  WaitForCustomer,
  getCustomerAccountIsDisabled,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { CountryRegionsDocument, PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  LayoutOverlayHeader,
  LayoutTitle,
  iconAddresses,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { Container } from '@mui/material'
import type { LayoutOverlayProps } from '../../../components'
import { LayoutOverlay } from '../../../components'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'

type GetPageStaticProps = GetStaticProps<LayoutOverlayProps>

function AccountAddressesPage() {
  const addresses = useCustomerQuery(AccountDashboardAddressesDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const customer = addresses.data?.customer

  return (
    <>
      {/* ✅ Header keeps sidebar */}
      <LayoutOverlayHeader>
        <LayoutTitle size='small' component='span' icon={iconAddresses}>
          <Trans id='Addresses' />
        </LayoutTitle>
      </LayoutOverlayHeader>

      <Container maxWidth='md'>
        <PageMeta title={i18n._('Addresses')} metaRobots={['noindex']} />

        <WaitForCustomer waitFor={addresses}>
          <LayoutTitle icon={iconAddresses}>
            <Trans id='Addresses' />
          </LayoutTitle>

          <AccountAddresses
            addresses={customer?.addresses}
            loading={!addresses.data}
          />
        </WaitForCustomer>
      </Container>
    </>
  )
}

const pageOptions: PageOptions<LayoutOverlayProps> = {
  overlayGroup: 'account',
  Layout: LayoutOverlay,
  sharedKey: () => 'account/addresses',
}

AccountAddressesPage.pageOptions = pageOptions

export default AccountAddressesPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  if (getCustomerAccountIsDisabled(context.locale)) return { notFound: true }

  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)

  await staticClient.query({ query: CountryRegionsDocument })
  await client.query({ query: StoreConfigDocument })

  return {
    props: {
      apolloState: client.cache.extract(),
      variantMd: 'bottom',
      up: { href: '/account', title: i18n._('Account') },
    },
  }
}
