import type { ProductListItemRenderer } from '@graphcommerce/magento-product'
import { AddProductsToCartFab } from '@graphcommerce/magento-product'
import {  MyProductListItem  } from '../ProductListItem/MyProductListItem'
import { ProductListItemBundle } from '@graphcommerce/magento-product-bundle'
import { ProductListItemConfigurable } from '@graphcommerce/magento-product-configurable'
import { ProductListItemDownloadable } from '@graphcommerce/magento-product-downloadable'
import { ProductListItemGrouped } from '@graphcommerce/magento-product-grouped'
import { ProductListItemSimple } from '@graphcommerce/magento-product-simple'
import { ProductListItemVirtual } from '@graphcommerce/magento-product-virtual'
import { ProductReviewSummary } from '@graphcommerce/magento-review'
import { ProductWishlistChip } from '@graphcommerce/magento-wishlist'

export const productListRenderer: ProductListItemRenderer = {
  Skeleton: (props) => <MyProductListItem {...props} />,
  SimpleProduct: (props) => <MyProductListItem {...props} />,
  ConfigurableProduct: (props) => <MyProductListItem {...props} />,
  BundleProduct: (props) => <MyProductListItem {...props} />,
  VirtualProduct: (props) => <MyProductListItem {...props} />,
  DownloadableProduct: (props) => <MyProductListItem {...props} />,
  GroupedProduct: (props) => <MyProductListItem {...props} />,
}

