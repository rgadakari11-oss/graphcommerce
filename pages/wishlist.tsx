import { WaitForQueries } from '@graphcommerce/ecommerce-ui'
import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import { WishlistItemActionCard, useWishlistItems } from '@graphcommerce/magento-wishlist'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  Button,
  FullPageMessage,
  IconSvg,
  LayoutTitle,
  iconHeart,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { CircularProgress, Container, Box } from '@mui/material'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { cacheFirst } from '@graphcommerce/graphql'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function WishlistPage() {
  const wishlistItems = useWishlistItems()

  return (
    <>
      <PageMeta title={i18n._('Wishlist')} metaRobots={['noindex']} />

      <Container maxWidth='md'>
        <Box mt={6} mb={4}>
          <LayoutTitle component='h1' size='small' icon={iconHeart}>
            <Trans id='Wishlist' />
          </LayoutTitle>
        </Box>

        <WaitForQueries
          waitFor={[wishlistItems]}
          fallback={
            <FullPageMessage title={<Trans id='Loading' />} icon={<CircularProgress />}>
              <Trans id='We are fetching your favorite products, one moment please!' />
            </FullPageMessage>
          }
        >
          {wishlistItems.items.length === 0 ? (
            <FullPageMessage
              title={<Trans id='Your wishlist is empty' />}
              icon={<IconSvg src={iconHeart} size='xxl' />}
              button={
                <Button href='/' variant='pill' color='primary' size='large'>
                  <Trans id='Continue shopping' />
                </Button>
              }
            >
              <Trans id='Discover our collection and add items to your wishlist!' />
            </FullPageMessage>
          ) : (
            <>
              {wishlistItems.items.map((item) => (
                <WishlistItemActionCard key={item.id} item={item} />
              ))}
            </>
          )}
        </WaitForQueries>
      </Container>
    </>
  )
}

WishlistPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default WishlistPage

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
      up: { href: '/', title: i18n._('Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}
