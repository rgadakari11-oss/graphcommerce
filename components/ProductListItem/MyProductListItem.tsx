import React from 'react'
import type { ImageProps } from '@graphcommerce/image'
import { extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Skeleton, Typography, Tooltip, Box, Button } from '@mui/material'
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

// import type { ProductListItemTitleAndPriceProps } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemTitleAndPrice'
// import { ProductListItemTitleAndPrice } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemTitleAndPrice'
import { CustomProductListItemTitleAndPriceProps } from './CustomProductListItemTitleAndPrice'
import { CustomProductListItemTitleAndPrice } from './CustomProductListItemTitleAndPrice'

import { useProductSeller } from '../../hooks/useProductSeller'

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
  const { seller } = useProductSeller(seller_id)

  const productUrl = `/p/${props.url_key}`
  const sellerUrl = seller?.store_code ? `/seller/${seller.store_code}` : '#'

  return (
    <Box
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        {
          display: 'flex',
          gap: 1,
          p: 1,
          backgroundColor: '#fff',
          borderRadius: 2,
          overflow: 'hidden', // ✅ prevents horizontal scroll
        },
      ]}
    >
      {/* IMAGE */}
      <Box sx={{ flex: '0 0 180px', cursor: 'pointer' }} onClick={() => router.push(productUrl)}>
        <ProductImageContainer className={classes.imageContainer}>
          <ProductListItemImage
            classes={classes}
            src={small_image?.url || '/images/placeholder-product.png'}
            alt={small_image?.label || name}
            aspectRatio={aspectRatio}
            loading={loading}
            sizes={sizes}
            dontReportWronglySizedImages={dontReportWronglySizedImages}
            {...slotProps.image}
          />

          {!imageOnly && (
            <ProductListItemImageAreas
              classes={classes}
              topLeft={
                <>
                  <ProductDiscountLabel className={classes.discount} price_range={price_range} />
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
            classes={classes}
            titleComponent={titleComponent}
            title={
              <Tooltip title={name} placement="top-start" arrow disableInteractive>
                <Typography
                  component="a"
                  href={productUrl}
                  sx={{
                    fontSize: 13,
                    fontWeight: 450,
                    lineHeight: 1.3,
                    pt: '5px', // ✅ paddingTop added here
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
            {price_range?.minimum_price && (
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'primary.main',
                  whiteSpace: 'nowrap',
                }}
              >
                ₹{' '}
                {price_range.minimum_price.regular_price.value.toLocaleString('en-IN')}
              </Typography>
            )}
          </CustomProductListItemTitleAndPrice>


          {seller?.area && (
            <Typography
              sx={{
                fontSize: '14px !important',
                fontWeight: 400,
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              {seller.area}
              {seller.city ? `, ${seller.city}` : ''}
            </Typography>
          )}

          {seller?.store_name && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mt: '9px',
                flexWrap: 'wrap',
              }}
            >
              {/* Store Icon */}
              <StoreIcon sx={{ fontSize: 16, color: 'primary.main' }} />

              {/* Seller Name */}
              <Typography
                component="a"
                href={sellerUrl}
                sx={{
                  fontSize: '14px !important',
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

              {/* TAGS CONTAINER */}
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
                        Trusted
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Top Seller */}
                {seller?.trust_seal && (
                  <Tooltip title="Top rated seller" arrow>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        px: '6px',
                        py: '2px',
                        borderRadius: '6px',
                        backgroundColor: '#FFF8E1',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#F9A825' }} />
                      <Typography
                        sx={{
                          fontSize: '11px !important',
                          fontWeight: 600,
                          color: '#F57F17',
                          lineHeight: 1,
                        }}
                      >
                        Top Seller
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
              gap: 1,
              mb: '9px',
              mt: '9px',
            }}
          >
            {/* GST */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: '#007a6e' }} />
              <Typography sx={{ fontSize: '12px !important' }}>GST</Typography>
            </Box>

            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircleIcon sx={{ fontSize: 12, color: '#007a6e' }} />
              <Typography sx={{ fontSize: '12px !important' }}>Email</Typography>
            </Box>

            {/* Mobile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <CheckCircleIcon sx={{ fontSize: 12, color: '#007a6e' }} />
              <Typography sx={{ fontSize: '12px !important' }}>Mobile</Typography>
            </Box>

            {/* Member Since */}
            {seller?.years_in_business && (
              <Chip
                label={`${seller?.years_in_business ?? 0} Years`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '11px !important',
                  fontWeight: 600,
                  backgroundColor: 'teal', // dark green bg
                  color: '#ffffff',          // correct white
                  borderRadius: '6px',
                }}
              />
            )}

            {/* Fast Response */}
            {seller?.trust_seal && (
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
                    Fast Response
                  </Typography>
                </Box>
              </Tooltip>
            )}


          </Box>







          {/* ACTIONS */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              mt: 1.5,
              flexWrap: 'nowrap', // prevents wrapping
            }}
          >
            {/* View Number */}
            <Button
              variant="outlined"
              size="small"
              sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <CallIcon sx={{ fontSize: 14, color: '#007a6e' }} />
              View Number
            </Button>

            {/* Quote */}
            <Button
              variant="outlined"
              size="small"
              sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <ReceiptIcon sx={{ fontSize: 14, color: 'black' }} />
              Quote
            </Button>

            {/* Notify Seller */}
            <Button
              variant="outlined"
              size="small"
              sx={{
                minHeight: 30,
                px: 1,
                fontSize: 11,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: 14, color: 'gold' }} />
              Notify Seller
            </Button>
          </Box>




        </Box>
      )}
    </Box>
  )
}

/* ------------------------------ SKELETON ------------------------------ */
function ProductListItemSkeleton(props: BaseProps) {
  const { aspectRatio, imageOnly = false } = props

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ width: 180 }}>
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
