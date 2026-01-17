import type { PageOptions } from '@graphcommerce/framer-next-pages'
import {
  cacheFirst,
  mergeDeep,
  PrivateQueryMaskProvider,
  usePrivateQuery,
} from '@graphcommerce/graphql'
import type { AddProductsToCartFormProps } from '@graphcommerce/magento-product'
import {
  AddProductsToCartForm,
  getProductStaticPaths,
  jsonLdProduct,
  jsonLdProductOffer,
  ProductPageAddToCartActionsRow,
  productPageCategory,
  ProductPageDescription,
  ProductPageJsonLd,
  ProductPageMeta,
  ProductPageName,
  ProductScroller,
} from '@graphcommerce/magento-product'
import { CustomProductPageGallery } from '../../components/ProductView/CustomProductPageGallery'
import { SupplierInfoCard } from '../../components/ProductView/SupplierInfoCard'
import { CustomProductShortDescription } from '../../components/ProductView/CustomProductShortDescription'
import { CustomProductSpecs } from '../../components/ProductView/CustomProductSpecs'
import { defaultConfigurableOptionsSelection } from '@graphcommerce/magento-product-configurable'
import { RecentlyViewedProducts } from '@graphcommerce/magento-recently-viewed-products'
import { jsonLdProductReview, ProductReviewChip } from '@graphcommerce/magento-review'
import { Money, redirectOrNotFound, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import {
  isTypename,
  LayoutHeader,
  LayoutTitle,
  nonNullable,
  responsiveVal,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Typography,
  Box,
  Button,
} from '@mui/material'
import type { GetStaticPaths } from 'next'
import type { LayoutNavigationProps } from '../../components'
import { LayoutDocument, LayoutNavigation, productListRenderer } from '../../components'
import { Reviews } from '../../components/ProductView/Reviews'
import type { ProductPage2Query } from '../../graphql/ProductPage2.gql'
import { ProductPage2Document } from '../../graphql/ProductPage2.gql'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import SellerReviews from '../../components/seller/SellerReviews'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'

export type Props = ProductPage2Query & Pick<AddProductsToCartFormProps, 'defaultValues'> & { urlKey: string }
type RouteProps = { url: string }
type GetPageStaticPaths = GetStaticPaths<RouteProps>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props, RouteProps>

function ProductPage(props: Props) {
  const { defaultValues, urlKey } = props
  const scopedQuery = usePrivateQuery(
    ProductPage2Document,
    { variables: { urlKey, useCustomAttributes: import.meta.graphCommerce.magentoVersion >= 247 } },
    props,
  )

  const { products, relatedUpsells } = scopedQuery.data
  const product = mergeDeep(
    products?.items?.[0],
    relatedUpsells?.items?.find((i) => i?.uid === products?.items?.[0]?.uid),
  )

  if (!product?.sku || !product.url_key) return null

  return (
    <PrivateQueryMaskProvider mask={scopedQuery.mask}>
      <AddProductsToCartForm key={product.uid} defaultValues={defaultValues}>
        <LayoutHeader floatingMd>
          <LayoutTitle size='small'><ProductPageName product={product} /></LayoutTitle>
        </LayoutHeader>

        <ProductPageJsonLd
          product={product}
          render={(p) => ({
            '@context': 'https://schema.org',
            ...jsonLdProduct(p),
            ...jsonLdProductOffer(p),
            ...jsonLdProductReview(p),
          })}
        />

        <ProductPageMeta product={product} />

        <CustomProductPageGallery product={product} disableSticky>
          <Box
            sx={(theme) => ({
              display: 'grid',
              gridTemplateColumns: '1fr',
              width: '100%',
              [theme.breakpoints.up('md')]: {
                gridTemplateColumns: '0fr 2fr 1fr',
                alignItems: 'start',
              },
            })}
          >
            {/* 1️⃣ IMAGES COLUMN */}
            <Box sx={{ minWidth: 0 }} />

            {/* 2️⃣ CONTENT COLUMN */}
            <Box sx={{ minWidth: 0, pr: { xs: 0, md: 7 } }}>
              {isTypename(product, ['ConfigurableProduct', 'BundleProduct']) && (
                <Typography variant='body2' color='text.disabled'>
                  <Trans
                    id='As low as <0/>'
                    components={{ 0: <Money {...product.price_range.minimum_price.final_price} /> }}
                  />
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  <ProductPageName product={product} />
                </Typography>
              </Box>

              {/* -------------------- B2B ACTION SECTION -------------------- */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
                    columnGap: 3,
                    rowGap: 2,
                    alignItems: 'start',
                  }}
                >
                  {/* -------------------- LEFT: Qty + Submit -------------------- */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        justifyContent: { xs: 'center', md: 'flex-start' },
                      }}
                    >
                      <Box
                        component="input"
                        type="number"
                        placeholder="Qty"
                        min={1}
                        sx={{
                          width: 90,
                          height: 36,
                          px: 1.25,
                          border: '1px solid',
                          borderColor: 'black',
                          borderRadius: 1,
                        }}
                      />
                      <Box
                        component="select"
                        sx={{
                          width: 120,
                          height: 36,
                          px: 1.25,
                          border: '1px solid',
                          borderColor: 'black',
                          borderRadius: 1,
                        }}
                      >
                        <option value="Litre">Litre</option>
                        <option value="Kg">Kg</option>
                        <option value="Piece">Piece</option>
                        <option value="Pack">Pack</option>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      sx={{
                        mt: 1.5,
                        width: { xs: '80%', md: '100%' },
                        height: 36,
                        justifyContent: 'flex-start',
                        fontSize: "15px !important",
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 1,
                      }}
                    >
                      Submit Requirement
                    </Button>



                    {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Button
                        variant="outlined"
                        sx={{
                          width: { xs: '100%', md: 'auto' },
                          height: 36,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: "15px !important",
                          justifyContent: 'flex-start',
                          borderColor: 'divider',
                        }}
                      >
                        Submit Requirement
                      </Button>
                    </Box> */}
                  </Box>

                  {/* -------------------- CENTER DIVIDER -------------------- */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: { md: 1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: '100%', md: '1px' },
                        height: { xs: '1px', md: '64px' },
                        backgroundColor: 'divider',
                      }}
                    />
                  </Box>

                  {/* -------------------- RIGHT: Get Quote / Notify -------------------- */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<RequestQuoteIcon sx={{ fontSize: 16, color: '#1976d2' }} />}
                      sx={{
                        width: { xs: '80%', md: '100%' },
                        height: 36,
                        justifyContent: 'flex-start',
                        fontSize: "15px !important",
                        fontWeight: 500,
                        textTransform: 'none',
                      }}
                    >
                      Get a Quote
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<NotificationsActiveIcon sx={{ fontSize: 16, color: '#F9A825' }} />}
                      sx={{
                        width: { xs: '80%', md: '100%' },
                        height: 36,
                        justifyContent: 'flex-start',
                        fontSize: "15px !important",
                        fontWeight: 500,
                        textTransform: 'none',
                      }}
                    >
                      Notify Seller
                    </Button>
                  </Box>


                </Box>
              </Box>



              <CustomProductSpecs title='' {...products} />
              <CustomProductShortDescription product={product} />
              <ProductReviewChip rating={product.rating_summary} reviewSectionId='reviews' />
            </Box>

            {/* 3️⃣ SUPPLIER COLUMN */}
            <Box sx={{ minWidth: 0 }}>
              <SupplierInfoCard sellerId={product?.seller_id} />
            </Box>
          </Box>
        </CustomProductPageGallery>

        <Box sx={(theme) => ({ width: '100%', display: 'flex', justifyContent: 'left', mt: theme.spacings.xl })}>
          <Box sx={{ width: { xs: '100%', md: '75%' } }}>
            <SellerReviews />
          </Box>
        </Box>

        {product.related_products?.length > 0 && (
          <ProductScroller
            title='Looking Similar'
            items={product.related_products.filter(nonNullable)}
            productListRenderer={productListRenderer}
            sizes={responsiveVal(200, 400)}
          />
        )}

        <RecentlyViewedProducts
          title={<Trans id='Recently viewed products' />}
          exclude={[product.sku]}
          productListRenderer={productListRenderer}
          sizes={responsiveVal(200, 400)}
        />
      </AddProductsToCartForm>
    </PrivateQueryMaskProvider>
  )
}

ProductPage.pageOptions = { Layout: LayoutNavigation } as PageOptions
export default ProductPage

export const getStaticPaths: GetPageStaticPaths = async ({ locales = [] }) => {
  if (process.env.NODE_ENV === 'development') return { paths: [], fallback: 'blocking' }
  const paths = (await Promise.all(locales.map((l) => getProductStaticPaths(graphqlSsrClient({ locale: l }), l)))).flat(1)
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetPageStaticProps = async (context) => {
  const { locale, params } = context
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const urlKey = params?.url ?? '??'
  const conf = client.query({ query: StoreConfigDocument })
  const productPage = staticClient.query({
    query: ProductPage2Document,
    variables: { urlKey, useCustomAttributes: import.meta.graphCommerce.magentoVersion >= 247 },
  })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  const product = productPage.then((pp) => pp.data.products?.items?.find((p) => p?.url_key === urlKey))
  if (!(await product)) return redirectOrNotFound(staticClient, conf, params, locale)
  const category = productPageCategory(await product)
  const up = category?.url_path && category?.name ? { href: `/${category.url_path}`, title: category.name } : { href: '/', title: i18n._('Home') }
  return {
    props: {
      urlKey,
      ...defaultConfigurableOptionsSelection(urlKey, client, (await productPage).data),
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
      up,
    },
    revalidate: 1200,
  }
}