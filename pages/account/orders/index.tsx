import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import {
  AccountDashboardOrdersDocument,
  AccountOrders,
  WaitForCustomer,
  getCustomerAccountIsDisabled,
  useCustomerQuery,
} from '@graphcommerce/magento-customer'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  FullPageMessage,
  IconSvg,
  LayoutTitle,
  iconBox,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { useRouter } from 'next/router'
import type { LayoutNavigationProps } from '../../../components'
import { LayoutDocument, LayoutNavigation } from '../../../components'
import { AccountLayout } from '../../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function AccountOrdersPage() {
  const { query } = useRouter()

  const orders = useCustomerQuery(AccountDashboardOrdersDocument, {
    fetchPolicy: 'cache-and-network',
    variables: {
      pageSize: 5,
      currentPage: Number(query?.page ?? 1),
    },
  })

  const customer = orders.data?.customer

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Orders')} metaRobots={['noindex']} />

      <AccountLayout>
        <WaitForCustomer waitFor={orders}>
          {customer?.orders && customer.orders.items.length > 0 && (
            <>
              <LayoutTitle icon={iconBox}>
                <Trans id='Orders' />
              </LayoutTitle>

              <AccountOrders {...customer} />
            </>
          )}

          {customer?.orders && customer.orders.items.length < 1 && (
            <FullPageMessage
              title={<Trans id='You have no orders yet' />}
              icon={<IconSvg src={iconBox} size='xxl' />}
            >
              <Trans id='Discover our collection and place your first order!' />
            </FullPageMessage>
          )}
        </WaitForCustomer>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

AccountOrdersPage.pageOptions = pageOptions
export default AccountOrdersPage

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