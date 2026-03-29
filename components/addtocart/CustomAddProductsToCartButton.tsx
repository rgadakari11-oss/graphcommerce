import { useCartEnabled } from '@graphcommerce/magento-cart'
import type { ButtonProps } from '@graphcommerce/next-ui'
import { Button } from '@graphcommerce/next-ui'
import { Trans } from '@lingui/macro'
import type { UseAddProductsToCartActionProps } from '@graphcommerce/magento-product/components/AddProductsToCart/useAddProductsToCartAction'
import { useAddProductsToCartAction } from '@graphcommerce/magento-product/components/AddProductsToCart/useAddProductsToCartAction'

export type CustomAddProductsToCartButtonProps = UseAddProductsToCartActionProps &
  Pick<
    ButtonProps<'button'>,
    | 'variant'
    | 'color'
    | 'size'
    | 'fullWidth'
    | 'startIcon'
    | 'endIcon'
    | 'onClick'
    | 'sx'
    | 'children'
    | 'type'
  >

export function CustomAddProductsToCartButton(props: CustomAddProductsToCartButtonProps) {
  const { children, product, disabled, ...rest } = props
  const { showSuccess, ...action } = useAddProductsToCartAction(props)
  const cartEnabled = useCartEnabled()

  if (!cartEnabled) return null

  return (
    <Button
      type='submit'
      {...rest}
      {...action}
      disabled={disabled}
    >
      {children || <Trans>Add to Quote</Trans>}
    </Button>
  )
}
