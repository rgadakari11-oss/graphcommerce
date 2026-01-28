import { Row, SectionContainer, extendableComponent } from '@graphcommerce/next-ui'
import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'
import type { ProductSpecsFragment } from '@graphcommerce/magento-product/components/ProductSpecs/ProductSpecs.gql'
import { ProductSpecsAggregations } from '@graphcommerce/magento-product/components/ProductSpecs/ProductSpecsAggregations'
import { ProductSpecsCustomAttributes } from '@graphcommerce/magento-product/components/ProductSpecs/ProductSpecsCustomAttributes'

export type CustomProductSpecsProps = ProductSpecsFragment & {
  title?: string
  sx?: SxProps<Theme>
  children?: React.ReactNode
}

const name = 'ProductSpecs'
const parts = ['root', 'specs', 'summary'] as const
const { classes } = extendableComponent(name, parts)

export function CustomProductSpecs(props: CustomProductSpecsProps) {
  const { aggregations, items, title, children, sx = [] } = props

  const filter = ['price', 'category_id', 'size', 'new', 'sale', 'color']

  const specs =
    aggregations?.filter(
      (attr) =>
        !filter.includes(attr?.attribute_code ?? '') &&
        attr?.options?.[0]?.value !== '0',
    ) ?? []

  if (!specs.length && !items?.length) return null

  const summarySpecs = specs.slice(0, 5)

  return (
    <Row
      className={classes.root}
      sx={[
        { margin: 0, padding: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <SectionContainer
        labelLeft={title}
        sx={{
          margin: 0,
          padding: 0,
          '& .SectionHeader-root': {
            marginBottom: '4px', // ⬇ reduced top space
          },
          '& .SectionHeader-title': {
            fontSize: '0.95rem',
            fontWeight: 600,
          },
        }}
      >
        {/* 🔹 B2B SUMMARY STRIP (NO TOP LINE) */}
        <Box
          className={classes.summary}
          sx={(theme) => ({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '2px',
            marginBottom: '6px',
          })}
        >
          {summarySpecs.map((spec) => (
            <Box
              key={spec?.attribute_code}
              sx={(theme) => ({
                backgroundColor: theme.palette.grey[50],
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
              })}
            >
              <strong>{spec?.label}:</strong> {spec?.options?.[0]?.label ?? '-'}
            </Box>
          ))}
        </Box>


        {/* 🔹 FULL TECHNICAL TABLE */}
        <Box
          component='ul'
          className={classes.specs}
          sx={(theme) => ({
            listStyle: 'none',
            margin: 0,
            padding: 0,
            paddingBottom: '10px',

            '& > li': {
              display: 'grid',
              gridTemplateColumns: '45% 55%',
              alignItems: 'center',

              padding: '4px 0',
              fontSize: '0.9rem',
              lineHeight: 1.4,

              borderBottom: `1px dashed ${theme.palette.divider}`,

              '& > *:first-of-type': {
                fontWeight: 600,
              },
            },

            '& > li:last-of-type': {
              borderBottom: 'none',
            },

            [theme.breakpoints.down('sm')]: {
              '& > li': {
                gridTemplateColumns: '1fr',
              },
            },
          })}
        >
          {aggregations && (
            <ProductSpecsAggregations aggregations={aggregations} />
          )}
          {items && <ProductSpecsCustomAttributes items={items} />}
        </Box>

        {children}
      </SectionContainer>
    </Row>
  )
}
