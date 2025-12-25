import React from 'react'
import type { ImageProps } from '@graphcommerce/image'
import { extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Skeleton, Typography } from '@mui/material'

import type { ProductListItemFragment } from '@graphcommerce/magento-product/Api/ProductListItem.gql'
import { productLink } from '@graphcommerce/magento-product/hooks/useProductLink'
import { ProductListPrice } from '@graphcommerce/magento-product/components/ProductListPrice/ProductListPrice'
import { ProductDiscountLabel } from '@graphcommerce/magento-product/components/ProductListItem/ProductDiscountLabel'

import type { ProductListItemImageProps } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImage'
import {
  ProductListItemImage,
  ProductListItemImageSkeleton,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImage'

import type {
  ProductListItemImageAreaKeys,
  ProductListsItemImageAreaProps,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImageContainer'
import {
  ProductImageContainer,
  ProductListItemImageAreas,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemImageContainer'

import {
  ProductListItemLinkOrDiv,
  ProductListItemLinkOrDivProps,
} from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemLinkOrDiv'

import type { ProductListItemTitleAndPriceProps } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemTitleAndPrice'
import { ProductListItemTitleAndPrice } from '@graphcommerce/magento-product/components/ProductListItem/ProductListItemTitleAndPrice'

import { useSellerMap } from '../../hooks/useSellerMap'

/* ---------------------------------- STYLES ---------------------------------- */

const { classes, selectors } = extendableComponent('MyProductListItem', [
  'root',
  'imageContainer',
  'discount',
] as const)

/* ---------------------------------- TYPES ---------------------------------- */

type StyleProps = {
  imageOnly?: boolean
}

export type BaseProps = {
  imageOnly?: boolean
  children?: React.ReactNode
  sx?: SxProps<Theme>
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    item: ProductListItemFragment,
  ) => void
  slotProps?: {
    root?: Partial<ProductListItemLinkOrDivProps>
    image?: Partial<ProductListItemImageProps>
    imageAreas?: Partial<ProductListsItemImageAreaProps>
    titleAndPrice?: Partial<ProductListItemTitleAndPriceProps>
  }
} & StyleProps &
  Omit<ProductListItemTitleAndPriceProps, 'title' | 'classes' | 'children'> &
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
    location,
    seller,
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
    onClick,
    slotProps = {},
  } = props

  // Get seller label dynamically using hook
  const sellerMap = useSellerMap()
  const sellerLabel = seller ? sellerMap[seller] || `Seller ID: ${seller}` : null

  return (
    <ProductListItemLinkOrDiv
      href={productLink(props)}
      className={classes.root}
      onClick={(e) => onClick?.(e, props)}
      {...slotProps.root}
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        {
          display: 'flex',
          gap: 3,
          padding: 1,
          background: '#fff',
          borderRadius: 2,
        },
      ]}
    >
      {/* IMAGE */}
      <div style={{ flex: '0 0 180px' }}>
        <ProductImageContainer className={classes.imageContainer}>
          <ProductListItemImage
            classes={classes}
            src={small_image?.url}
            alt={small_image?.label}
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
                  <ProductDiscountLabel
                    className={classes.discount}
                    price_range={price_range}
                  />
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
      </div>

      {/* CONTENT */}
      {!imageOnly && (
        <div style={{ flex: 1 }}>
          <ProductListItemTitleAndPrice
            classes={classes}
            titleComponent={titleComponent}
            title={name}
            subTitle={subTitle}
            {...slotProps.titleAndPrice}
          >
            <ProductListPrice {...price_range.minimum_price} />
          </ProductListItemTitleAndPrice>

          {location && (
            <Typography fontSize={14} mt={0.5} color="text.secondary">
              📍 {location}
            </Typography>
          )}

          {sellerLabel}
          {seller?.valueOf.toString.name}

          {sellerLabel && (
            <Typography fontSize={14} mt={0.5} color="text.secondary">
              🏷 {sellerLabel}
              {sellerLabel?.valueOf.name}
              {seller?.valueOf.toString.name}

            </Typography>
          )}

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              style={{
                flex: 1,
                padding: '10px 0',
                background: '#fff',
                border: '1px solid #1976d2',
                color: '#1976d2',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Number1
            </button>

            <button
              style={{
                flex: 1,
                padding: '10px 0',
                background: '#0b7d7d',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Contact Seller
            </button>
          </div>
        </div>
      )}
    </ProductListItemLinkOrDiv>
  )
}

/* ------------------------------ SKELETON ------------------------------ */

function ProductListItemSkeleton(props: BaseProps) {
  const { aspectRatio, imageOnly = false } = props

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 180 }}>
        <ProductImageContainer>
          <ProductListItemImageSkeleton aspectRatio={aspectRatio} />
        </ProductImageContainer>
      </div>

      {!imageOnly && (
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Skeleton width="80%" height={40} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------ EXPORT ------------------------------ */

function isSkeleton(props: ProductListItemProps): props is SkeletonProps {
  return props.__typename === 'Skeleton'
}

export function MyProductListItem(props: ProductListItemProps) {
  return isSkeleton(props)
    ? <ProductListItemSkeleton {...props} />
    : <ProductListItemReal {...props} />
}

MyProductListItem.selectors = { ...selectors, ...ProductListPrice.selectors }

/** @deprecated */
export type OverlayAreaKeys = ProductListItemImageAreaKeys
/** @deprecated */
export type OverlayAreas = ProductListsItemImageAreaProps
