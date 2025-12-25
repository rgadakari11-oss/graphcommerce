import type { ImageProps } from '@graphcommerce/image'
import { extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Skeleton } from '@mui/material'
import React from 'react'
import type { ProductListItemFragment } from '@graphcommerce/magento-product/Api/ProductListItem.gql'
import { productLink } from '@graphcommerce/magento-product/hooks/useProductLink'//import { ProductListPrice } from '../ProductListPrice/ProductListPrice'
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
import { Location } from 'graphql'

const { classes, selectors } = extendableComponent('ProductListItem', [
  'root',
  'item',
  'title',
  'titleContainer',
  'subtitle',
  'price',
  'overlayItems',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'imageContainer',
  'placeholder',
  'image',
  'discount',
] as const)

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

/** ---------------- PRODUCT LIST ITEM WITH IMAGE LEFT ---------------- */
export function ProductListItemReal(props: ProductProps) {
  const {
    subTitle,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    small_image,
    name,
    price_range,
    children,
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

  return (
    <ProductListItemLinkOrDiv
      href={productLink(props)}
      className={classes.root}
      onClick={(e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) =>
        onClick?.(e, props)
      }
      {...slotProps.root}
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        ...(Array.isArray(slotProps.root?.sx)
          ? slotProps.root.sx
          : [slotProps.root?.sx]),
        {
          display: 'flex !important', 
          flexDirection: 'row !important',
          alignItems: 'flex-start',
          gap: 3,
          width: '100%',
          background: 'white !important',         // GREY OUTSIDE
          padding: '8px !important',                // spacing around the white card
          borderRadius: '8px !important',             // rounded corners

    },
      ]}
      ref={slotProps.root?.ref as React.Ref<HTMLAnchorElement | HTMLDivElement>}
    >
      {/* LEFT SIDE — IMAGE BLOCK */}
      <div style={{ flex: '0 0 180px' ,height: '100%'}}>
        <ProductImageContainer className={classes.imageContainer} style={{ height: '100%' }}   >
          <ProductListItemImage
            classes={classes}
            src={small_image?.url}
            alt={small_image?.label}
            aspectRatio={aspectRatio}
            loading={loading}
            sizes={sizes}
            dontReportWronglySizedImages={dontReportWronglySizedImages}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',      // MAKE IMAGE COVER ENTIRE COLUMN
              objectPosition: 'center',
              borderRadius: 8,
            }}
            {...slotProps.image}
          />

          {!imageOnly && (
            <ProductListItemImageAreas
              topRight={topRight}
              bottomLeft={bottomLeft}
              bottomRight={bottomRight}
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
              {...slotProps.imageAreas}
            />
          )}
        </ProductImageContainer>
      </div>

      {/* RIGHT SIDE — TEXT + PRICE + CTA */}
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
        <div style={{ fontSize: 14, marginTop: 5, fontWeight: 500, color: '#222' }}>
            Prabhat Paint222 Industries
          </div>
          <div
            style={{
              fontSize: 14,
              marginTop: 5,
              fontWeight: 500,
              color: '#222',
              display: 'flex',
              alignItems: 'center',
            }}
            >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              style={{ marginRight: 6 }}
              >
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle 
                cx="12" 
                cy="9" 
                r="2.5" 
                stroke="#1976d2" 
                strokeWidth="2" 
              />
            </svg>
            0i - Goregaon East
          </div>

          {/* TWO BUTTONS AT BOTTOM */}
    <div
      style={{
        display: 'flex',
        gap: '10px',
        marginTop: 16,
      }}
    >
      {/* Button 1 - Contact Seller */}
      <button
        style={{
          flex: 1,
            padding: '10px 0',
          background: 'white ',
          color: '#1976d2',
          border: '1px solid #1976d2',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          transition: '0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = 'white')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
      >
        View Numberddd
      </button>
      console.log('CUSTOM productListRenderer loaded')


      {/* Button 2 - View Number */}
      <button
        style={{
          flex: 1,
          padding: '10px 0',
          background: '#0b7d7d',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          transition: '0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#0a6c6c')}
        onMouseOut={(e) => (e.currentTarget.style.background = '#0b7d7d')}
      >
        Contact Seller11111
      </button>
    </div>

          

          {children}
        </div>
      )}
    </ProductListItemLinkOrDiv>
  )
}

/** ---------------------- SKELETON VERSION ------------------------- */
export function ProductListItemSkeleton(props: BaseProps) {
  const {
    children,
    imageOnly = false,
    aspectRatio,
    titleComponent = 'h2',
    sx = [],
    slotProps = {},
  } = props

  return (
    <ProductListItemLinkOrDiv
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
      className={classes.root}
      {...slotProps.root}
      ref={slotProps.root?.ref as React.Ref<HTMLAnchorElement | HTMLDivElement>}
      style={{ display: 'flex', gap: 16 }}
    >
      <div style={{ flex: '0 0 150px' }}>
        <ProductImageContainer className={classes.imageContainer}>
          <ProductListItemImageSkeleton
            classes={classes}
            aspectRatio={aspectRatio}
            {...slotProps.image}
          />
        </ProductImageContainer>
      </div>

      {!imageOnly && (
        <div style={{ flex: 1 }}>
          <ProductListItemTitleAndPrice
            classes={classes}
            titleComponent={titleComponent}
            title={<Skeleton variant='text' sx={{ width: '100px' }} />}
            subTitle={<Skeleton variant='text' sx={{ width: '20px' }} />}
            {...slotProps.titleAndPrice}
          >
            <Skeleton variant='text' sx={{ width: '20px' }} />
          </ProductListItemTitleAndPrice>

          {children}
        </div>
      )}
    </ProductListItemLinkOrDiv>
  )
}

function isSkeleton(props: ProductListItemProps): props is SkeletonProps {
  return props.__typename === 'Skeleton'
}

export function ProductListItem(props: ProductListItemProps) {
  return isSkeleton(props) ? (
    <ProductListItemSkeleton {...props} />
  ) : (
    <ProductListItemReal {...props} />
  )
}

ProductListItem.selectors = { ...selectors, ...ProductListPrice.selectors }

/** @deprecated */
export type OverlayAreaKeys = ProductListItemImageAreaKeys
/** @deprecated */
export type OverlayAreas = ProductListsItemImageAreaProps

