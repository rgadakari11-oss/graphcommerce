import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { LayoutTitle } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation } from '../../components'
import { AccountLayout } from '../../components/account/AccountLayout'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function AccountIndexPage() {
  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Account')} metaRobots={['noindex']} />

      <AccountLayout>
        <LayoutTitle>
          <Trans id='Select an option from the menu' />
        </LayoutTitle>
      </AccountLayout>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

AccountIndexPage.pageOptions = pageOptions
export default AccountIndexPage

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