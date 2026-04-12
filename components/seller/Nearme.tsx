import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type NearbyLocation = {
  lat: number
  lon: number
  distance: string
  label: string
  slug: string
}

/* ---------------------------------- */
/* TOP 10 CITIES                      */
/* ---------------------------------- */

const TOP_CITIES: NearbyLocation[] = [
  { label: 'Mumbai', lat: 19.076, lon: 72.8777, distance: '50', slug: 'mum' },
  { label: 'Delhi', lat: 28.6139, lon: 77.209, distance: '60', slug: 'del' },
  { label: 'Bangalore', lat: 12.9716, lon: 77.5946, distance: '50', slug: 'blr' },
  { label: 'Hyderabad', lat: 17.385, lon: 78.4867, distance: '50', slug: 'hyd' },
  { label: 'Chennai', lat: 13.0827, lon: 80.2707, distance: '50', slug: 'che' },
  { label: 'Pune', lat: 18.5204, lon: 73.8567, distance: '40', slug: 'pun' },
  { label: 'Kolkata', lat: 22.5726, lon: 88.3639, distance: '50', slug: 'kol' },
  { label: 'Ahmedabad', lat: 23.0225, lon: 72.5714, distance: '40', slug: 'amd' },
  { label: 'Jaipur', lat: 26.9124, lon: 75.7873, distance: '40', slug: 'jai' },
  { label: 'Chandigarh', lat: 30.7333, lon: 76.7794, distance: '40', slug: 'cha' },
]

const stripLocationFromPath = (path: string) =>
  path.replace(/\/l\/[^/?#]+/, '')

export function Nearme() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeLocation, setActiveLocation] = useState<NearbyLocation | null>(null)

  useEffect(() => {
    setMounted(true)
    const stored = sessionStorage.getItem('nearby_location')
    if (stored) {
      try {
        setActiveLocation(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem('nearby_location')
      }
    }
  }, [])

  if (!mounted) return null

  const buildLocationUrl = (slug: string) => {
    const [path, query] = router.asPath.split('?')
    const cleanPath = stripLocationFromPath(path)
    const newPath = `${cleanPath}/l/${slug}`
    return query ? `${newPath}?${query}` : newPath
  }

  const applyLocation = (location: NearbyLocation) => {
    sessionStorage.setItem('nearby_location', JSON.stringify(location))
    setActiveLocation(location)

    router.replace(buildLocationUrl(location.slug), undefined, {
      shallow: true,
    })
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) return
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          distance: '50',
          label: 'Near Me',
          slug: 'nea',
        })
        setLoading(false)
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    )
  }

  const removeLocation = () => {
    sessionStorage.removeItem('nearby_location')
    setActiveLocation(null)

    const [path, query] = router.asPath.split('?')
    const cleanPath = stripLocationFromPath(path)

    router.replace(query ? `${cleanPath}?${query}` : cleanPath, undefined, {
      shallow: true,
    })
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',      // ⭐ prevents layout expansion
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,

          overflowX: 'auto',
          overflowY: 'hidden',

          width: '100%',
          maxWidth: '100%',
          minWidth: 0,            // ⭐ allows shrink inside grid/flex

          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`
          /* hide scrollbar safely */
          div::-webkit-scrollbar {
            display: none;
          }
        `}
        </style>

        <Chip
          active={activeLocation?.slug === 'nea'}
          primary
          onClick={handleNearMe}
        >
          {loading ? 'Detecting…' : 'Near Me'}
        </Chip>

        {TOP_CITIES.map((city) => {
          const isActive = activeLocation?.slug === city.slug

          return (
            <Chip
              key={city.slug}
              active={isActive}
              onClick={() => !isActive && applyLocation(city)}
              onRemove={isActive ? removeLocation : undefined}
            >
              {city.label}
            </Chip>
          )
        })}
      </div>
    </div>
  )

}

/* ---------------------------------- */
/* CHIP (ENHANCED STYLE + CLOSE ICON) */
/* ---------------------------------- */

function Chip({
  children,
  onClick,
  onRemove,
  active,
  primary,
}: {
  children: React.ReactNode
  onClick?: () => void
  onRemove?: () => void
  active?: boolean
  primary?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        border: active ? '1.5px solid #1976d2' : '1.5px solid #e0e0e0',
        background: active
          ? '#1976d2'
          : primary
            ? 'linear-gradient(135deg, #f5f7fa, #e8ecf1)'
            : '#fff',
        color: active ? '#fff' : '#333',
        boxShadow: active
          ? '0 2px 8px rgba(25,118,210,0.35)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0, // Prevent chips from shrinking
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.12)'
          e.currentTarget.style.borderColor = '#1976d2'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
          e.currentTarget.style.borderColor = '#e0e0e0'
        }
      }}
    >
      <span>{children}</span>

      {/* Close icon INSIDE chip */}
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{
            fontSize: 18,
            lineHeight: 1,
            marginLeft: 2,
            cursor: 'pointer',
            opacity: 0.9,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
        >
          ×
        </span>
      )}
    </div>
  )
}