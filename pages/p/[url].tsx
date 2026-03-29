import { useState } from 'react'
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
import { AddProductsToCartView } from '../../components/ProductView/AddProductsToCartView'

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
//import { Reviews } from '../../components/ProductView/Reviews'
import type { ProductPage2Query } from '../../graphql/ProductPage2.gql'
import { ProductPage2Document } from '../../graphql/ProductPage2.gql'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import SellerReviews from '../../components/seller/SellerReviews'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import { CustomAddProductsToCartButton } from '../../components/addtocart/CustomAddProductsToCartButton'
import { VendorStoresDocument } from '../../graphql/vendorstore.gql'
import { useQuery } from '@apollo/client'
import { RelatedSellerProducts } from '../../components/ProductView/RelatedSellerProducts'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { getUnitLabel } from '../../lib/utils/attributeHelper'
import { AttributeOptionsDocument } from '../../graphql/product/AttributeOptions.gql'
import { SellerActionDialog } from '../../components/SellerActionDialog'
import type { SellerActionType } from '../../hooks/useSellerAction'

export type Props =
  ProductPage2Query &
  Pick<AddProductsToCartFormProps, 'defaultValues'> & {
    urlKey: string
    up?: {
      href: string
      title: string
    }
  }

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

  const sellerId =
    typeof product?.seller_id === 'number'
      ? product.seller_id
      : product?.seller_id
        ? parseInt(product.seller_id, 10)
        : undefined

  const { data: sellerData } = useQuery(VendorStoresDocument, {
    variables: {
      customer_id: sellerId,
      status: 1,
    },
    skip: !sellerId,
  })

  const seller = sellerData?.vendorStores?.[0]
  // Pull from product custom attributes
  const { data: attributeData } = useQuery(AttributeOptionsDocument)

  const unitOfMeasurement = (product as any)?.unit_of_measurement ?? (product as any)?.uom ?? ''
  const minQty = (product as any)?.mqa ?? null

  const unitOfMeasurementLabel = getUnitLabel(unitOfMeasurement, attributeData)
  const [dialogState, setDialogState] = useState<{
    open: boolean
    actionType: SellerActionType
  }>({ open: false, actionType: 'SUBMIT_REQUIREMENT' })

  const openDialog = (actionType: SellerActionType) =>
    setDialogState({ open: true, actionType })

  const closeDialog = () =>
    setDialogState((prev) => ({ ...prev, open: false }))


  if (!product?.sku || !product.url_key) return null

  // ← ADD THIS


  return (
    <PrivateQueryMaskProvider mask={scopedQuery.mask}>
      <AddProductsToCartForm key={product.uid} defaultValues={defaultValues}>

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
        <Box
          sx={(theme) => ({
            pl: '20px',
            pt: '2px',
            backgroundColor: '#fff',
            '& .MuiBreadcrumbs-ol': {
              fontSize: '13px',
              color: theme.palette.text.secondary,
              justifyContent: 'flex-start',
            },

            '& .MuiBreadcrumbs-separator': {
              mx: 0.5,
              color: theme.palette.divider,
            },

            '& a': {
              color: theme.palette.text.secondary,
              textDecoration: 'none',
              transition: 'color 0.2s',
            },

            '& a:hover': {
              color: theme.palette.primary.main,
            },

            [theme.breakpoints.down('md')]: {
              pt: 1.5,
            },
          })}
        >
          <Breadcrumbs separator="/" aria-label="breadcrumb">
            <Link underline="none" href="/">
              Home
            </Link>

            {props.up && (
              <Link underline="none" href={props.up.href}>
                {props.up.title}
              </Link>
            )}

            <Typography sx={{ color: 'text.primary', fontSize: "14px !important", fontWeight: 400 }}>
              {product.name}
            </Typography>
          </Breadcrumbs>
        </Box>


        <Box sx={{ '& .SidebarGallery-row': { mb: '0 !important' } }}>

          <CustomProductPageGallery product={product} disableSticky>
            <Box
              sx={(theme) => ({
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%',
                mb: 0,
                [theme.breakpoints.up('md')]: {
                  gridTemplateColumns: '0fr 2fr 1fr',
                  alignItems: 'start',
                  mb: 0,
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

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    <ProductPageName product={product} />
                  </Typography>
                </Box>

                {/* ── Location + Stock ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: '12.5px', color: 'text.primary' }}>
                      {seller?.area}
                      {seller?.city ? `, ${seller?.city}` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        flexShrink: 0,
                        boxShadow: '0 0 0 2px #c8e6c9',
                      }}
                    />
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#2e7d32' }}>
                      In Stock
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      · Ready to Ship
                    </Typography>
                  </Box>
                </Box>

                {/* -------------------- PRICE & SPECS BLOCK -------------------- */}
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {/* ── Price Row ── */}
                  {(() => {
                    const finalPrice = product.price_range?.minimum_price?.final_price
                    const regularPrice = product.price_range?.minimum_price?.regular_price
                    const hasDiscount =
                      regularPrice &&
                      finalPrice &&
                      regularPrice.value &&
                      finalPrice.value &&
                      regularPrice.value > finalPrice.value

                    const discountPercent = hasDiscount
                      ? Math.round(((regularPrice.value! - finalPrice.value!) / regularPrice.value!) * 100)
                      : 0




                    return (
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          backgroundColor: '#f7f9fc',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {/* ── Line 1: prices + discount + pill ── */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>

                          {/* Strikethrough regular price — only when discount */}
                          {hasDiscount && (
                            <Typography sx={{ fontSize: '14px', color: 'text.disabled', textDecoration: 'line-through' }}>
                              {regularPrice ? <Money {...regularPrice} /> : null}
                            </Typography>
                          )}

                          {/* Final / special price */}
                          <Typography sx={{ fontSize: '22px', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                            {finalPrice ? <Money {...finalPrice} /> : '—'}
                          </Typography>

                          {/* Unit of measurement */}
                          <Typography sx={{ fontSize: '13px', color: 'text.secondary', fontWeight: 400 }}>
                            / {unitOfMeasurementLabel}
                          </Typography>

                          {/* Discount badge */}
                          {hasDiscount && (
                            <Box sx={{ px: 1, py: 0.2, borderRadius: 0.5, backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#2e7d32' }}>
                                {discountPercent}% OFF
                              </Typography>
                            </Box>
                          )}

                          {/* Get Latest Price pill */}
                          <Box
                            component="span"
                            onClick={() => openDialog('GET_LATEST_PRICE')}
                            sx={{
                              ml: 0.5, px: 1, py: 0.2, borderRadius: 0.5,
                              backgroundColor: 'primary.main', color: '#fff',
                              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                              '&:hover': { opacity: 0.9 },
                            }}
                          >
                            Get Latest Price
                          </Box>
                        </Box>

                        {/* ── Line 2: MOQ ── */}
                        {minQty && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                              Minimum Order Quantity:
                            </Typography>
                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>
                              {minQty} {unitOfMeasurementLabel}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )
                  })()}



                </Box>

                {/* -------------------- B2B ACTION SECTION -------------------- */}

                <Box
                  sx={{
                    mt: 2,
                    p: { xs: 1.5, sm: 2 },
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
                      rowGap: { xs: 2, md: 0 },
                      alignItems: 'start',
                    }}
                  >
                    {/* -------------------- LEFT: Qty + Submit -------------------- */}
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: { xs: 1, sm: 1.5 },
                          flexDirection: 'row', // Changed to row for both mobile and desktop
                          justifyContent: { xs: 'stretch', md: 'flex-start' },
                        }}
                      >

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* Quantity Input */}
                          <Box
                            component="input"
                            type="number"
                            min={minQty || 1}
                            defaultValue={minQty || 1}
                            sx={{
                              flex: 1,   // 🔥 important
                              height: 36,
                              px: 1.25,
                              border: '1px solid',
                              borderColor: 'black',
                              borderRadius: 1,
                            }}
                          />

                          {/* Unit Box */}
                          <Box
                            sx={{
                              flex: 1,   // 🔥 same width as qty
                              height: 36,
                              px: 1.25,
                              border: '1px solid',
                              borderColor: 'black',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                            }}
                          >
                            {unitOfMeasurementLabel}
                          </Box>


                        </Box>
                      </Box>

                      <Button
                        variant="outlined"
                        onClick={() => openDialog('SUBMIT_REQUIREMENT')}
                        sx={{
                          mt: 1.5,
                          width: '100%',
                          height: { xs: 32, sm: 36 },
                          justifyContent: 'flex-start',
                          fontSize: { xs: '13px !important', sm: '15px !important' },
                          fontWeight: 500,
                          textTransform: 'none',
                          borderRadius: 1,
                          px: { xs: 1, sm: 1.5 },
                        }}
                      >
                        Submit Requirement
                      </Button>
                    </Box>

                    {/* -------------------- CENTER DIVIDER -------------------- */}
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          width: '1px',
                          height: '80px',
                          backgroundColor: 'divider',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'background.paper',
                          px: 1,
                          py: 0.5,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        OR
                      </Box>
                    </Box>

                    {/* Horizontal divider for mobile with OR text */}
                    <Box
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        my: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '1px',
                          backgroundColor: 'divider',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          backgroundColor: 'background.paper',
                          px: 2,
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                        OR
                      </Box>
                    </Box>

                    {/* -------------------- RIGHT: Get Quote / Notify -------------------- */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' }, // Row on mobile, column on desktop
                        gap: { xs: 1, sm: 2 },
                        alignItems: 'stretch',
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<RequestQuoteIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#1976d2' }} />}
                        sx={{
                          width: '100%',
                          height: { xs: 32, sm: 36 },
                          justifyContent: 'flex-start',
                          fontSize: { xs: '13px !important', sm: '15px !important' },
                          fontWeight: 500,
                          textTransform: 'none',
                          px: { xs: 1, sm: 1.5 },
                        }}
                      >

                        <Box sx={{ display: 'none' }}>
                          <AddProductsToCartView product={product} />
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          <ProductPageAddToCartActionsRow product={product}>
                            <CustomAddProductsToCartButton product={product} />
                          </ProductPageAddToCartActionsRow>
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          Quote
                        </Box>
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<NotificationsActiveIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#F9A825' }} />}
                        onClick={() => openDialog('NOTIFY_SELLER')}
                        sx={{
                          width: '100%',
                          height: { xs: 32, sm: 36 },
                          justifyContent: 'flex-start',
                          fontSize: { xs: '13px !important', sm: '15px !important' },
                          fontWeight: 500,
                          textTransform: 'none',
                          px: { xs: 1, sm: 1.5 },
                        }}
                      >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          Notify Seller
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          Notify
                        </Box>
                      </Button>
                    </Box>
                  </Box>
                </Box>



                <CustomProductSpecs title='' {...products} />


                {product?.short_description?.html ? (
                  <CustomProductShortDescription
                    product={product}
                    sx={{
                      px: { xs: 2, md: 0 },
                    }}
                  />
                ) : seller?.about_us ? (
                  <Box
                    sx={{
                      px: { xs: 2, md: 0 },
                      mt: 2,

                      // Force smaller font size
                      fontSize: '0.975rem!important',
                      lineHeight: '1.6 !important',

                      // Apply to all inner HTML elements
                      '& p, & span, & div, & li': {
                        fontSize: '0.975rem!important',
                        lineHeight: '1.6 !important',
                      },

                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        fontSize: '0.975rem!important',
                        fontWeight: '600 !important',
                        marginBottom: '6px',
                      },

                      '& ul, & ol': {
                        paddingLeft: '18px',
                      },
                    }}
                  >
                    <Typography
                      component="div"
                      dangerouslySetInnerHTML={{ __html: seller.about_us }}
                    />
                  </Box>
                ) : null}

                <ProductReviewChip rating={product.rating_summary} reviewSectionId='reviews' />
              </Box>

              {/* 3️⃣ SUPPLIER COLUMN */}
              {/* 3️⃣ SUPPLIER COLUMN */}
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SupplierInfoCard
                  seller={seller}
                  productId={Number(product.id ?? 0)}
                  sellerId={sellerId}
                />

                {/* ── Packaging & Delivery ── */}
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, backgroundColor: 'background.paper' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', mb: 1.5, color: 'text.primary' }}>
                    Packaging & Delivery
                  </Typography>
                  {[
                    { icon: '📦', label: 'Min. Order', value: '50 Units' },
                    { icon: '🚚', label: 'Delivery Time', value: '7–10 Business Days' },
                    { icon: '🌍', label: 'Supply Ability', value: '1000 Units / Month' },
                    { icon: '🏷️', label: 'Port', value: 'Mumbai, India' },
                  ].map(({ icon, label, value }) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                      <Typography sx={{ fontSize: '12px', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <span>{icon}</span>{label}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* ── Payment & Trade ── */}
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, backgroundColor: 'background.paper' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', mb: 1.5, color: 'text.primary' }}>
                    Payment & Trade
                  </Typography>
                  {[
                    { icon: '💳', label: 'Payment Terms', value: 'T/T, L/C, PayPal' },
                    { icon: '🔒', label: 'Trade Assurance', value: 'Secured' },
                    { icon: '📋', label: 'Accepted Currency', value: 'INR, USD' },
                  ].map(({ icon, label, value }) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                      <Typography sx={{ fontSize: '12px', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <span>{icon}</span>{label}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>



              </Box>


            </Box>
          </CustomProductPageGallery>
        </Box>



        <Box sx={(theme) => ({ width: '100%', display: 'flex', justifyContent: 'left' })}>
          <Box sx={{ width: { xs: '100%', md: '75%' } }}>
            {sellerId && (
              <RelatedSellerProducts
                sellerId={sellerId}
                currentSku={product.sku}
              />
            )}
            <SellerReviews averageRating={4} totalReviews={93} />
          </Box>
        </Box>

        {/* {product.related_products?.length > 0 && (
          <ProductScroller
            title='Looking Similar'
            items={product.related_products.filter(nonNullable)}
            productListRenderer={productListRenderer}
            sizes={responsiveVal(200, 400)}
          />
        )} */}



        <RecentlyViewedProducts
          title={<Trans id='Recently viewed products' />}
          exclude={[product.sku]}
          productListRenderer={productListRenderer}
          sizes={responsiveVal(200, 400)}
        />

        {sellerId && (
          <SellerActionDialog
            open={dialogState.open}
            onClose={closeDialog}
            actionType={dialogState.actionType}
            productId={Number(product.id ?? 0)}
            sellerId={sellerId}
            defaultQuantity={minQty ?? undefined}
            unitLabel={unitOfMeasurementLabel}
          />
        )}
      </AddProductsToCartForm>
    </PrivateQueryMaskProvider >
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