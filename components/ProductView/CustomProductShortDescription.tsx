import { extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Typography } from '@mui/material'
import type { ProductShortDescriptionFragment } from '@graphcommerce/magento-product/components/ProductShortDescription/ProductShortDescription.gql'

export type CustomProductShortDescriptionProps = {
  product: ProductShortDescriptionFragment
  sx?: SxProps<Theme>
}

const { classes } = extendableComponent('CustomProductShortDescription', ['description'] as const)

export function CustomProductShortDescription(props: CustomProductShortDescriptionProps) {
  const { product, sx = [] } = props
  const { short_description } = product

  if (!short_description?.html) return null

  return (
    <Typography
      variant='body1'
      component='div'
      className={classes.description}
      dangerouslySetInnerHTML={{ __html: short_description?.html ?? '' }}
      sx={[
        {
          fontSize: '0.975rem !important', 
          '& > p:first-of-type': { marginTop: 0 },
          '& > p:last-of-type': { marginBottom: 0 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}
