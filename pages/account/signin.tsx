import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { getCustomerAccountIsDisabled } from '@graphcommerce/magento-customer'
import { CustomAccountSignInUpForm } from '../../components/account/CustomAccountSignInUpForm'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import { useMergeGuestWishlistWithCustomer } from '@graphcommerce/magento-wishlist'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { CompactAuthLayout } from '../../components/Layout/Compactauthlayout'
import { graphqlSharedClient } from '../../lib/graphql/graphqlSsrClient'
import { Box } from '@mui/material'

function AccountSignInPage() {
  useMergeGuestWishlistWithCustomer()

  return (
    <>
      <PageMeta title={i18n._(/* i18n */ 'Sign in')} metaRobots={['noindex']} />

      {/* Transparent full-viewport wrapper */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'transparent',
          zIndex: 1200,
        }}
      >
        <CompactAuthLayout>
          <CustomAccountSignInUpForm />
        </CompactAuthLayout>
      </Box>
    </>
  )
}

/**
 * IMPORTANT:
 * Remove GraphCommerce overlay/layout background
 * without using unsupported props.
 */
const pageOptions: PageOptions = {
  Layout: undefined,

  layoutProps: {
    sx: {
      backgroundColor: 'transparent',
      '& .Layout-root': {
        backgroundColor: 'transparent',
      },
      '& .Layout-content': {
        backgroundColor: 'transparent',
      },
      '& body': {
        backgroundColor: 'transparent',
      },
    },
  },
}

AccountSignInPage.pageOptions = pageOptions

export default AccountSignInPage

/**
 * 👇 No layout props → {}
 */
export const getStaticProps: GetStaticProps<{}> = async (context) => {
  if (getCustomerAccountIsDisabled(context.locale)) {
    return { notFound: true }
  }

  const client = graphqlSharedClient(context)
  const conf = client.query({ query: StoreConfigDocument })

  return {
    props: {
      apolloState: await conf.then(() => client.cache.extract()),
    },
  }
}
