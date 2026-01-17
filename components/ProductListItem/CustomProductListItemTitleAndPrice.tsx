import type { SxProps, Theme } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { productListPrice } from '@graphcommerce/magento-product/components/ProductListPrice'

export type CustomProductListItemTitleAndPriceProps = {
  titleComponent?: React.ElementType
  title: React.ReactNode
  subTitle?: React.ReactNode
  children: React.ReactNode
  classes: { titleContainer: string; title: string; subtitle: string }
  sx?: SxProps<Theme>
}

export function CustomProductListItemTitleAndPrice(
  props: CustomProductListItemTitleAndPriceProps,
) {
  const { titleComponent = 'h2', classes, children, subTitle, title, sx } = props

  return (
    <Box
      className={classes.titleContainer}
      sx={[
        (theme) => ({
          display: 'grid',
          width: '100%',
          minWidth: 0,
          columnGap: theme.spacings.xs,
          rowGap: theme.spacings.xxs,
          alignItems: 'start',

          gridTemplateAreas: `
            "title price"
            "subtitle subtitle"
          `,
          gridTemplateColumns: '1fr auto',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* TITLE */}
      <Box
        sx={{
          gridArea: 'title',
          minWidth: 0,
          overflow: 'hidden',
        }}
        className={classes.title}
      >
        {title}
      </Box>

      {/* PRICE */}
      <Box
        sx={{
          gridArea: 'price',
          alignSelf: 'flex-start',
          whiteSpace: 'nowrap',
        }}
        className={productListPrice.classes.root}
      >
        {children}
      </Box>

      {/* SUBTITLE */}
      {subTitle && (
        <Box
          sx={{ gridArea: 'subtitle' }}
          className={classes.subtitle}
        >
          {subTitle}
        </Box>
      )}
    </Box>
  )
}

