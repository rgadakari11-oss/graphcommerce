import { useQuery } from '@apollo/client'
import { Box, Typography, Card, CardMedia, CardContent, Skeleton, Chip, IconButton } from '@mui/material'
import Link from 'next/link'
import { useRef, useState, useCallback, useEffect } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { RelatedSellerProductsDocument } from '../../graphql/seller/RelatedSellerProducts.gql'

// Fixed card width + gap — every card is the same size in the slider
const CARD_WIDTH = 200   // px
const CARD_GAP = 16      // px

type Props = {
  sellerId: number
  currentSku: string
}

function ProductCardSkeleton() {
  return (
    <Card
      sx={{
        flexShrink: 0,
        width: CARD_WIDTH,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <Skeleton variant="rectangular" height={CARD_WIDTH} sx={{ bgcolor: 'grey.100' }} />
      <CardContent sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="80%" height={14} />
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="text" width="40%" height={18} sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  )
}

export function RelatedSellerProducts({ sellerId, currentSku }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { data, loading } = useQuery(RelatedSellerProductsDocument, {
    variables: { seller_id: sellerId, current_sku: currentSku },
    skip: !sellerId,
  })

  const products = data?.relatedSellerProducts ?? []

  // Update arrow visibility on scroll
  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [products, updateArrows])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const step = (CARD_WIDTH + CARD_GAP) * 3
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) return null

  return (
    <Box sx={{ mt: 5, mb: 2 }}>

      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          pb: 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
        }}
      >

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              pl: 2,
            }}
          >
            More from this Seller
          </Typography>

        </Box>

        {/* Right side: nav arrows + view all */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            sx={{
              width: 28,
              height: 28,
              border: '1px solid',
              borderColor: canScrollLeft ? 'divider' : 'transparent',
              bgcolor: 'background.paper',
              opacity: canScrollLeft ? 1 : 0.3,
              transition: 'opacity 0.15s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            sx={{
              width: 28,
              height: 28,
              border: '1px solid',
              borderColor: canScrollRight ? 'divider' : 'transparent',
              bgcolor: 'background.paper',
              opacity: canScrollRight ? 1 : 0.3,
              transition: 'opacity 0.15s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Typography
            component={Link}
            href={`/seller/${sellerId}`}
            sx={{
              ml: 0.5,
              fontSize: '14px !important',
              fontWeight: 500,
              color: 'primary.main',
              textDecoration: 'none',
              opacity: 0.85,
              '&:hover': { opacity: 1, textDecoration: 'underline' },
            }}
          >
            View all →
          </Typography>
        </Box>
      </Box>

      {/* ── Slider track ── */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          overflowY: 'visible',
          pb: 1,           // room for box-shadow on hover
          // Hide scrollbar on all browsers
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          // Snap to each card
          scrollSnapType: 'x mandatory',
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product: any) => (
            <Link
              key={product.url_key}
              href={`/${product.url_key}`}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <Card
                sx={(theme) => ({
                  width: CARD_WIDTH,
                  height: CARD_WIDTH + 80, // fixed total height: image + content
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: `0 4px 16px 0 ${theme.palette.primary.main}22`,
                    transform: 'translateY(-2px)',
                  },
                })}
              >
                {/* Square image area — fixed height, never grows */}
                <Box
                  sx={{
                    width: CARD_WIDTH,
                    height: CARD_WIDTH,
                    flexShrink: 0,
                    bgcolor: '#f7f8fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      width: '78%',
                      height: '78%',
                      objectFit: 'contain',
                      transition: 'transform 0.22s ease',
                      '.MuiCard-root:hover &': { transform: 'scale(1.06)' },
                    }}
                  />
                </Box>

                {/* Info — fixed 80px, name always 2 lines, price pinned bottom */}
                <CardContent
                  sx={{
                    p: '10px 12px 10px',
                    height: 80,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:last-child': { pb: '10px' }, // kill MUI's extra bottom padding
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px !important',
                      fontWeight: 500,
                      color: 'text.primary',
                      lineHeight: '1.45em',
                      height: '2.9em',      // exactly 2 lines (2 × 1.45em)
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '14px !important',
                      fontWeight: 700,
                      color: 'primary.main',
                      letterSpacing: '-0.01em',
                      lineHeight: 1,
                    }}
                  >
                    ₹{product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
      </Box>
    </Box>
  )
}