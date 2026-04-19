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
  Slide,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import HomeIcon from '@mui/icons-material/Home'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PersonIcon from '@mui/icons-material/Person'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { Footer } from './Footer'
import type { LayoutQuery } from './Layout.gql'
import { Logo } from './Logo'
import HeaderAccountAction from '../header/HeaderAccountAction'

// ── Location storage utilities ─────────────────────────────────────────────
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
      return { lat: Number(parsed.lat), lon: Number(parsed.lon), name: parsed.name, distance: parsed.distance || '50' }
    }
    return null
  } catch {
    return null
  }
}

export type LayoutNavigationProps = LayoutQuery &
  Omit<LayoutDefaultProps, 'footer' | 'header' | 'cartFab' | 'menuFab'>

// ── Bottom Nav Tab definition ──────────────────────────────────────────────
type BottomTab = 'home' | 'categories' | 'search' | 'quote' | 'account'

export function LayoutNavigation(props: LayoutNavigationProps) {
  const { menu, children, ...uiProps } = props
  const router = useRouter()
  const cartEnabled = useCartEnabled()
  const selection = useNavigationSelection()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [activeUid, setActiveUid] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedMicroUid, setExpandedMicroUid] = useState<string | null>(null)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchVal, setMobileSearchVal] = useState('')
  const [activeTab, setActiveTab] = useState<BottomTab>('home')
  const [visibleCount, setVisibleCount] = useState(8)
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false)
  const menuBarRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  /* ── Sticky header (desktop only) ── */
  const headerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuOffsetTop = useRef(0)
  const [isMenuSticky, setIsMenuSticky] = useState(false)

  useEffect(() => {
    if (menuRef.current && !isMobile) {
      menuOffsetTop.current = menuRef.current.getBoundingClientRect().top + window.scrollY
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) return
    const onScroll = () => setIsMenuSticky(window.scrollY > menuOffsetTop.current)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  // Dynamically calculate visible category count
  useEffect(() => {
    if (isMobile) return
    const calculate = (width: number) => {
      const available = width - 180
      const count = Math.max(3, Math.floor(available / 110))
      setVisibleCount(Math.min(count, 12))
    }
    if (menuBarRef.current) {
      calculate(menuBarRef.current.offsetWidth)
      const ro = new ResizeObserver((entries) => {
        for (const e of entries) calculate(e.contentRect.width)
      })
      ro.observe(menuBarRef.current)
      return () => ro.disconnect()
    }
  }, [isMobile])

  // Focus mobile search input when overlay opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 100)
    }
  }, [mobileSearchOpen])

  // Location states
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null; lon: number | null; address: string; distance?: string
  }>({ lat: null, lon: null, address: '', distance: '50' })
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const TOMTOM_KEY = 'tPk49oNL3jq0P29C21Ix12Hxg8DmTrQm'

  useEffect(() => {
    setActiveUid(null)
    selection.set([])
    setDrawerOpen(false)
    setMobileSearchOpen(false)
  }, [router.asPath, selection])

  useEffect(() => {
    const savedLocation = getLocationFromSession()
    if (savedLocation) {
      setSelectedLocation({ lat: savedLocation.lat, lon: savedLocation.lon, address: savedLocation.name, distance: savedLocation.distance })
      setLocationQuery(savedLocation.name)
    }
  }, [])

  useEffect(() => {
    if (locationQuery.length < 3) { setLocationSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.tomtom.com/search/2/search/${encodeURIComponent(locationQuery)}.json?typeahead=true&countrySet=IN&limit=5&key=${TOMTOM_KEY}`
        )
        const data = await res.json()
        setLocationSuggestions(data.results || [])
      } catch { setLocationSuggestions([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [locationQuery])

  const handleMouseEnter = (uid: string | undefined) => {
    if (isMobile) return
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null }
    setActiveUid(uid || null)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    closeTimeoutRef.current = setTimeout(() => setActiveUid(null), 150)
  }

  const handleSearch = (value?: string) => {
    if (!value || !value.trim()) return
    const shortAddress = selectedLocation.address?.slice(0, 5)
    router.push(`/search/${encodeURIComponent(value)}/l/${encodeURIComponent(shortAddress)}`)
    setMobileSearchOpen(false)
  }

  const handleLocationSelect = (place: any) => {
    const lat = place.position?.lat || null
    const lon = place.position?.lon || null
    const address = place.address?.freeformAddress || place.address?.streetName || ''
    setSelectedLocation({ lat, lon, address, distance: '50' })
    setLocationQuery(address)
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
    if (lat && lon && address) saveLocationToSession({ lat, lon, name: address, distance: '50' })
  }

  const handleCategoryClick = (uid: string) => {
    setExpandedCategory(expandedCategory === uid ? null : uid)
  }

  const activeCategory = menu?.items?.[0]?.children?.find((item) => item?.uid === activeUid)
  const subCategories = activeCategory?.children ?? []

  const getMenuLabel = (name: string): string => {
    if (!name) return ''
    const labelMap: Record<string, string> = {
      'Agriculture Produce & Farming Supplies': 'Agriculture & Farming',
      'Construction Materials & Building Solutions': 'Construction & Building',
      'Electrical & Electronic Appliances': 'Electrical & Electronic',
      'Gifting & Decorative Creations': 'Gifting & Decorative',
      'Clothing & Lifestyle Wear': 'Clothing & Lifestyle',
      'Health Care & Wellness': 'Health Care',
      'Home Essentials & Utility Products': 'Home Essentials',
      'Industrial Chemicals & Materials': 'Industrial Chemicals',
      'Automotive & Vehicle Accessories': 'Automotive',
      'Food & Beverages': 'Food & Bev',
      'Sports & Fitness Equipment': 'Sports & Fitness',
      'Office & Stationery Supplies': 'Office & Stationery',
      'Beauty & Personal Care': 'Beauty',
      'Electronics & Gadgets': 'Electronics',
      'Furniture & Home Decor': 'Furniture & Decor',
    }
    if (labelMap[name]) return labelMap[name]
    return name.trim().split(/\s+/)[0] ?? name
  }

  // Desktop Search Bar
  const DesktopSearchBar = () => (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 600,
        borderRadius: '50px',
        overflow: 'visible',
        border: '1px solid #e0e0e0',
        position: 'relative',
        backgroundColor: '#fff',
        height: '39px',
      }}
    >
      <ClickAwayListener onClickAway={() => setShowLocationSuggestions(false)}>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', borderRight: '1px solid #e0e0e0', pl: 2, pr: 1.5, minWidth: 50, position: 'relative' }}>
          <LocationOnIcon sx={{ color: '#5f6368', mr: 0.5, fontSize: 18 }} />
          <InputBase
            value={locationQuery}
            onChange={(e) => { setLocationQuery(e.target.value); setShowLocationSuggestions(true) }}
            onFocus={() => setShowLocationSuggestions(true)}
            placeholder={selectedLocation.address || 'Enter Location'}
            sx={{ fontSize: '14px !important', fontWeight: 500, flex: 1, '& input': { padding: 0, fontSize: '14px !important' } }}
          />
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <Box sx={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', minWidth: 280, background: '#fff', border: '1px solid #ddd', borderRadius: '8px', zIndex: 2000, maxHeight: '250px', overflowY: 'auto' }}>
              {locationSuggestions.map((item) => (
                <Box key={item.id} onClick={() => handleLocationSelect(item)} sx={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: '14px', '&:hover': { backgroundColor: '#f1f5f9' }, '&:last-child': { borderBottom: 'none' } }}>
                  <Box sx={{ fontWeight: 500, color: '#1f2937' }}>{item.address?.freeformAddress || item.address?.streetName}</Box>
                  {item.address?.country && <Box sx={{ fontSize: '12px', color: '#6b7280', mt: 0.5 }}>{item.address.country}</Box>}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </ClickAwayListener>

      <InputBase
        inputRef={searchInputRef}
        placeholder="Search for Products / Services"
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch((e.target as HTMLInputElement).value) }}
        sx={{ flex: 1, px: 2, fontSize: '14px !important', '& input': { padding: 0, fontSize: '14px !important' } }}
      />

      <Button
        variant="contained"
        onClick={() => handleSearch(searchInputRef.current?.value)}
        sx={{
          minWidth: 101, bgcolor: '#eff6ff', fontSize: '14px', fontWeight: 600,
          textTransform: 'none', px: 2, borderRadius: '0 50px 50px 0',
          minHeight: '39px', height: '39px', boxShadow: 'none',
          '&:hover': { bgcolor: '#dbeafe' },
        }}
      >
        <SearchIcon sx={{ fontSize: 18 }} />
        <span style={{ marginLeft: 10, fontSize: '14px' }}>Search</span>
      </Button>
    </Paper>
  )

  // ── Bottom Nav Tabs config ─────────────────────────────────────────────
  const bottomTabs: { id: BottomTab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode; action: () => void }[] = [
    {
      id: 'home', label: 'Home',
      icon: <HomeOutlinedIcon sx={{ fontSize: 22 }} />,
      activeIcon: <HomeIcon sx={{ fontSize: 22 }} />,
      action: () => { setActiveTab('home'); router.push('/') },
    },
    {
      id: 'categories', label: 'Categories',
      icon: <CategoryOutlinedIcon sx={{ fontSize: 22 }} />,
      activeIcon: <CategoryIcon sx={{ fontSize: 22 }} />,
      action: () => { setActiveTab('categories'); setDrawerOpen(true) },
    },
    {
      id: 'search', label: 'Search',
      icon: <SearchIcon sx={{ fontSize: 24 }} />,
      activeIcon: <SearchIcon sx={{ fontSize: 24 }} />,
      action: () => { setActiveTab('search'); setMobileSearchOpen(true) },
    },
    {
      id: 'quote', label: 'Quote',
      icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 22 }} />,
      activeIcon: <RequestQuoteIcon sx={{ fontSize: 22 }} />,
      action: () => { setActiveTab('quote'); router.push('/quotecart') },
    },
    {
      id: 'account', label: 'Account',
      icon: <PersonOutlineIcon sx={{ fontSize: 22 }} />,
      activeIcon: <PersonIcon sx={{ fontSize: 22 }} />,
      action: () => { setActiveTab('account'); router.push('/account') },
    },
  ]

  return (
    <>
      <GlobalStyles
        styles={{
          body: { margin: 0, padding: 0, overflowX: 'hidden' },
          '.LayoutDefault-main': {
            // On mobile: top bar (56px) + bottom nav (64px)
            paddingTop: isMobile ? '56px' : '0px',
            paddingBottom: isMobile ? '64px' : '0px',
          },
        }}
      />

      <NavigationProvider selection={selection} items={[]}>
        <LayoutDefault
          {...uiProps}
          header={
            <>
              {/* ═══════════════════════════════════════════════════════════
                  MOBILE HEADER — compact top bar + bottom nav
              ═══════════════════════════════════════════════════════════ */}
              {isMobile && (
                <>
                  {/* Top bar: Logo + Cart icon only */}
                  <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                      bgcolor: '#fff',
                      color: '#1f2937',
                      zIndex: 1300,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <Toolbar sx={{ px: 2, minHeight: '56px !important', justifyContent: 'space-between' }}>
                      {/* Logo — left aligned */}
                      <Logo />

                      {/* Right actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {cartEnabled && (
                          <CartFab
                            sx={{
                              bgcolor: 'transparent',
                              boxShadow: 'none',
                              minHeight: '40px !important',
                              minWidth: '40px',
                              width: '40px',
                              color: '#374151',
                              '&:hover': { bgcolor: '#f3f4f6' },
                            }}
                            BadgeProps={{
                              color: 'error',
                              variant: 'standard',
                              showZero: false,
                              sx: {
                                '& .MuiBadge-badge': {
                                  top: 2, right: 2, fontSize: 9, minWidth: 16, height: 16,
                                  bgcolor: '#dc2626', color: '#fff', fontWeight: 700, border: '1.5px solid #fff',
                                },
                              },
                            }}
                          />
                        )}
                        <Box
                          component="a"
                          href="/account/sellersignup"
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            px: 1.2, py: 0.6,
                            bgcolor: '#1e40af', color: '#fff',
                            borderRadius: '6px', textDecoration: 'none',
                            fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                          }}
                        >
                          <StorefrontOutlinedIcon sx={{ fontSize: 14 }} />
                          Sell
                        </Box>
                      </Box>
                    </Toolbar>

                  </AppBar>

                  {/* ── MOBILE SEARCH OVERLAY ── */}
                  {mobileSearchOpen && (
                    <Box
                      sx={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        zIndex: 1400,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onClick={(e) => { if (e.target === e.currentTarget) setMobileSearchOpen(false) }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#fff',
                          px: 2,
                          pt: 2,
                          pb: 2.5,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                          borderRadius: '0 0 20px 20px',
                        }}
                      >
                        {/* Header row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Search Products</Box>
                          <IconButton size="small" onClick={() => setMobileSearchOpen(false)}>
                            <CloseIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                          </IconButton>
                        </Box>

                        {/* Search input — font-size 16px prevents iOS zoom */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            mb: 1.5,
                          }}
                        >
                          <SearchIcon sx={{ fontSize: 20, color: '#9ca3af', ml: 1.5, flexShrink: 0 }} />
                          <InputBase
                            inputRef={mobileSearchRef}
                            value={mobileSearchVal}
                            onChange={(e) => setMobileSearchVal(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(mobileSearchVal) }}
                            placeholder="Search products, categories…"
                            autoComplete="off"
                            inputProps={{
                              // Prevents iOS from zooming in when focusing input
                              style: { fontSize: '16px', padding: '12px 8px', fontFamily: 'inherit' },
                            }}
                            sx={{ flex: 1, '& input': { fontSize: '16px !important' } }}
                          />
                          {mobileSearchVal && (
                            <IconButton size="small" onClick={() => setMobileSearchVal('')} sx={{ mr: 0.5 }}>
                              <CloseIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                            </IconButton>
                          )}
                        </Box>

                        {/* Search button */}
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleSearch(mobileSearchVal)}
                          disabled={!mobileSearchVal.trim()}
                          sx={{
                            bgcolor: '#1e40af', color: '#fff',
                            textTransform: 'none', fontWeight: 700,
                            fontSize: '14px', borderRadius: '10px', py: 1.3,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#1e3a8a', boxShadow: 'none' },
                            '&:disabled': { bgcolor: '#e2e8f0', color: '#9ca3af' },
                          }}
                        >
                          Search
                        </Button>

                        {/* Quick category chips */}
                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                            Popular Categories
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                            {menu?.items?.[0]?.children?.slice(0, 6).map((cat) => (
                              <Box
                                key={cat?.uid}
                                onClick={() => { router.push(`/${cat?.url_path}`); setMobileSearchOpen(false) }}
                                sx={{
                                  px: 1.2, py: 0.5,
                                  bgcolor: '#eff6ff', color: '#1e40af',
                                  borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                  cursor: 'pointer', border: '1px solid #bfdbfe',
                                  '&:hover': { bgcolor: '#dbeafe' },
                                }}
                              >
                                {getMenuLabel(cat?.name ?? '')}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* ── BOTTOM NAVIGATION BAR ── */}
                  <Box
                    sx={{
                      position: 'fixed',
                      bottom: 0, left: 0, right: 0,
                      height: 64,
                      bgcolor: '#fff',
                      borderTop: '1px solid #e5e7eb',
                      zIndex: 1300,
                      display: 'flex',
                      alignItems: 'stretch',
                      boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    {bottomTabs.map((tab) => {
                      const isActive = activeTab === tab.id
                      const isSearchTab = tab.id === 'search'

                      return (
                        <Box
                          key={tab.id}
                          onClick={tab.action}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                            position: 'relative',
                            // Search tab gets a special elevated style
                            ...(isSearchTab ? {
                              '& .search-bubble': {
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#1e40af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(30,64,175,0.4)',
                                mt: '-18px',
                                color: '#fff',
                                transition: 'transform 0.15s',
                                '&:hover': { transform: 'scale(1.08)' },
                              },
                            } : {
                              '&:hover': { bgcolor: '#f8fafc' },
                              transition: 'background 0.15s',
                            }),
                          }}
                        >
                          {isSearchTab ? (
                            <>
                              <Box className="search-bubble">
                                <SearchIcon sx={{ fontSize: 22, color: '#fff' }} />
                              </Box>
                              <Box sx={{ fontSize: '10px', fontWeight: 600, color: '#1e40af', mt: '2px' }}>
                                Search
                              </Box>
                            </>
                          ) : (
                            <>
                              {/* Active indicator */}
                              {isActive && (
                                <Box sx={{
                                  position: 'absolute', top: 0, left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: 28, height: 2.5,
                                  bgcolor: '#1e40af',
                                  borderRadius: '0 0 4px 4px',
                                }} />
                              )}
                              <Box sx={{ color: isActive ? '#1e40af' : '#9ca3af', transition: 'color 0.15s' }}>
                                {isActive ? tab.activeIcon : tab.icon}
                              </Box>
                              <Box sx={{
                                fontSize: '10px', fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#1e40af' : '#9ca3af',
                                transition: 'all 0.15s',
                              }}>
                                {tab.label}
                              </Box>
                            </>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  DESKTOP HEADER — unchanged
              ═══════════════════════════════════════════════════════════ */}
              {!isMobile && (
                <Box
                  ref={headerRef}
                  sx={{ borderBottom: '1px solid #e5e7eb', bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 1100, width: '100vw', left: 0 }}
                >
                  {/* Top Bar */}
                  <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <Container maxWidth="xl">
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: { md: 2, lg: 3 } }}>
                        <Box sx={{ minWidth: 140, transform: 'scale(0.9)' }}>
                          <Logo />
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: 2, maxWidth: 900 }}>
                          <DesktopSearchBar />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 'fit-content' }}>
                          <Box
                            component="a"
                            href="/account/sellersignup"
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.8,
                              px: 1.3, py: 0.7, bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
                              borderRadius: '4px', textDecoration: 'none', height: '42px',
                              transition: 'all 0.2s',
                              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                            }}
                          >
                            <StorefrontOutlinedIcon sx={{ fontSize: 18, color: '#475569' }} />
                            <Box>
                              <Box sx={{ fontSize: 11, fontWeight: 600, color: '#1e293b', lineHeight: 1.1 }}>Become a Seller</Box>
                              <Box sx={{ fontSize: 9, color: '#64748b', lineHeight: 1.2 }}>Start Selling Today</Box>
                            </Box>
                          </Box>

                          {cartEnabled && (
                            <Box sx={{ position: 'relative', display: 'inline-flex', height: '42px' }}>
                              <CartFab
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 0.8,
                                  px: 1.3, py: 0.7, bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
                                  borderRadius: '4px', minHeight: '40px !important', maxHeight: '40px !important',
                                  minWidth: '100px', width: '100px', boxShadow: 'none', overflow: 'visible',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                                  '& .MuiFab-label': { display: 'flex', gap: '6px', alignItems: 'center', height: '100%' },
                                }}
                                BadgeProps={{
                                  color: 'error', variant: 'standard', showZero: false,
                                  sx: { '& .MuiBadge-badge': { top: -6, right: -6, fontSize: 10, minWidth: 18, height: 18, bgcolor: '#dc2626', color: '#fff', fontWeight: 700, border: '2px solid #fff', zIndex: 1 } },
                                }}
                                icon={
                                  <>
                                    <RequestQuoteOutlinedIcon sx={{ fontSize: 18, color: '#475569' }} />
                                    <Box>
                                      <Box sx={{ fontSize: 11, fontWeight: 600, color: '#1e293b', lineHeight: 1.1 }}>Quote</Box>
                                      <Box sx={{ fontSize: 9, color: '#64748b', lineHeight: 1.2 }}>Best Price</Box>
                                    </Box>
                                  </>
                                }
                              />
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', px: 1.3, py: 0.7, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', height: '42px', transition: 'all 0.2s', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' } }}>
                            <HeaderAccountAction
                              sx={{ '& .MuiFab-root': { bgcolor: 'transparent !important', boxShadow: 'none !important', minHeight: 'auto !important' } }}
                              icon={
                                <Box sx={{ bgcolor: '#1e40af', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconSvg src={iconPerson} size="small" />
                                </Box>
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Container>
                  </Box>

                  {/* Desktop Menu Bar */}
                  <Box
                    ref={menuRef}
                    sx={{
                      bgcolor: '#fff',
                      position: isMenuSticky ? 'fixed' : 'relative',
                      top: isMenuSticky ? 0 : 'auto',
                      left: 0, width: '100vw', zIndex: 1200,
                      boxShadow: isMenuSticky ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                    onMouseLeave={() => { handleMouseLeave(); setAllCategoriesOpen(false) }}
                  >
                    <Container maxWidth="xl">
                      <Box
                        ref={menuBarRef}
                        sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 0, px: { md: 1, lg: 2 }, py: 0.4 }}
                      >
                        <Box
                          onMouseEnter={() => { setAllCategoriesOpen(true); setActiveUid(null) }}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.6,
                            fontSize: '13px', fontWeight: 700, color: '#fff',
                            cursor: 'pointer', px: 1.5, py: 0.9, mr: 0.5,
                            borderRadius: '6px', bgcolor: '#1e40af', whiteSpace: 'nowrap',
                            flexShrink: 0, transition: 'background 0.2s',
                            '&:hover': { bgcolor: '#1e3a8a' },
                          }}
                        >
                          <MenuIcon sx={{ fontSize: 16 }} />
                          All Categories
                          <IconSvg src={iconChevronDown} size="small" sx={{ opacity: 0.8 }} />
                        </Box>

                        <Box sx={{ width: '1px', height: '22px', bgcolor: '#e5e7eb', mx: 1, flexShrink: 0 }} />

                        {menu?.items?.[0]?.children?.slice(0, visibleCount).map((item) => (
                          <Box
                            key={item?.uid}
                            component="a"
                            href={item?.url_path ? `/${item.url_path}` : '#'}
                            onMouseEnter={() => setAllCategoriesOpen(false)}
                            onClick={(e: React.MouseEvent) => {
                              if (item?.url_path) { e.preventDefault(); setActiveUid(null); router.push(`/${item.url_path}`) }
                            }}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 0.2,
                              fontSize: { md: '12px', lg: '13px' }, fontWeight: 600, color: '#374151',
                              cursor: 'pointer', px: { md: 0.8, lg: 1.1, xl: 1.3 }, py: 0.7,
                              borderRadius: '6px', transition: 'all 0.15s', textDecoration: 'none',
                              whiteSpace: 'nowrap', flexShrink: 0,
                              '&:hover': { bgcolor: '#eff6ff', color: '#1e40af' },
                            }}
                          >
                            {getMenuLabel(item?.name ?? '')}

                            <Box
                              onMouseEnter={() => handleMouseEnter(item?.uid)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                ml: 0.3,
                                cursor: 'pointer',
                              }}
                            >
                              <IconSvg
                                src={iconChevronDown}
                                size="small"
                                sx={{
                                  flexShrink: 0,
                                  opacity: 0.6,
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    opacity: 1,
                                    transform: 'rotate(180deg)',
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Container>

                    {/* All Categories Mega Dropdown */}
                    {allCategoriesOpen && (
                      <Box
                        onMouseEnter={() => setAllCategoriesOpen(true)}
                        onMouseLeave={() => setAllCategoriesOpen(false)}
                        sx={{ position: 'absolute', top: '100%', left: 0, right: 0, bgcolor: '#fff', borderTop: '3px solid #1e40af', boxShadow: '0 8px 32px rgba(0,0,0,0.13)', zIndex: 1202 }}
                      >
                        <Container maxWidth="xl">
                          <Box sx={{ px: 3, py: 2.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1 }}>
                            {menu?.items?.[0]?.children?.map((item) => (
                              <Box
                                key={item?.uid}
                                component="a"
                                href={item?.url_path ? `/${item.url_path}` : '#'}
                                onClick={(e: React.MouseEvent) => {
                                  if (item?.url_path) { e.preventDefault(); setAllCategoriesOpen(false); router.push(`/${item.url_path}`) }
                                }}
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 1,
                                  px: 1.5, py: 0.9, borderRadius: '6px', textDecoration: 'none',
                                  transition: 'all 0.15s',
                                  '&:hover': { bgcolor: '#eff6ff', color: '#1e40af', pl: 2 },
                                }}
                              >
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1e40af', flexShrink: 0, opacity: 0.5 }} />
                                <Box sx={{ fontSize: '13px', fontWeight: 600, color: '#374151', '&:hover': { color: '#1e40af' } }}>{item?.name}</Box>
                              </Box>
                            ))}
                          </Box>
                        </Container>
                      </Box>
                    )}

                    {/* Sub Menu */}
                    {subCategories.length > 0 && (
                      <Box
                        onMouseEnter={() => handleMouseEnter(activeUid || undefined)}
                        sx={{ position: 'absolute', top: '100%', left: 0, right: 0, bgcolor: '#ffffff', borderTop: '1px solid #e5e7eb', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', zIndex: 1200 }}
                      >
                        <Container maxWidth="xl">
                          <Box sx={{ px: 3, py: 2.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                            {subCategories.map((sub) => {
                              const microCategories = sub?.children ?? []
                              const hasMicro = microCategories.length > 0
                              return (
                                <Box key={sub?.uid}>
                                  <Box
                                    component="a"
                                    href={`/${sub?.url_path}`}
                                    sx={{
                                      display: 'flex', alignItems: 'center', gap: 0.5,
                                      fontSize: '13px', fontWeight: 700, color: '#1f2937',
                                      textDecoration: 'none', padding: '4px 10px', borderRadius: '6px',
                                      borderBottom: '2px solid #e5e7eb', mb: 0.8, pb: 1,
                                      '&:hover': { color: '#1976d2' },
                                    }}
                                  >
                                    {sub?.name}
                                    {hasMicro && <IconSvg src={iconChevronDown} size="small" sx={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }} />}
                                  </Box>
                                  {hasMicro && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                      {microCategories.map((micro) => (
                                        <Box
                                          key={micro?.uid}
                                          component="a"
                                          href={`/${micro?.url_path}`}
                                          sx={{
                                            display: 'block', fontSize: '12px', fontWeight: 400, color: '#6b7280',
                                            textDecoration: 'none', px: 1.5, py: 0.5, borderRadius: '4px',
                                            transition: 'all 0.15s',
                                            '&:hover': { bgcolor: '#eff6ff', color: '#1e40af', pl: 2 },
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

              {/* ═══════════════════════════════════════════════════════════
                  MOBILE CATEGORIES DRAWER (triggered from bottom nav)
              ═══════════════════════════════════════════════════════════ */}
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: 300, bgcolor: '#fff' } }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <Logo />
                  <IconButton onClick={() => setDrawerOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Drawer CTA buttons */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                  <Button
                    href="/account/sellersignup"
                    variant="contained"
                    startIcon={<StorefrontOutlinedIcon sx={{ fontSize: 20 }} />}
                    fullWidth
                    sx={{
                      textTransform: 'none', fontWeight: 600, bgcolor: '#10b981',
                      py: 1.3, fontSize: '14px', justifyContent: 'flex-start', pl: 2.5,
                      boxShadow: 'none', '&:hover': { bgcolor: '#059669', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' },
                    }}
                  >
                    Seller Registration
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RequestQuoteOutlinedIcon sx={{ fontSize: 20 }} />}
                    fullWidth
                    sx={{
                      textTransform: 'none', fontWeight: 600, bgcolor: '#f59e0b',
                      py: 1.3, fontSize: '14px', justifyContent: 'flex-start', pl: 2.5,
                      boxShadow: 'none', '&:hover': { bgcolor: '#d97706', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' },
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
                        sx={{ py: 1.5, '&:hover': { bgcolor: '#f3f4f6' } }}
                      >
                        <ListItemText
                          primary={item?.name}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}
                        />
                        {expandedCategory === item?.uid ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={expandedCategory === item?.uid} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item?.children?.map((sub) => {
                            const microCategories = sub?.children ?? []
                            const hasMicro = microCategories.length > 0
                            return (
                              <Box key={sub?.uid}>
                                <ListItemButton
                                  onClick={() => hasMicro
                                    ? setExpandedMicroUid(expandedMicroUid === sub?.uid ? null : sub?.uid ?? null)
                                    : router.push(`/${sub?.url_path}`)
                                  }
                                  sx={{ pl: 4, py: 1, '&:hover': { bgcolor: '#eff6ff' } }}
                                >
                                  <ListItemText
                                    primary={sub?.name}
                                    primaryTypographyProps={{ fontSize: 13, fontWeight: hasMicro ? 600 : 400, color: '#4b5563' }}
                                  />
                                  {hasMicro && (expandedMicroUid === sub?.uid
                                    ? <ExpandLess sx={{ fontSize: 16, color: '#9ca3af' }} />
                                    : <ExpandMore sx={{ fontSize: 16, color: '#9ca3af' }} />
                                  )}
                                </ListItemButton>
                                {hasMicro && (
                                  <Collapse in={expandedMicroUid === sub?.uid} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                      {microCategories.map((micro) => (
                                        <ListItemButton
                                          key={micro?.uid}
                                          href={`/${micro?.url_path}`}
                                          sx={{ pl: 6, py: 0.7, '&:hover': { bgcolor: '#f0f9ff' } }}
                                        >
                                          <ListItemText
                                            primary={`› ${micro?.name}`}
                                            primaryTypographyProps={{ fontSize: 12, color: '#6b7280' }}
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

                  <ListItemButton href="/blog" sx={{ py: 1.5, '&:hover': { bgcolor: '#f3f4f6' } }}>
                    <ListItemText
                      primary={<Trans id="Blog" />}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}
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