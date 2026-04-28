import React from 'react'
import type { ImageProps } from '@graphcommerce/image'
import { extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Skeleton, Typography, Tooltip, Box, Button, useMediaQuery, useTheme } from '@mui/material'
import { useRouter } from 'next/router'

import type { ProductListItemFragment } from '@graphcommerce/magento-product/Api/ProductListItem.gql'
import { ProductListPrice } from '@graphcommerce/magento-product/components/ProductListPrice/ProductListPrice'
import { ProductDiscountLabel } from '@graphcommerce/magento-product/components/ProductListItem/ProductDiscountLabel'

import type { ProductListItemImageProps } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImage'
import {
  ProductListItemImage,
  ProductListItemImageSkeleton,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImage'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StoreIcon from '@mui/icons-material/Store'
import CallIcon from '@mui/icons-material/Call'
import ReceiptIcon from '@mui/icons-material/Receipt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { Chip } from '@mui/material'

import type {
  ProductListItemImageAreaKeys,
  ProductListsItemImageAreaProps,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImageContainer'
import {
  ProductImageContainer,
  ProductListItemImageAreas,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImageContainer'

import { CustomProductListItemTitleAndPriceProps } from './CustomProductListItemTitleAndPrice'
import { CustomProductListItemTitleAndPrice } from './CustomProductListItemTitleAndPrice'

import dynamic from 'next/dynamic'

import {
  ProductPageAddToCartActionsRow,
} from '@graphcommerce/magento-product'
import { CustomAddProductsToCartButton } from '../../components/addtocart/CustomAddProductsToCartButton'


import { useProductSeller } from '../../hooks/useProductSeller'
import { useState } from 'react'
import { SellerActionDialog } from '../SellerActionDialog'
import type { SellerActionType } from '../../hooks/useSellerAction'
import { ViewSellerContactDialog } from '../Viewsellercontactdialog'


/* ---------------------------------- STYLES ---------------------------------- */
const { classes, selectors } = extendableComponent('MyProductListItem', [
  'root',
  'imageContainer',
  'discount',
  'titleContainer',
] as const)

/* ---------------------------------- TYPES ---------------------------------- */
type StyleProps = { imageOnly?: boolean }

export type BaseProps = {
  imageOnly?: boolean
  sx?: SxProps<Theme>
  slotProps?: {
    image?: Partial<ProductListItemImageProps>
    imageAreas?: Partial<ProductListsItemImageAreaProps>
    titleAndPrice?: Partial<CustomProductListItemTitleAndPriceProps>
  }
} & StyleProps &
  Omit<CustomProductListItemTitleAndPriceProps, 'title' | 'classes' | 'children'> &
  Omit<ProductListItemImageProps, 'classes'> &
  Omit<ProductListsItemImageAreaProps, 'classes'> &
  Pick<ImageProps, 'loading' | 'sizes' | 'dontReportWronglySizedImages'>

export type SkeletonProps = BaseProps & { __typename: 'Skeleton' }
export type ProductProps = BaseProps & ProductListItemFragment
export type ProductListItemProps = ProductProps | SkeletonProps


/* --------------------------- REAL PRODUCT ITEM --------------------------- */
function ProductListItemReal(props: ProductProps) {
  const {
    name,
    seller_id,
    subTitle,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    small_image,
    price_range,
    imageOnly = false,
    loading,
    sizes,
    dontReportWronglySizedImages,
    aspectRatio = [4, 3],
    titleComponent = 'h2',
    sx = [],
    slotProps = {},
  } = props

  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const sellerId = seller_id ? Number(seller_id) : undefined
  const { seller } = useProductSeller(sellerId)
  console.log(seller)

  const AddToCartClient = dynamic(
    () =>
      import('../addtocart/CustomAddProductsToCartButton')
        .then((mod) => mod.CustomAddProductsToCartButton),
    { ssr: false }
  )


  const productUrl = `/p/${props.url_key}`
  const sellerUrl = seller?.store_code ? `/seller/${seller.store_code}` : '#'
  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean
    actionType: SellerActionType
  }>({ open: false, actionType: 'NOTIFY_SELLER' })

  const openDialog = (actionType: SellerActionType) =>
    setDialogState({ open: true, actionType })

  const closeDialog = () =>
    setDialogState((prev) => ({ ...prev, open: false }))

  const [contactOpen, setContactOpen] = useState(false)


  const titleAndPriceClasses = {
    titleContainer: classes.titleContainer,
    title: classes.titleContainer,
    subtitle: classes.discount,
  }

  return (
    <Box
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        {
          display: 'flex',
          flexDirection: 'row', // Always horizontal
          gap: { xs: 1, sm: 1.5 },
          p: { xs: 1.5, sm: 1 },
          backgroundColor: '#fff',
          borderRadius: { xs: '12px', sm: 2 },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      ]}
    >
      {/* IMAGE */}
      <Box
        sx={{
          flex: { xs: '0 0 100px', sm: '0 0 180px' },
          width: { xs: '100px', sm: '180px' },
          cursor: 'pointer',
          flexShrink: 0,
          display: { xs: 'flex', sm: 'block' }, // Flex on mobile only
          alignItems: { xs: 'center', sm: 'initial' }, // Center on mobile only
          alignSelf: { xs: 'stretch', sm: 'initial' }, // Stretch on mobile only
        }}
        onClick={() => router.push(productUrl)}
      >
        <ProductImageContainer
          className={classes.imageContainer}
          sx={{
            width: '100%',
            height: { xs: '100px', sm: 'auto' }, // Fixed on mobile, auto on desktop
            '& img': {
              objectFit: { xs: 'cover', sm: 'contain' }, // Cover on mobile, contain on desktop
              height: { xs: '100%', sm: 'auto' },
            },
          }}
        >
          <ProductListItemImage
            src={small_image?.url || '/images/placeholder-product.png'}
            alt={small_image?.label || name}
            aspectRatio={isMobile ? [1, 1] : aspectRatio}
            loading={loading}
            sizes={sizes}
            dontReportWronglySizedImages={dontReportWronglySizedImages}
            {...slotProps.image}
          />

          {!imageOnly && (
            <ProductListItemImageAreas
              classes={{
                topLeft: classes.discount,
                topRight: undefined,
                bottomLeft: undefined,
                bottomRight: undefined,
              }}
              topLeft={
                <>
                  {(() => {
                    const regular = price_range?.minimum_price?.regular_price?.value
                    const final = price_range?.minimum_price?.final_price?.value

                    const hasDiscount =
                      regular != null &&
                      final != null &&
                      regular > final

                    const discountPercent = hasDiscount
                      ? Math.round(((regular - final) / regular) * 100)
                      : 0

                    if (!hasDiscount) return null

                    return (
                      <Box
                        sx={{
                          backgroundColor: '#2e7d32', // green
                          color: '#fff',
                          px: 0.75,
                          py: '2px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-block',
                        }}
                      >
                        {discountPercent}% OFF
                      </Box>
                    )
                  })()}

                  {topLeft}
                </>
              }
              topRight={topRight}
              bottomLeft={bottomLeft}
              bottomRight={bottomRight}
              {...slotProps.imageAreas}
            />
          )}
        </ProductImageContainer>
      </Box>

      {/* CONTENT */}
      {!imageOnly && (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* TITLE + PRICE */}
          <CustomProductListItemTitleAndPrice
            classes={titleAndPriceClasses}
            titleComponent={titleComponent}
            title={
              <Tooltip title={name} placement="top-start" arrow disableInteractive>
                <Typography
                  component="a"
                  href={productUrl}
                  sx={{
                    fontSize: { xs: 14, sm: 14 },
                    fontWeight: 500,
                    lineHeight: 1.3,
                    pt: '5px',
                    color: 'text.primary',
                    textDecoration: 'none',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {name}
                </Typography>
              </Tooltip>
            }
          >
            {price_range?.minimum_price && (() => {
              const regular = price_range.minimum_price.regular_price?.value
              const final = price_range.minimum_price.final_price?.value

              const hasDiscount =
                regular != null &&
                final != null &&
                regular > final

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  {/* Final Price (Top) */}
                  <Typography
                    sx={{
                      fontSize: { xs: 16, sm: 14 },
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    ₹ {final?.toLocaleString('en-IN') ?? '-'}
                  </Typography>

                  {/* Regular Price (Below) */}
                  {hasDiscount && (
                    <Typography
                      sx={{
                        fontSize: { xs: 12, sm: 12 },
                        color: 'text.disabled',
                        textDecoration: 'line-through',
                      }}
                    >
                      ₹ {regular?.toLocaleString('en-IN')}
                    </Typography>
                  )}
                </Box>
              )
            })()}
          </CustomProductListItemTitleAndPrice>

          {/* LOCATION */}
          {seller?.area && (
            <Typography
              sx={{
                fontSize: { xs: '13px !important', sm: '14px !important' },
                fontWeight: 400,
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              <LocationOnIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'primary.main' }} />
              {seller.area}
              {seller.city ? `, ${seller.city}` : ''}
            </Typography>
          )}

          {/* SELLER INFO */}
          {seller?.store_name && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 0.75 },
                mt: { xs: 1, sm: '9px' },
                flexWrap: 'wrap',
              }}
            >
              {/* Store Icon */}
              <StoreIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'primary.main' }} />

              {/* Seller Name */}
              <Typography
                component="a"
                href={sellerUrl}
                sx={{
                  fontSize: { xs: '13px !important', sm: '14px !important' },
                  fontWeight: '400 !important',
                  lineHeight: '1.3 !important',
                  color: 'primary.main',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {seller.store_name}
              </Typography>

              {/* TAGS - Hide some on mobile */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                {/* Trusted */}
                {seller?.trust_seal && (
                  <Tooltip title="Verified & trusted seller" arrow>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        px: { xs: '4px', sm: '6px' },
                        py: '2px',
                        borderRadius: '6px',
                        backgroundColor: '#F1F8F4',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#1B5E20' }} />
                      <Typography
                        sx={{
                          fontSize: { xs: '10px !important', sm: '11px !important' },
                          fontWeight: 600,
                          color: '#1B5E20',
                          lineHeight: 1,
                          display: { xs: 'none', sm: 'block' },
                        }}
                      >
                        Trusted
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Top Seller - Desktop only */}
                {seller?.buyer_protected_badge && !isMobile && (
                  <Tooltip title="Top rated seller" arrow>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        px: '6px',
                        py: '2px',
                        borderRadius: '6px',
                        backgroundColor: '#F1F8F4',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#1B5E20' }} />
                      <Typography
                        sx={{
                          fontSize: '11px !important',
                          fontWeight: 600,
                          color: '#1B5E20',
                          lineHeight: 1,
                        }}
                      >
                        Protected
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>
          )}

          {/* SELLER TRUST INFO */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: { xs: 0.75, sm: 1 },
              mb: { xs: 1, sm: '9px' },
              mt: { xs: 1, sm: '9px' },
            }}
          >
            {/* GST */}

            {seller?.gst_number && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#007a6e' }} />
                <Typography sx={{ fontSize: { xs: '11px !important', sm: '12px !important' } }}>GST</Typography>
              </Box>
            )}


            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#007a6e' }} />
              <Typography sx={{ fontSize: { xs: '11px !important', sm: '12px !important' } }}>Email</Typography>
            </Box>

            {/* Mobile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#007a6e' }} />
              <Typography sx={{ fontSize: { xs: '11px !important', sm: '12px !important' } }}>Mobile</Typography>
            </Box>

            {/* Member Since */}
            {seller?.years_in_business && (
              <Chip
                label={`${seller?.years_in_business ?? 0} Years`}
                size="small"
                sx={{
                  height: { xs: 16, sm: 18 },
                  fontSize: { xs: '10px !important', sm: '11px !important' },
                  fontWeight: 600,
                  backgroundColor: 'teal',
                  color: '#ffffff',
                  borderRadius: '6px',
                }}
              />
            )}

            {/* Fast Response - Desktop only */}
            {seller?.secure_badge && !isMobile && (
              <Tooltip title="Responds quickly" arrow>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    px: '6px',
                    py: '2px',
                    borderRadius: '6px',
                    backgroundColor: '#E3F2FD',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                  <Typography
                    sx={{
                      fontSize: '11px !important',
                      fontWeight: 600,
                      color: '#0D47A1',
                      lineHeight: 1,
                    }}
                  >
                    Secure
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {!seller?.secure_badge && seller?.on_time_delivery_badge && !isMobile && (
              <Tooltip title="Responds quickly" arrow>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    px: '6px',
                    py: '2px',
                    borderRadius: '6px',
                    backgroundColor: '#E3F2FD',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                  <Typography
                    sx={{
                      fontSize: '11px !important',
                      fontWeight: 600,
                      color: '#0D47A1',
                      lineHeight: 1,
                    }}
                  >
                    On-Time Delivery
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {/* ACTIONS - Responsive */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 0.75 },
              mt: { xs: 1, sm: 1.5 },
              flexWrap: 'wrap',
            }}
          >
            {/* View Number */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setContactOpen(true)}
              sx={{
                minHeight: { xs: 28, sm: 30 },
                px: { xs: 0.75, sm: 1 },
                fontSize: { xs: 10, sm: 11 },
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flex: { xs: '1 1 auto', sm: '0 0 auto' },
              }}
            >
              <CallIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#007a6e' }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>View Number</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Call</Box>
            </Button>

            {/* Quote */}
            <ProductPageAddToCartActionsRow product={props}>
              <AddToCartClient
                product={props}
                variant="outlined"
                size="small"
                startIcon={<ReceiptIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                sx={{
                  minHeight: { xs: 28, sm: 30 },
                  px: { xs: 0.75, sm: 1 },
                  fontSize: { xs: 10, sm: 11 },
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                Add to Quote
              </AddToCartClient>
            </ProductPageAddToCartActionsRow>


            {/* <Box sx={{
              minHeight: { xs: 28, sm: 30 },
              px: { xs: 0.75, sm: 1 },
              fontSize: { xs: 10, sm: 11 },
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
            }}>
              <ReceiptIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'black' }} />
              <ProductPageAddToCartActionsRow product={props}>
                <CustomAddProductsToCartButton product={props} />
              </ProductPageAddToCartActionsRow>
            </Box> */}



            {/* Notify Seller */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => openDialog('NOTIFY_SELLER')}
              sx={{
                minHeight: { xs: 28, sm: 30 },
                px: { xs: 0.75, sm: 1 },
                fontSize: { xs: 10, sm: 11 },
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flex: { xs: '1 1 auto', sm: '0 0 auto' },
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'gold' }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Notify Seller</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Notify</Box>
            </Button>
          </Box>
          {sellerId && props.id && (
            <SellerActionDialog
              open={dialogState.open}
              onClose={closeDialog}
              actionType={dialogState.actionType}
              productId={Number(props.id)}
              sellerId={sellerId}
              unitLabel=''
            />
          )}

          {/* View Contact Dialog */}
          {sellerId && props.id && (
            <ViewSellerContactDialog
              open={contactOpen}
              onClose={() => setContactOpen(false)}
              seller={seller}
              productId={Number(props.id)}
              sellerId={sellerId}
            />
          )}



        </Box>
      )}
    </Box>
  )
}

/* ------------------------------ SKELETON ------------------------------ */
function ProductListItemSkeleton(props: BaseProps) {
  const { aspectRatio, imageOnly = false } = props

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row', // Always horizontal
        gap: { xs: 1, sm: 2 },
        p: { xs: 1.5, sm: 1 },
      }}
    >
      <Box sx={{ width: { xs: 100, sm: 180 }, height: { xs: 100, sm: 'auto' }, flexShrink: 0 }}>
        <ProductImageContainer>
          <ProductListItemImageSkeleton aspectRatio={aspectRatio} />
        </ProductImageContainer>
      </Box>

      {!imageOnly && (
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Skeleton width="80%" height={36} />
        </Box>
      )}
    </Box>
  )
}

/* ------------------------------ EXPORT ------------------------------ */
function isSkeleton(props: ProductListItemProps): props is SkeletonProps {
  return props.__typename === 'Skeleton'
}

export function MyProductListItem(props: ProductListItemProps) {
  return isSkeleton(props) ? (
    <ProductListItemSkeleton {...props} />
  ) : (
    <ProductListItemReal {...props} />
  )
}

MyProductListItem.selectors = { ...selectors, ...ProductListPrice.selectors }

/** @deprecated */
export type OverlayAreaKeys = ProductListItemImageAreaKeys
/** @deprecated */
export type OverlayAreas = ProductListsItemImageAreaProps