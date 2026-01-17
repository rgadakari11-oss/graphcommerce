import type { SidebarGalleryProps, TypeRenderer } from '@graphcommerce/next-ui'
import { SidebarGallery, nonNullable } from '@graphcommerce/next-ui'
import type { ProductPageGalleryFragment } from '@graphcommerce/magento-product/components/ProductPageGallery/ProductPageGallery.gql'
import type { SxProps, Theme } from '@mui/material'
import { CustomSidebarGallery } from './CustomSidebarGallery'

export type ProductPageGalleryRenderers = TypeRenderer<
  NonNullable<NonNullable<ProductPageGalleryFragment['media_gallery']>[0]>
>

export type CustomProductPageGalleryProps = Omit<
  SidebarGalleryProps,
  'sidebar' | 'images'
> & {
  product: ProductPageGalleryFragment
  children?: React.ReactNode
  sx?: SxProps<Theme>
}

export function CustomProductPageGallery(props: CustomProductPageGalleryProps) {
  const {
    product,
    children,
    aspectRatio: [width, height] = [1150, 1400],
    sx,
    ...sidebarProps
  } = props

  const { media_gallery } = product

  const images =
    media_gallery
      ?.filter(nonNullable)
      .filter((p) => p.disabled !== true)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((item) =>
        item.__typename === 'ProductImage'
          ? {
              src: item.url ?? '',
              alt: item.label || undefined,
              width,
              height,
            }
          : {
              src: '',
              alt: `{${item.__typename} not yet supported}`,
            },
      ) ?? []

  return (
    <CustomSidebarGallery
      {...sidebarProps}
      sidebar={children}
      aspectRatio={[width, height]}
      images={images}
      sx={[
        // 🔥 REMOVE LEFT PADDING FROM SIDEBAR
        (theme) => ({
          '& .SidebarGallery-sidebar.variantMdDefault': {
            paddingLeft: 0,
          },

          // Optional: also control slider buttons alignment if needed
          '& .SidebarGallery-centerRight': {
            right: theme.spacings.sm,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}
