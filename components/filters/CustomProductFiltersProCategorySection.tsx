import { useWatch } from '@graphcommerce/ecommerce-ui'
import type { CategoryTreeItem, UseCategoryTreeProps } from '@graphcommerce/magento-category'
import { useCategoryTree } from '@graphcommerce/magento-category'
import type { ActionCardAccordionProps } from '@graphcommerce/next-ui'
import {
  ActionCard,
  ActionCardAccordion,
  ActionCardList,
  Button,
  iconChevronLeft,
  IconSvg,
  responsiveVal,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react'
import type { SxProps, Theme } from '@mui/material'
import { Box } from '@mui/material'
import { useProductFiltersPro } from '@graphcommerce/magento-product/components/ProductFiltersPro/ProductFiltersPro'

export type CustomProductFiltersProCategoryAccordionProps = {
  hideTitle?: boolean
  sx?: SxProps<Theme>
  categoryTree: CategoryTreeItem[]
  onChange: (uid: CategoryTreeItem) => void | Promise<void>
} & Pick<ActionCardAccordionProps, 'defaultExpanded'>

export function CustomProductFiltersProCategoryAccordion(props: CustomProductFiltersProCategoryAccordionProps) {
  const { hideTitle, sx, categoryTree, onChange, defaultExpanded } = props
  const { form } = useProductFiltersPro()

  const name = 'filters.category_uid.in'
  const currentFilter = useWatch({ control: form.control, name })

  return (
    <ActionCardAccordion
      sx={[
        hideTitle ? { '& .MuiAccordionSummary-root': { display: 'none' } } : {},
        sx,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      defaultExpanded={defaultExpanded}
      summary={<Trans id='Categories' />}
      right={
        currentFilter && currentFilter.length > 0 ? (
          <Button
            color='primary'
            sx={{
              fontSize: '14px !important',
              fontWeight: 400,
            }}
            onClick={(e) => {
              e.stopPropagation()
              form.setValue(name, null)
            }}
          >
            <Trans id='Clear' />
          </Button>
        ) : undefined
      }
      details={
        <ActionCardList
          size='responsive'
          variant='default'
          sx={{ mb: 2 }}
          value={form.getValues('url')}
          onChange={async (e, value) => {
            const item = categoryTree.find((i) => i.value === value)
            if (!item) return
            await onChange(item)
          }}
        >
          {categoryTree.map(({ isBack, indent, ...item }) => {
            const indentVal = isBack ? 0 : indent + 1
            return (
              <ActionCard
                key={item.value}
                {...item}
                size='responsive'
                title={
                  <Box sx={{ display: 'flex', fontSize: '13px !important', fontWeight: 400, alignItems: 'center', gap: 1 }}>
                    <Box sx={{ marginRight: 1 }}>
                      {isBack ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconSvg src={iconChevronLeft} size='medium' />
                          {item.title}
                        </Box>
                      ) : (
                        item.title
                      )}
                    </Box>
                    {item.count !== null && (
                      <Box sx={{ typography: 'caption', color: 'text.disabled' }}>
                        ({item.count})
                      </Box>
                    )}
                  </Box>
                }
                sx={{
                  '&.sizeSmall': { pl: responsiveVal(8 * indentVal, 12 * indentVal) },
                  '&.sizeMedium': { pl: responsiveVal(10 * indentVal, 14 * indentVal) },
                  '&.sizeLarge': { pl: responsiveVal(12 * indentVal, 16 * indentVal) },
                  '&.sizeResponsive': { pl: responsiveVal(8 * indentVal, 16 * indentVal) },
                  '& .ActionCard-title.selected': { fontWeight: 'bold' },
                }}
              />
            )
          })}
        </ActionCardList>
      }
    />
  )
}

export type CustomProductFiltersCategorySectionProps = UseCategoryTreeProps &
  Omit<CustomProductFiltersProCategoryAccordionProps, 'categoryTree' | 'onChange'>

export function CustomProductFiltersProCategorySection(props: CustomProductFiltersCategorySectionProps) {
  const categoryTree = useCategoryTree(props)
  const { form, submit } = useProductFiltersPro()

  if (!categoryTree) return null
  return (
    <CustomProductFiltersProCategoryAccordion
      categoryTree={categoryTree}
      {...props}
      onChange={async (item) => {
        form.setValue('url', item.value)
        form.setValue('filters', { category_uid: { in: [item?.uid] } })
        await submit()
      }}
    />
  )
}
