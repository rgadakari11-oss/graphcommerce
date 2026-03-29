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
            marginBottom: '4px',
          },
          '& .SectionHeader-title': {
            fontSize: { xs: '0.9rem', sm: '0.95rem' },
            fontWeight: 600,
          },
        }}
      >
        {/* 🔹 B2B SUMMARY STRIP */}
        <Box
          className={classes.summary}
          sx={(theme) => ({
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: '5px', sm: '6px' },
            marginTop: '2px',
            marginBottom: '6px',
          })}
        >
          {summarySpecs.map((spec) => (
            <Box
              key={spec?.attribute_code}
              sx={(theme) => ({
                backgroundColor: theme.palette.grey[50],
                padding: { xs: '4px 7px', sm: '4px 8px' },
                borderRadius: { xs: '6px', sm: '4px' },
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                lineHeight: 1.3,
                border: { xs: `1px solid ${theme.palette.grey[200]}`, sm: 'none' },
                boxShadow: {
                  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  sm: 'none'
                },
                transition: 'transform 0.2s ease',
                '&:active': {
                  transform: { xs: 'scale(0.98)', sm: 'none' },
                },
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
            paddingLeft: '10px',
            paddingBottom: { xs: '6px', sm: '10px' },

            '& > li': {
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '45% 55%' },
              alignItems: { xs: 'start', sm: 'center' },
              gap: { xs: '1px', sm: 0 },
              padding: { xs: '7px 4px', sm: '4px 0' },
              fontSize: { xs: '0.82rem', sm: '0.9rem' },
              lineHeight: 1.4,
              borderBottom: `1px dashed ${theme.palette.divider}`,

              // Mobile enhancement
              [theme.breakpoints.down('sm')]: {
                backgroundColor: 'transparent',
                borderRadius: '4px',
                transition: 'background-color 0.15s ease',

                '&:active': {
                  backgroundColor: theme.palette.grey[50],
                },
              },

              '& > *:first-of-type': {
                fontWeight: 500,
                color: '#000',

                // Mobile: smaller, uppercase label
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '2px',
                },
              },

              '& > *:last-of-type': {
                fontWeight: 400,
                color: '#000',

                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.82rem',
                },
              },
            },

            '& > li:last-of-type': {
              borderBottom: 'none',
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