import {
  CategoryBreadcrumbs,
  CategoryChildren,
  CategoryDescription,
} from '@graphcommerce/magento-category'
import {
  ProductFiltersPro,
  ProductFiltersProAggregations,
  ProductFiltersProAllFiltersChip,
  productFiltersProChipRenderer,
  ProductFiltersProClearAll,
  ProductFiltersProLimitChip,
  ProductFiltersProLimitSection,
  ProductFiltersProNoResults,
  productFiltersProSectionRenderer,
  ProductFiltersProSortChip,
  ProductFiltersProSortSection,
  ProductListCount,
  ProductListFiltersContainer,
  ProductListPagination,
  ProductListSuggestions,
} from '@graphcommerce/magento-product'
import {
  ProductFiltersProCategorySectionSearch,
  ProductFiltersProSearchTerm,
} from '@graphcommerce/magento-search'
import {
  Container,
  MediaQuery,
  memoDeep,
  StickyBelowHeader,
} from '@graphcommerce/next-ui'
import { Trans } from '@lingui/macro'
import { Box, Typography, Divider } from '@mui/material'
import { ProductListItems } from '../ProductListItems'
import type { ProductListLayoutProps } from './types'
import { useLayoutConfiguration } from './types'
import dynamic from 'next/dynamic'
import { CustomProductFiltersProCategorySection } from '../filters/CustomProductFiltersProCategorySection'



/* -------------------------------------------------------------------------- */
/* NEAR ME (CLIENT ONLY)                                                       */
/* -------------------------------------------------------------------------- */

const Nearme = dynamic(
  () => import('../seller/Nearme').then(m => m.Nearme),
  { ssr: false }
)

const AppliedFilterChips = dynamic(
  () => import('../seller/AppliedFilterChips').then(m => m.AppliedFilterChips),
  { ssr: false }
)

/* -------------------------------------------------------------------------- */
/* LAYOUT                                                                     */
/* -------------------------------------------------------------------------- */

export const ProductListLayoutSidebar = memoDeep((props: ProductListLayoutProps) => {
  const { filters, filterTypes, params, products, handleSubmit, category, title, menu } = props

  if (!params || !products?.items || !filterTypes) return null
  const { total_count, sort_fields, page_info } = products

  const configuration = useLayoutConfiguration(true)
  const totalCount = products?.total_count ?? 0

  return (
    <ProductFiltersPro
      params={params}
      aggregations={filters?.aggregations}
      appliedAggregations={products?.aggregations}
      filterTypes={filterTypes}
      autoSubmitMd
      handleSubmit={handleSubmit}
    >
      {/* ------------------------------------------------------------------ */}
      {/* BREADCRUMBS - Enhanced Design                                      */}
      {/* ------------------------------------------------------------------ */}
      {import.meta.graphCommerce.breadcrumbs && category && (
        <Container maxWidth={false}>
          <CategoryBreadcrumbs
            category={category}
            sx={(theme) => ({
              mb: "5px",
              mt: "5px",
              '& .MuiBreadcrumbs-ol': {
                fontSize: '13px',
                color: theme.palette.text.secondary,
                justifyContent: 'flex-start',
              },
              '& .MuiBreadcrumbs-separator': {
                mx: 0.5,
                color: theme.palette.divider,
              },
              '& a': {
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              },
              [theme.breakpoints.down('md')]: {
                pt: 1.5,
                '& .MuiBreadcrumbs-ol': { justifyContent: 'flex-start' },
              },
            })}
          />
        </Container>
      )}

      {/* BREADCRUMBS FOR SEARCH RESULTS */}
      {!category && params.search && (
        <Container maxWidth={false}>
          <Box
            sx={(theme) => ({
              mb: "5px",
              mt: "5px",
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: theme.palette.text.secondary,
              gap: 0.5,

              [theme.breakpoints.down('md')]: {
                pt: 1.5,
                justifyContent: 'flex-start',
              },
            })}
          >
            <Box
              component="a"
              href="/"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              })}
            >
              Home
            </Box>
            <Box sx={{ color: 'divider' }}>/</Box>
            <Box sx={{ color: 'text.primary', fontWeight: 500 }}>
              Search Results
            </Box>
            {params.search && (
              <>
                <Box sx={{ color: 'divider' }}>/</Box>
                <Box sx={{ color: 'text.primary', fontWeight: 500 }}>
                  "{params.search}"
                </Box>
              </>
            )}
          </Box>
        </Container>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MAIN GRID - Enhanced Layout                                        */}
      {/* ------------------------------------------------------------------ */}
      <Container
        maxWidth={false}
        sx={(theme) => ({
          display: 'grid',
          alignItems: 'start',
          rowGap: theme.spacings.md,
          columnGap: configuration.columnGap,
          mb: theme.spacings.xl,
          gridTemplate: {
            xs: '"title" "horizontalFilters" "count" "items" "pagination"',
            md: `
              "sidebar title"      auto
              "sidebar items"      auto
              "sidebar pagination" 1fr
              /${configuration.sidebarWidth}   auto
            `,
          },
        })}
      >
        {/* ---------------------------------------------------------------- */}
        {/* TITLE SECTION - Premium Design                                   */}
        {/* ---------------------------------------------------------------- */}
        <Box
          className='title'
          sx={(theme) => ({
            gridArea: 'title',
            display: 'grid',
            gridAutoFlow: 'row',
            rowGap: theme.spacings.sm,
          })}
        >
          {category ? (
            <>
              {/* Category Header - Professional Design */}
              <Box
                sx={(theme) => ({
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                })}
              >
                {/* Title + Badge Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Title */}
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: 15, sm: 20, md: 25 },
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: 'text.primary',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {title}
                  </Typography>

                  {/* Product Count Badge - Next to Title */}
                  {/* {totalCount > 0 && (
                    <Box
                      sx={(theme) => ({
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: { xs: 2, md: 2.5 },
                        py: { xs: 1, md: 1.25 },
                        borderRadius: '12px',
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${theme.palette.divider}`,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.05)',
                          borderColor: theme.palette.primary.main + '40',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                      })}
                    >
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 20, md: 22 },
                      height: { xs: 20, md: 22 },
                      borderRadius: '6px',
                      bgcolor: theme.palette.primary.main + '15',
                      color: theme.palette.primary.main,
                    })}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 7h-9M14 17H5M14 17l3-3m-3 3l3 3m3-13l-3-3m3 3l-3 3" />
                    </svg>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: 18, md: 20 },
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1,
                      }}
                    >
                      {totalCount.toLocaleString()}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: 13, md: 14 },
                        fontWeight: 500,
                        color: 'text.secondary',
                        lineHeight: 1,
                      }}
                    >
                      {totalCount === 1 ? 'Product' : 'Products'}
                    </Typography>
                  </Box>
                </Box>
                  )} */}


                </Box>
              </Box>

              {/* Near Me & Applied Filters */}
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  minWidth: 0,
                  width: '100%',
                }}
              >
                <Nearme />
                <AppliedFilterChips />
              </Box>

              {/* Category Description */}
              <CategoryDescription
                textAlignMd='start'
                textAlignSm='start'
                description={category?.description}
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  mt: 1,
                })}
              />

              {/* Mobile Category Children */}
              <MediaQuery query={(theme) => theme.breakpoints.down('md')}>
                <CategoryChildren params={params}>
                  {category?.children}
                </CategoryChildren>
              </MediaQuery>
            </>
          ) : (
            <>
              {/* Search Results Header - Professional Design */}
              <Box
                sx={(theme) => ({
                  pb: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  [theme.breakpoints.down('md')]: {
                    pt: 1,
                  },
                })}
              >
                {/* Title + Badge Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Title */}
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: 15, sm: 20, md: 25 },
                      fontWeight: 500,
                      lineHeight: 1.3,
                      color: 'text.primary',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    <ProductFiltersProSearchTerm params={params}>
                      <Trans>All Products</Trans>
                    </ProductFiltersProSearchTerm>
                  </Typography>

                  {/* Product Count Badge - Next to Title */}
                  {/* {totalCount > 0 && (
                    <Box
                      sx={(theme) => ({
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: { xs: 2, md: 2.5 },
                        py: { xs: 1, md: 1.25 },
                        borderRadius: '12px',
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${theme.palette.divider}`,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.05)',
                          borderColor: theme.palette.primary.main + '40',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: { xs: 20, md: 22 },
                          height: { xs: 20, md: 22 },
                          borderRadius: '6px',
                          bgcolor: theme.palette.primary.main + '15',
                          color: theme.palette.primary.main,
                        })}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 7h-9M14 17H5M14 17l3-3m-3 3l3 3m3-13l-3-3m3 3l-3 3" />
                        </svg>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: { xs: 18, md: 20 },
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1,
                          }}
                        >
                          {totalCount.toLocaleString()}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: { xs: 13, md: 14 },
                            fontWeight: 500,
                            color: 'text.secondary',
                            lineHeight: 1,
                          }}
                        >
                          {totalCount === 1 ? 'Product' : 'Products'}
                        </Typography>
                      </Box>
                    </Box>
                  )} */}


                </Box>
              </Box>

              {/* Near Me & Applied Filters */}
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  minWidth: 0,
                  width: '100%',
                }}
              >
                <Nearme />
                <AppliedFilterChips />
              </Box>

              {/* Search Suggestions */}
              <Box
                sx={(theme) => ({
                  mt: 1,
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                })}
              >
                <ProductListSuggestions products={products} />
              </Box>


            </>
          )}
        </Box>

        {/* ---------------------------------------------------------------- */}
        {/* PRODUCTS GRID - Enhanced Cards                                   */}
        {/* ---------------------------------------------------------------- */}
        <Box
          sx={(theme) => ({
            gridArea: 'items',
            '& .ProductListItems-root': {
              gap: { xs: 2, md: 3 },
            },
          })}
        >
          {products.items.length <= 0 ? (
            <Box
              sx={(theme) => ({
                textAlign: 'center',
                py: 8,
                px: 3,
              })}
            >
              <ProductFiltersProNoResults search={params.search} />
            </Box>
          ) : (
            <ProductListItems
              {...products}
              loadingEager={6}
              title={(params.search ? `Search ${params.search}` : title) ?? ''}
              columns={configuration.columns}
            />
          )}
        </Box>

        {/* ---------------------------------------------------------------- */}
        {/* PAGINATION - Enhanced Style                                      */}
        {/* ---------------------------------------------------------------- */}
        <ProductListPagination
          page_info={page_info}
          params={params}
          sx={(theme) => ({
            gridArea: 'pagination',
            my: 3,
            '& .MuiPagination-ul': {
              justifyContent: 'center',
              gap: 1,
            },
            '& .MuiPaginationItem-root': {
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              minWidth: '40px',
              height: '40px',
              border: `1.5px solid ${theme.palette.divider}`,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.primary.main + '10',
                transform: 'translateY(-2px)',
              },
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              },
            },
          })}
        />

        {/* ---------------------------------------------------------------- */}
        {/* MOBILE FILTER BAR - Enhanced Chips                               */}
        {/* ---------------------------------------------------------------- */}
        <MediaQuery query={(theme) => theme.breakpoints.down('md')}>
          <StickyBelowHeader
            sx={(theme) => ({
              gridArea: 'horizontalFilters',
              bgcolor: 'background.paper',
              borderBottom: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            })}
          >
            <ProductListFiltersContainer
              sx={(theme) => ({
                '& .ProductListFiltersContainer-scroller': {
                  px: theme.page.horizontal,
                  mx: `calc(${theme.page.horizontal} * -1)`,
                  py: 1.5,
                  gap: 1,
                },
                '& .MuiChip-root': {
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  height: '36px',
                  border: `1.5px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.primary.main + '10',
                    transform: 'translateY(-1px)',
                  },
                },
              })}
            >
              <ProductFiltersProAggregations renderer={productFiltersProChipRenderer} />

              {products.items.length > 0 && (
                <>
                  <ProductFiltersProSortChip
                    total_count={total_count}
                    sort_fields={sort_fields}
                    category={category}
                  />
                  <ProductFiltersProLimitChip />
                </>
              )}

              <ProductFiltersProAllFiltersChip
                total_count={total_count}
                sort_fields={sort_fields}
                category={category}
              />
            </ProductListFiltersContainer>
          </StickyBelowHeader>
        </MediaQuery>

        {/* ---------------------------------------------------------------- */}
        {/* SIDEBAR - Premium Filter Design with Solid Background            */}
        {/* ---------------------------------------------------------------- */}
        <MediaQuery
          query={(theme) => theme.breakpoints.up('md')}
          display='block'
          sx={(theme) => ({
            gridArea: 'sidebar',
            mt: import.meta.graphCommerce.breadcrumbs === true ? 0 : theme.spacings.lg,
            bgcolor: theme.palette.background.paper,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            p: 2.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: 80,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.divider,
              borderRadius: '3px',
              '&:hover': {
                background: theme.palette.text.disabled,
              },
            },
          })}
        >
          {/* Clear All Button - Enhanced Header */}
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 1.5,
              mb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              Filters
            </Typography>
            <ProductFiltersProClearAll
              sx={(theme) => ({
                fontSize: '14px',
                fontWeight: 400,
                color: theme.palette.primary.main,
                textDecoration: 'none',
                padding: '6px 6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '8',
                },
              })}
            />
          </Box>

          {/* Category/Search Section */}
          <Box>
            {category ? (
              <CustomProductFiltersProCategorySection
                category={category}
                params={params}
                hideBreadcrumbs
                sx={{
                  '& .MuiAccordion-root': {
                    boxShadow: 'none',
                    bgcolor: 'transparent',
                    '&:before': { display: 'none' },
                  },
                  '& .MuiAccordionSummary-root': {
                    px: 0,
                    minHeight: 'auto',
                    fontWeight: 400,
                    fontSize: '14px',
                    '&.Mui-expanded': {
                      minHeight: 'auto',
                    },
                  },
                }}
              />
            ) : (
              <ProductFiltersProCategorySectionSearch
                menu={menu}
                defaultExpanded
                sx={{
                  '& .MuiAccordion-root': {
                    boxShadow: 'none',
                    bgcolor: 'transparent',
                    '&:before': { display: 'none' },
                  },
                  '& .MuiAccordionSummary-root': {
                    px: 0,
                    fontWeight: 400,
                    fontSize: '14px',
                    minHeight: 'auto',
                    '&.Mui-expanded': {
                      minHeight: 'auto',
                    },
                  },
                }}
              />
            )}
          </Box>

          {/* Sort Section */}
          {/* <Box>
            <ProductFiltersProSortSection
              sort_fields={sort_fields}
              total_count={total_count}
              category={category}
              sx={(theme) => ({
                '& .MuiAccordion-root': {
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                  '&:before': { display: 'none' },
                },
                '& .MuiAccordionSummary-root': {
                  px: 0,
                  py: 1,
                  minHeight: 'auto',
                  fontWeight: 400,
                  fontSize: '14px',
                  '&.Mui-expanded': {
                    minHeight: 'auto',
                  },
                },
                '& .MuiAccordionDetails-root': {
                  px: 0,
                },
                '& .MuiFormControlLabel-root': {
                  mx: 0,
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                },
              })}
            />
          </Box> */}

          {/* Limit Section */}
          {/* <Box
            sx={(theme) => ({

            })}
          >
            <ProductFiltersProLimitSection
              sx={(theme) => ({
                '& .MuiAccordion-root': {
                  boxShadow: 'none',
                  bgcolor: 'transparent',
                  '&:before': { display: 'none' },
                },
                '& .MuiAccordionSummary-root': {
                  px: 0,
                  py: 1,
                  minHeight: 'auto',
                  fontWeight: 400,
                  fontSize: '14px',
                  '&.Mui-expanded': {
                    minHeight: 'auto',
                  },
                },
                '& .MuiAccordionDetails-root': {
                  px: 0,
                },
              })}
            />
          </Box> */}

          {/* Aggregations - All Filters */}
          <Box
            sx={(theme) => ({
              '& > *:not(:last-child)': {
              },
              '& .MuiAccordion-root': {
                boxShadow: 'none !important',
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
              },
              '& .MuiAccordionSummary-root': {
                px: 0,
                py: 1,
                fontWeight: 400,
                fontSize: '14px',
                minHeight: 'auto',
                '&.Mui-expanded': {
                  minHeight: 'auto',
                },
              },
              '& .MuiAccordionDetails-root': {
                px: 0,
                pb: 0,
              },
              '& .MuiCheckbox-root': {
                padding: '2px',
              },
              '& .MuiFormControlLabel-root': {
                mx: 0,
                py: 0.75,
                px: 1.5,
                borderRadius: '6px',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              },
            })}
          >
            <ProductFiltersProAggregations renderer={productFiltersProSectionRenderer} />
          </Box>
        </MediaQuery>
      </Container>
    </ProductFiltersPro >
  )
})