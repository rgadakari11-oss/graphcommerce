import { CartFab, useCartEnabled } from '@graphcommerce/magento-cart'
import { CustomerFab } from '@graphcommerce/magento-customer'
import { WishlistFab } from '@graphcommerce/magento-wishlist'
import type { LayoutDefaultProps } from '@graphcommerce/next-ui'
import {
  DesktopNavActions,
  DesktopNavBar,
  DesktopNavItem,
  iconChevronDown,
  iconCustomerService,
  iconHeart,
  iconPerson,
  IconSvg,
  LayoutDefault,
  MobileTopRight,
  NavigationFab,
  NavigationProvider,
  PlaceholderFab,
  useNavigationSelection,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import {
  Box,
  Fab,
  GlobalStyles,
  InputBase,
  Button,
  Paper,
  ClickAwayListener,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { Footer } from './Footer'
import type { LayoutQuery } from './Layout.gql'
import { Logo } from './Logo'
import HeaderAccountAction from '../header/HeaderAccountAction'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'

// Location storage utilities
interface LocationData {
  lat: number
  lon: number
  name: string
  distance: string
}

const STORAGE_KEY = 'nearby_location'

function saveLocationToSession(data: LocationData): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('Location saved to sessionStorage:', data)
  } catch (error) {
    console.warn('Failed to save location to sessionStorage:', error)
  }
}

function getLocationFromSession(): LocationData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    if (parsed?.lat && parsed?.lon && parsed?.name) {
      return {
        lat: Number(parsed.lat),
        lon: Number(parsed.lon),
        name: parsed.name,
        distance: parsed.distance || '50',
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to load location from sessionStorage:', error)
    return null
  }
}

export type LayoutNavigationProps = LayoutQuery &
  Omit<LayoutDefaultProps, 'footer' | 'header' | 'cartFab' | 'menuFab'>

export function LayoutNavigation(props: LayoutNavigationProps) {
  const { menu, children, ...uiProps } = props
  const router = useRouter()
  const cartEnabled = useCartEnabled()
  const selection = useNavigationSelection()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  const [activeUid, setActiveUid] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [activeMicroUid, setActiveMicroUid] = useState<string | null>(null)
  const [expandedMicroUid, setExpandedMicroUid] = useState<string | null>(null)

  /* ================= STICKY HEADER ================= */
  const headerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuOffsetTop = useRef(0)
  const [isMenuSticky, setIsMenuSticky] = useState(false)

  useEffect(() => {
    if (menuRef.current && !isMobile) {
      menuOffsetTop.current =
        menuRef.current.getBoundingClientRect().top + window.scrollY
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) return

    const onScroll = () => {
      setIsMenuSticky(window.scrollY > menuOffsetTop.current)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  // Location autocomplete states
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null
    lon: number | null
    address: string
    distance?: string
  }>({ lat: null, lon: null, address: '', distance: '50' })
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Replace with your actual TomTom API key
  const TOMTOM_KEY = 'tPk49oNL3jq0P29C21Ix12Hxg8DmTrQm'

  useEffect(() => {
    setActiveUid(null)
    selection.set([])
    setDrawerOpen(false)
    setSearchExpanded(false)
  }, [router.asPath, selection])

  // Load location from sessionStorage on mount
  useEffect(() => {
    const savedLocation = getLocationFromSession()
    if (savedLocation) {
      setSelectedLocation({
        lat: savedLocation.lat,
        lon: savedLocation.lon,
        address: savedLocation.name,
        distance: savedLocation.distance,
      })
      setLocationQuery(savedLocation.name)
    }
  }, [])

  // Fetch TomTom autocomplete suggestions
  useEffect(() => {
    if (locationQuery.length < 3) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.tomtom.com/search/2/search/${encodeURIComponent(
            locationQuery
          )}.json?typeahead=true&countrySet=IN&limit=5&key=${TOMTOM_KEY}`
        )
        const data = await res.json()
        setLocationSuggestions(data.results || [])
      } catch (err) {
        console.error('TomTom API error:', err)
        setLocationSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [locationQuery])

  const handleMouseEnter = (uid: string | undefined) => {
    if (isMobile) return
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setActiveUid(uid || null)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    closeTimeoutRef.current = setTimeout(() => {
      setActiveUid(null)
    }, 150)
  }

  const handleSearch = (value?: string) => {
    if (!value || !value.trim()) return

    const shortAddress = selectedLocation.address?.slice(0, 5)
    router.push(
      `/search/${encodeURIComponent(value)}/l/${encodeURIComponent(shortAddress)}`
    )
    setSearchExpanded(false)
  }

  const handleLocationSelect = (place: any) => {
    const lat = place.position?.lat || null
    const lon = place.position?.lon || null
    const address =
      place.address?.freeformAddress || place.address?.streetName || ''

    const locationData = {
      lat,
      lon,
      address,
      distance: '50',
    }

    setSelectedLocation(locationData)
    setLocationQuery(address)
    setLocationSuggestions([])
    setShowLocationSuggestions(false)

    if (lat && lon && address) {
      saveLocationToSession({
        lat: lat,
        lon: lon,
        name: address,
        distance: '50',
      })
    }
  }

  const handleCategoryClick = (uid: string) => {
    setExpandedCategory(expandedCategory === uid ? null : uid)
  }

  const activeCategory = menu?.items?.[0]?.children?.find(
    (item) => item?.uid === activeUid
  )

  const subCategories = activeCategory?.children ?? []

  // Search Bar Component (reusable for desktop and mobile)
  const SearchBar = ({ mobile = false, onExpand }: { mobile?: boolean; onExpand?: () => void }) => (
    <Paper
      elevation={mobile ? 0 : 2}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: mobile ? '100%' : 600,
        borderRadius: mobile ? '8px' : '50px',
        overflow: 'visible',
        border: mobile ? '1px solid #ddd' : '1px solid #e0e0e0',
        position: 'relative',
        backgroundColor: '#fff',
        height: mobile ? 'auto' : '39px',
      }}
    >
      {/* LOCATION INPUT */}
      <ClickAwayListener onClickAway={() => setShowLocationSuggestions(false)}>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            borderRight: '1px solid #e0e0e0',
            pl: mobile ? 1.5 : 2,
            pr: mobile ? 1 : 1.5,
            minWidth: mobile ? 50 : 50,
            position: 'relative',
          }}
        >
          <LocationOnIcon sx={{ color: '#5f6368', mr: 0.5, fontSize: 18 }} />
          <InputBase
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value)
              setShowLocationSuggestions(true)
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            placeholder={selectedLocation.address || 'Enter Location'}
            sx={{
              fontSize: mobile ? '12px !important' : '14px !important',
              fontWeight: 500,
              flex: 1,
              '& input': {
                padding: 0,
              },
            }}
          />

          {/* LOCATION SUGGESTIONS DROPDOWN */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '100%',
                minWidth: 280,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                zIndex: 2000,
                maxHeight: '250px',
                overflowY: 'auto',
              }}
            >
              {locationSuggestions.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => handleLocationSelect(item)}
                  sx={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
                    {item.address?.freeformAddress ||
                      item.address?.streetName}
                  </Box>
                  {item.address?.country && (
                    <Box sx={{ fontSize: '12px', color: '#6b7280', mt: 0.5 }}>
                      {item.address.country}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </ClickAwayListener>

      {/* SEARCH INPUT */}
      <InputBase
        inputRef={mobile ? mobileSearchInputRef : searchInputRef}
        placeholder="Search for Products / Services"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch((e.target as HTMLInputElement).value)
          }
        }}
        sx={{
          flex: 1,
          px: mobile ? 1.5 : 2,

          fontSize: mobile ? '12px !important' : '14px !important',
          '& input': {
            padding: 0,
          },
        }}
      />

      {/* SEARCH BUTTON */}
      <Button
        variant="contained"
        onClick={() => {
          handleSearch(
            mobile
              ? mobileSearchInputRef.current?.value
              : searchInputRef.current?.value
          )
        }}
        sx={{
          minWidth: mobile ? 70 : 101,
          bgcolor: '#eff6ff',
          fontSize: mobile ? '12px !important' : '14px !important',
          fontWeight: 600,
          textTransform: 'none',
          px: mobile ? 1.2 : 2,
          borderRadius: '0 15px 15px 0',
          minHeight: mobile ? 'auto' : '39px',
          height: mobile ? 'auto' : '39px',
          '&:hover': {
            bgcolor: '#eff6ff',
          },
        }}
      >
        <SearchIcon sx={{ fontSize: mobile ? 16 : 18 }} />
        {!mobile && <span style={{ marginLeft: 4 }}>Search</span>}
      </Button>
    </Paper>
  )

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            overflowX: 'hidden',

          },
          '.LayoutDefault-main': {
            paddingTop: isMobile ? '56px' : '0px',
          },
        }}
      />

      <NavigationProvider selection={selection} items={[]}>
        <LayoutDefault
          {...uiProps}
          header={
            <>
              {/* MOBILE HEADER */}
              {isMobile && (
                <AppBar
                  position="fixed"
                  elevation={1}
                  sx={{
                    bgcolor: '#fff',
                    color: '#1f2937',
                    zIndex: 1300,
                  }}
                >
                  <Toolbar sx={{ px: 1.5, minHeight: '56px !important' }}>
                    {/* Mobile Menu Icon */}
                    {!searchExpanded && (
                      <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 1 }}
                      >
                        <MenuIcon />
                      </IconButton>
                    )}

                    {/* Mobile Logo */}
                    {!searchExpanded && (
                      <Box sx={{ flexGrow: 0, mr: 1 }}>
                        <Logo />
                      </Box>
                    )}

                    {/* Mobile Search */}
                    {searchExpanded ? (
                      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SearchBar mobile />
                        <IconButton onClick={() => setSearchExpanded(false)} size="small">
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton
                          color="inherit"
                          onClick={() => setSearchExpanded(true)}
                        >
                          <SearchIcon />
                        </IconButton>
                        <HeaderAccountAction />
                      </>
                    )}
                  </Toolbar>
                </AppBar>
              )}

              {/* DESKTOP HEADER */}
              {!isMobile && (
                <Box
                  ref={headerRef}
                  sx={{
                    borderBottom: '1px solid #e5e7eb',
                    bgcolor: '#fff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    width: '100vw',
                    left: 0,
                  }}
                >
                  {/* Top Bar - Full Width - COMPACT */}
                  <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <Container maxWidth="xl">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          px: { md: 2, lg: 3 },
                        }}
                      >
                        {/* LOGO - Left - Compact */}
                        <Box sx={{ minWidth: 140, transform: 'scale(0.9)' }}>
                          <Logo />
                        </Box>

                        {/* SEARCH BAR - Center (Expanded) - COMPACT */}
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            px: 2,
                            maxWidth: 900,
                          }}
                        >
                          <SearchBar />
                        </Box>

                        {/* RIGHT ACTIONS - Professional Cards - COMPACT */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                            minWidth: 'fit-content',
                          }}
                        >
                          {/* Seller Registration Card - COMPACT */}
                          <Box
                            component="a"
                            href="/account/sellersignup"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                              px: 1.3,
                              py: 0.7,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              cursor: 'pointer',
                              height: '42px',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                                borderColor: '#cbd5e1',
                              },
                            }}
                          >
                            <StorefrontOutlinedIcon
                              sx={{
                                fontSize: 18,
                                color: '#475569',
                              }}
                            />
                            <Box>
                              <Box
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  lineHeight: 1.1,
                                }}
                              >
                                Become a Seller
                              </Box>
                              <Box
                                sx={{
                                  fontSize: 9,
                                  color: '#64748b',
                                  lineHeight: 1.2,
                                }}
                              >
                                Start Selling Today
                              </Box>
                            </Box>
                          </Box>



                          {cartEnabled && (
                            <Box sx={{ position: 'relative', display: 'inline-flex', height: '42px' }}>
                              <CartFab
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.8,
                                  px: 1.3,
                                  py: 0.7,
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  minHeight: '40px !important',
                                  maxHeight: '40px !important',
                                  minWidth: '100px',
                                  width: '100px',
                                  boxShadow: 'none',
                                  overflow: 'visible',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: '#f1f5f9',
                                    borderColor: '#cbd5e1',
                                  },
                                  '& .MuiFab-label': {
                                    display: 'flex',
                                    gap: '6px',
                                    alignItems: 'center',
                                    height: '100%',
                                  },
                                }}
                                BadgeProps={{
                                  color: 'error',
                                  variant: 'standard',
                                  showZero: false,
                                  sx: {
                                    '& .MuiBadge-badge': {
                                      top: -6,
                                      right: -6,
                                      fontSize: 10,
                                      minWidth: 18,
                                      height: 18,
                                      bgcolor: '#dc2626',
                                      color: '#fff',
                                      fontWeight: 700,
                                      border: '2px solid #fff',
                                      zIndex: 1,
                                    },
                                  },
                                }}
                                icon={
                                  <>
                                    <RequestQuoteOutlinedIcon
                                      sx={{
                                        fontSize: 18,
                                        color: '#475569',
                                      }}
                                    />
                                    <Box>
                                      <Box
                                        sx={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          color: '#1e293b',
                                          lineHeight: 1.1,
                                        }}
                                      >
                                        Quote
                                      </Box>
                                      <Box
                                        sx={{
                                          fontSize: 9,
                                          color: '#64748b',
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        Best Price
                                      </Box>
                                    </Box>
                                  </>
                                }
                              />
                            </Box>
                          )}



                          {/* Account/Login Card - COMPACT */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              px: 1.3,
                              py: 0.7,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              height: '42px',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                                borderColor: '#cbd5e1',
                              },
                            }}
                          >
                            <HeaderAccountAction
                              sx={{
                                '& .MuiFab-root': {
                                  bgcolor: 'transparent !important',
                                  boxShadow: 'none !important',
                                  minHeight: 'auto !important',
                                },
                              }}
                              icon={
                                <Box
                                  sx={{
                                    bgcolor: '#1e40af',
                                    color: '#fff',
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <IconSvg src={iconPerson} size="small" />
                                </Box>
                              }
                            />
                          </Box>

                        </Box>
                      </Box>
                    </Container>
                  </Box>

                  {/* MAIN MENU - DESKTOP - COMPACT */}
                  <Box
                    ref={menuRef}
                    sx={{
                      bgcolor: '#fff',
                      position: isMenuSticky ? 'fixed' : 'relative',
                      top: isMenuSticky ? 0 : 'auto',
                      left: 0,
                      width: '100vw',

                      zIndex: 1200,
                      boxShadow: isMenuSticky
                        ? '0 2px 8px rgba(0,0,0,0.08)'
                        : 'none',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Container maxWidth="xl">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: { md: 1.5, lg: 3 },
                          px: { md: 2, lg: 3 },
                          py: 0.8,
                        }}
                      >
                        {menu?.items?.[0]?.children?.slice(0, 8).map((item) => (
                          <Box
                            key={item?.uid}
                            onMouseEnter={() => handleMouseEnter(item?.uid)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.3,
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#374151',
                              cursor: 'pointer',
                              px: 1.2,
                              py: 0.6,
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: '#eff6ff',
                                color: '#1e40af',
                              },
                            }}
                          >
                            {item?.name}
                            <IconSvg src={iconChevronDown} size="small" />
                          </Box>
                        ))}

                        <Box
                          component="a"
                          href="/blog"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            cursor: 'pointer',
                            px: 1.2,
                            py: 0.6,
                            borderRadius: '6px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#f3f4f6',
                              color: '#1976d2',
                            },
                          }}
                        >
                          <Trans id="Blog" />
                        </Box>
                      </Box>
                    </Container>

                    {/* SUB MENU */}
                    {subCategories.length > 0 && (
                      <Box
                        onMouseEnter={() => handleMouseEnter(activeUid || undefined)}
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          bgcolor: '#ffffff',
                          borderTop: '1px solid #e5e7eb',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                          zIndex: 1200,
                        }}
                      >
                        <Container maxWidth="xl">
                          <Box
                            sx={{
                              px: 3,
                              py: 2.5,
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: 2,
                            }}
                          >
                            {subCategories.map((sub) => {
                              const microCategories = sub?.children ?? []
                              const hasMicro = microCategories.length > 0

                              return (
                                <Box key={sub?.uid}>
                                  {/* Sub Category Header */}
                                  <Box
                                    component="a"
                                    href={`/${sub?.url_path}`}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      fontSize: '13px',
                                      fontWeight: 700,
                                      color: '#1f2937',
                                      textDecoration: 'none',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      transition: 'all 0.2s',
                                      borderBottom: '2px solid #e5e7eb',
                                      mb: 0.8,
                                      pb: 1,
                                      '&:hover': {
                                        color: '#1976d2',
                                      },
                                    }}
                                  >
                                    {sub?.name}
                                    {hasMicro && (
                                      <IconSvg
                                        src={iconChevronDown}
                                        size="small"
                                        sx={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }}
                                      />
                                    )}
                                  </Box>

                                  {/* Micro Categories - always visible below */}
                                  {hasMicro && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                      {microCategories.map((micro) => (
                                        <Box
                                          key={micro?.uid}
                                          component="a"
                                          href={`/${micro?.url_path}`}
                                          sx={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                            color: '#6b7280',
                                            textDecoration: 'none',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '4px',
                                            transition: 'all 0.15s',
                                            '&:hover': {
                                              bgcolor: '#eff6ff',
                                              color: '#1e40af',
                                              pl: 2,
                                            },
                                          }}
                                        >
                                          › {micro?.name}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              )
                            })}
                          </Box>
                        </Container>
                      </Box>
                    )}



                  </Box>


                </Box>
              )}

              {/* MOBILE DRAWER */}
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: 300,
                    bgcolor: '#fff',
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <Logo />
                  <IconButton onClick={() => setDrawerOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Mobile Drawer Actions - TOP */}
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <Button
                    href="/account/sellersignup"
                    variant="contained"
                    startIcon={
                      <StorefrontOutlinedIcon sx={{ fontSize: 20 }} />
                    }
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#10b981',
                      py: 1.3,
                      fontSize: '14px',
                      justifyContent: 'flex-start',
                      pl: 2.5,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#059669',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      },
                    }}
                  >
                    Seller Registration
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      <RequestQuoteOutlinedIcon sx={{ fontSize: 20 }} />
                    }
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#f59e0b',
                      py: 1.3,
                      fontSize: '14px',
                      justifyContent: 'flex-start',
                      pl: 2.5,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#d97706',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                      },
                    }}
                  >
                    Request Quote
                  </Button>
                </Box>

                <List sx={{ pt: 0 }}>
                  {menu?.items?.[0]?.children?.map((item) => (
                    <Box key={item?.uid}>
                      <ListItemButton
                        onClick={() => handleCategoryClick(item?.uid || '')}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            bgcolor: '#f3f4f6',
                          },
                        }}
                      >
                        <ListItemText
                          primary={item?.name}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1f2937',
                          }}
                        />
                        {expandedCategory === item?.uid ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </ListItemButton>

                      <Collapse
                        in={expandedCategory === item?.uid}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {item?.children?.map((sub) => {
                            const microCategories = sub?.children ?? []
                            const hasMicro = microCategories.length > 0

                            return (
                              <Box key={sub?.uid}>
                                {/* Sub Category Row */}
                                <ListItemButton
                                  onClick={() =>
                                    hasMicro
                                      ? setExpandedMicroUid(expandedMicroUid === sub?.uid ? null : sub?.uid ?? null)
                                      : router.push(`/${sub?.url_path}`)
                                  }
                                  sx={{
                                    pl: 4,
                                    py: 1,
                                    '&:hover': { bgcolor: '#eff6ff' },
                                  }}
                                >
                                  <ListItemText
                                    primary={sub?.name}
                                    primaryTypographyProps={{
                                      fontSize: 13,
                                      fontWeight: hasMicro ? 600 : 400,
                                      color: '#4b5563',
                                    }}
                                  />
                                  {hasMicro && (
                                    expandedMicroUid === sub?.uid
                                      ? <ExpandLess sx={{ fontSize: 16, color: '#9ca3af' }} />
                                      : <ExpandMore sx={{ fontSize: 16, color: '#9ca3af' }} />
                                  )}
                                </ListItemButton>

                                {/* Micro Categories */}
                                {hasMicro && (
                                  <Collapse in={expandedMicroUid === sub?.uid} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                      {microCategories.map((micro) => (
                                        <ListItemButton
                                          key={micro?.uid}
                                          href={`/${micro?.url_path}`}
                                          sx={{
                                            pl: 6,
                                            py: 0.7,
                                            '&:hover': { bgcolor: '#f0f9ff' },
                                          }}
                                        >
                                          <ListItemText
                                            primary={`› ${micro?.name}`}
                                            primaryTypographyProps={{
                                              fontSize: 12,
                                              color: '#6b7280',
                                            }}
                                          />
                                        </ListItemButton>
                                      ))}
                                    </List>
                                  </Collapse>
                                )}
                              </Box>
                            )
                          })}
                        </List>
                      </Collapse>


                    </Box>
                  ))}

                  <ListItemButton
                    href="/blog"
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#f3f4f6',
                      },
                    }}
                  >
                    <ListItemText
                      primary={<Trans id="Blog" />}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1f2937',
                      }}
                    />
                  </ListItemButton>
                </List>
              </Drawer>
            </>
          }
          footer={<Footer />}
        >
          {children}
        </LayoutDefault>
      </NavigationProvider>
    </>
  )
}