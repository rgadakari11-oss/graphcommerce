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
  IconSvg,
  LayoutDefault,
  MobileTopRight,
  NavigationFab,
  NavigationProvider,
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { Footer } from './Footer'
import type { LayoutQuery } from './Layout.gql'
import { Logo } from './Logo'
import HeaderAccountAction from '../header/HeaderAccountAction'



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

  const [activeUid, setActiveUid] = useState<string | null>(null)

  /* ================= STICKY HEADER ================= */

  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuOffsetTop = useRef(0)
  const [isMenuSticky, setIsMenuSticky] = useState(false)

  useEffect(() => {
    if (menuRef.current) {
      menuOffsetTop.current =
        menuRef.current.getBoundingClientRect().top + window.scrollY
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setIsMenuSticky(window.scrollY > menuOffsetTop.current)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  // Replace with your actual TomTom API key
  const TOMTOM_KEY = "tPk49oNL3jq0P29C21Ix12Hxg8DmTrQm"

  useEffect(() => {
    setActiveUid(null)
    selection.set([])
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
    }, 300) // debounce

    return () => clearTimeout(timer)
  }, [locationQuery])

  const handleMouseEnter = (uid: string | undefined) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setActiveUid(uid || null)
  }

  const handleMouseLeave = () => {
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
  }


  const handleLocationSelect = (place: any) => {
    const lat = place.position?.lat || null
    const lon = place.position?.lon || null
    const address = place.address?.freeformAddress || place.address?.streetName || ''

    const locationData = {
      lat,
      lon,
      address,
      distance: '50', // default distance in km
    }

    setSelectedLocation(locationData)
    setLocationQuery(address)
    setLocationSuggestions([])
    setShowLocationSuggestions(false)

    // Save to sessionStorage
    if (lat && lon && address) {
      saveLocationToSession({
        lat: lat,
        lon: lon,
        name: address,
        distance: '50',
      })
    }
  }

  const activeCategory = menu?.items?.[0]?.children?.find(
    (item) => item?.uid === activeUid,
  )

  const subCategories = activeCategory?.children ?? []

  return (
    <>
      <GlobalStyles
        styles={{
          '.LayoutDefault-header': {
            display: 'grid !important',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            columnGap: '20px',
            padding: '15px 24px',
            marginBottom: '23px',
          },
          '.LayoutDefault-main': {
            paddingTop: '0px',
          },
          '.header-center': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          },
          '.DesktopNavActions-root': {
            display: 'flex !important',
            alignItems: 'center',
            gap: '12px',
            justifySelf: 'end',
          },
          '.LayoutDefault-header .DesktopNavBar-root': {
            gridColumn: '1 / -1',
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '48px',
            backgroundColor: '#e9eef3',
          },
          '.DesktopNavBar-root': {
            gap: '28px',
          },
          '.DesktopNavItem-root': {
            fontSize: '15px !important',
            fontWeight: 500,
            cursor: 'pointer',
          },
        }}
      />

      <NavigationProvider selection={selection} items={[]}>
        <LayoutDefault
          {...uiProps}
          header={
            <>
              {/* LOGO */}
              <Logo />

              {/* SEARCH BAR */}
              <Box className="header-center">
                <Paper
                  elevation={2}
                  sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    width: '100%',
                    maxWidth: 680,
                    borderRadius: '50px',
                    overflow: 'visible',
                    border: '1px solid #e0e0e0',
                    position: 'relative',
                    marginBottom: "15px"
                  }}
                >
                  {/* LOCATION INPUT */}
                  <ClickAwayListener onClickAway={() => setShowLocationSuggestions(false)}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRight: '1px solid #e0e0e0',
                        pl: 2.5,
                        minWidth: 200,
                        position: 'relative',
                      }}
                    >
                      <LocationOnIcon sx={{ color: 'grey', mr: 1 }} />
                      <InputBase
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value)
                          setShowLocationSuggestions(true)
                        }}
                        onFocus={() => setShowLocationSuggestions(true)}
                        placeholder={selectedLocation.address || "Enter location"}
                        sx={{
                          fontSize: '15px !important',
                          fontWeight: 500,
                          flex: 1,
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
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                                {item.address?.freeformAddress || item.address?.streetName}
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
                    inputRef={searchInputRef}
                    placeholder="Search for Products / Services"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch((e.target as HTMLInputElement).value)
                      }
                    }}
                    sx={{
                      flex: 1,
                      px: 2.5,
                      fontSize: '15px !important',
                    }}
                  />

                  {/* SEARCH BUTTON */}
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleSearch(searchInputRef.current?.value)
                    }}
                    sx={{
                      borderRadius: 0,
                      minWidth: 120,
                      bgcolor: 'cadetblue',
                      fontSize: "15px !important",
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#0D47A1',
                      },
                    }}
                  >
                    <SearchIcon sx={{ mr: 1 }} />
                    Search
                  </Button>
                </Paper>
              </Box>

              {/* RIGHT ICONS */}
              <DesktopNavActions>
                <Fab
                  href="/service"
                  aria-label={i18n._('Customer Service')}
                  size="large"
                  color="inherit"
                  sx={{ boxShadow: 'none', bgcolor: 'transparent' }}
                >
                  <IconSvg src={iconCustomerService} size="large" />
                </Fab>

                <WishlistFab icon={<IconSvg src={iconHeart} size="large" />} />
                <HeaderAccountAction />

                {/* <CustomerFab
                  guestHref="/account/signin"
                  authHref="/account"
                /> */}
                {cartEnabled && <CartFab />}
              </DesktopNavActions>

              {/* <MobileTopRight /> */}

              {/* MAIN MENU */}
              <Box
                ref={menuRef}
                sx={{
                  gridColumn: '1 / -1',
                  width: '100vw',
                  marginLeft: 'calc(50% - 50vw)',
                  marginRight: 'calc(50% - 50vw)',
                  position: isMenuSticky ? 'fixed' : 'relative',
                  top: isMenuSticky ? 0 : 'auto',
                  zIndex: 1200,
                }}
                onMouseLeave={handleMouseLeave}
              >
                <DesktopNavBar>
                  {menu?.items?.[0]?.children?.map((item) => (
                    <DesktopNavItem
                      key={item?.uid}
                      onMouseEnter={() => handleMouseEnter(item?.uid)}
                    >
                      {item?.name}
                      <IconSvg src={iconChevronDown} size="small" />
                    </DesktopNavItem>
                  ))}

                  <DesktopNavItem href="/blog">
                    <Trans id="Blog" />
                  </DesktopNavItem>
                </DesktopNavBar>

                {/* SUB MENU */}
                {subCategories.length > 0 && (
                  <Box
                    onMouseEnter={() =>
                      handleMouseEnter(activeUid || undefined)
                    }
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      bgcolor: '#ffffff',
                      borderTop: '1px solid #e5e7eb',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      zIndex: 1200,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: 1200,
                        width: '100%',
                        px: 3,
                        py: 2,
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: 1.5,
                      }}
                    >
                      {subCategories.map((sub) => (
                        <Box
                          key={sub?.uid}
                          component="a"
                          href={`/${sub?.url_path}`}
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#1f2937',
                            textDecoration: 'none',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                              color: '#2563eb',
                            },
                          }}
                        >
                          {sub?.name}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
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