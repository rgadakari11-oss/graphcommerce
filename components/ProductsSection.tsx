import React, { useState } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'

// ─────────────────────────────────────────────────────────────────────────────
// USAGE in index.tsx:
//
//   import ProductsSection from '../components/ProductsSection'
//
//   <ProductsSection group={1} />   ← Agriculture, Clothing, Construction
//   <ProductsSection group={2} />   ← Electrical, Gifting, Health
//   <ProductsSection group={3} />   ← Home, Chemicals, Industrial, Tools
//
// The `group` prop (1 | 2 | 3) controls which categories are shown.
// Each instance is fully self-contained — tabs, strip, grid, CTA.
// ─────────────────────────────────────────────────────────────────────────────

// ── Theme ─────────────────────────────────────────────────────────────────────
const BRAND = '#125ab5'
const BRAND_LIGHT = '#f8fafc'
const BRAND_MID = '#f8fafc'
const BRAND_DARK = 'red'
const BRAND_TEXT = '#000000'

// ── All categories in one map — ORDER matters (determines group slicing) ──────
const ALL_CATEGORIES: Record<string, {
  icon: string
  label: string
  products: { sku: string; name: string; price: number; unit: string; mqa: number; sub: string }[]
}> = {
  // ── Group 1 (indices 0–2) ──────────────────────────────────────────────────
  "Agriculture": {
    icon: "🌾", label: "Agriculture Produce & Farming Supplies",
    products: [
      { sku: "AGR001", name: "Premium Organic Brown Rice 1KG", price: 120, unit: "KG", mqa: 50, sub: "Rice & Grain Varieties" },
      { sku: "AGR002", name: "Short Grain Brown Rice 5KG", price: 550, unit: "Bags", mqa: 20, sub: "Rice & Grain Varieties" },
      { sku: "AGR003", name: "Sprouted Brown Rice 1KG", price: 180, unit: "KG", mqa: 30, sub: "Rice & Grain Varieties" },
      { sku: "AGR004", name: "Aromatic Long Grain Basmati 1KG", price: 150, unit: "KG", mqa: 100, sub: "Rice & Grain Varieties" },
      { sku: "AGR005", name: "Aged Long Grain Rice 10KG", price: 1400, unit: "Bags", mqa: 10, sub: "Rice & Grain Varieties" },
      { sku: "AGR006", name: "Export Quality Long Grain Rice 5KG", price: 720, unit: "Bags", mqa: 25, sub: "Rice & Grain Varieties" },
    ],
  },
  "Clothing": {
    icon: "👕", label: "Clothing & Lifestyle Wear",
    products: [
      { sku: "CLO001", name: "100% Virgin Human Hair Weft 20\"", price: 4500, unit: "Pieces", mqa: 5, sub: "Hair Extensions & Styling" },
      { sku: "CLO002", name: "Clip-In Remy Hair Extensions", price: 3200, unit: "Pieces", mqa: 10, sub: "Hair Extensions & Styling" },
      { sku: "CLO003", name: "Tape-In Natural Hair Extensions", price: 2800, unit: "Pieces", mqa: 10, sub: "Hair Extensions & Styling" },
      { sku: "CLO004", name: "Kinky Curly Hair Bundles", price: 3500, unit: "Pieces", mqa: 5, sub: "Hair Extensions & Styling" },
      { sku: "CLO005", name: "Deep Wave Curly Hair Weft", price: 3800, unit: "Pieces", mqa: 5, sub: "Hair Extensions & Styling" },
      { sku: "CLO006", name: "Jerry Curl Lace Front Wig", price: 5500, unit: "Pieces", mqa: 2, sub: "Hair Extensions & Styling" },
    ],
  },
  "Construction": {
    icon: "🏗️", label: "Construction Materials & Building Solutions",
    products: [
      { sku: "CON001", name: "Pre-Engineered Warehouse Structure", price: 450000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
      { sku: "CON002", name: "Custom PEB Factory Shed", price: 600000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
      { sku: "CON003", name: "Galvanized PEB Steel Frame", price: 250000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
      { sku: "CON004", name: "Heavy Duty Industrial Shed", price: 350000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
      { sku: "CON005", name: "Agricultural Storage Shed", price: 180000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
      { sku: "CON006", name: "Workshop Steel Shed Structure", price: 280000, unit: "Units", mqa: 1, sub: "Prebuilt Structures" },
    ],
  },

  // ── Group 2 (indices 3–5) ──────────────────────────────────────────────────
  "Electrical": {
    icon: "⚡", label: "Electrical & Electronic Appliances",
    products: [
      { sku: "ELE001", name: "Commercial Central AC 5 Ton", price: 85000, unit: "Units", mqa: 1, sub: "Cooling & Air Conditioning" },
      { sku: "ELE002", name: "VRF Central Air Conditioning System", price: 150000, unit: "Units", mqa: 1, sub: "Cooling & Air Conditioning" },
      { sku: "ELE003", name: "Chilled Water Central Cooling Plant", price: 350000, unit: "Units", mqa: 1, sub: "Cooling & Air Conditioning" },
      { sku: "ELE004", name: "1.5 Ton Window AC Unit", price: 28000, unit: "Units", mqa: 5, sub: "Cooling & Air Conditioning" },
      { sku: "ELE005", name: "1.0 Ton Energy Efficient Window AC", price: 24000, unit: "Units", mqa: 10, sub: "Cooling & Air Conditioning" },
      { sku: "ELE006", name: "2.0 Ton Heavy Duty Window AC", price: 35000, unit: "Units", mqa: 5, sub: "Cooling & Air Conditioning" },
    ],
  },
  "Gifting": {
    icon: "🎁", label: "Gifting & Decorative Creations",
    products: [
      { sku: "GIF001", name: "Hand Painted Ceramic Vase", price: 1200, unit: "Pieces", mqa: 10, sub: "Handcrafted Art" },
      { sku: "GIF002", name: "Terracotta Abstract Sculpture", price: 850, unit: "Pieces", mqa: 15, sub: "Handcrafted Art" },
      { sku: "GIF003", name: "Brass Antique Finish Figurine", price: 2500, unit: "Pieces", mqa: 5, sub: "Handcrafted Art" },
      { sku: "GIF004", name: "Carved Wooden Gift Box", price: 450, unit: "Pieces", mqa: 50, sub: "Handcrafted Art" },
      { sku: "GIF005", name: "Velvet Lined Jewelry Storage Box", price: 650, unit: "Pieces", mqa: 25, sub: "Handcrafted Art" },
      { sku: "GIF006", name: "Papier-Mache Craft Box", price: 250, unit: "Pieces", mqa: 100, sub: "Handcrafted Art" },
    ],
  },
  "Health": {
    icon: "💊", label: "Health Care & Wellness",
    products: [
      { sku: "HEA001", name: "N95 Protective Face Mask", price: 85, unit: "Pieces", mqa: 100, sub: "Personal Hygiene" },
      { sku: "HEA002", name: "Cotton Washable Face Cover", price: 45, unit: "Pieces", mqa: 200, sub: "Personal Hygiene" },
      { sku: "HEA003", name: "3-Ply Surgical Face Mask (Box 50)", price: 150, unit: "Boxes", mqa: 50, sub: "Personal Hygiene" },
      { sku: "HEA004", name: "Organic Cotton Sanitary Pads", price: 180, unit: "Packs", mqa: 50, sub: "Personal Hygiene" },
      { sku: "HEA005", name: "Menstrual Cup Medical Grade Silicone", price: 350, unit: "Pieces", mqa: 30, sub: "Personal Hygiene" },
      { sku: "HEA006", name: "Intimate Hygiene Wash 100ml", price: 150, unit: "Bottles", mqa: 50, sub: "Personal Hygiene" },
    ],
  },

  // ── Group 3 (indices 6–9) ──────────────────────────────────────────────────
  "Home": {
    icon: "🏠", label: "Home Essentials & Utility Products",
    products: [
      { sku: "HOM001", name: "Women's Leather Tote Handbag", price: 1500, unit: "Pieces", mqa: 20, sub: "Bags & Carry Solutions" },
      { sku: "HOM002", name: "Designer PU Leather Sling Bag", price: 850, unit: "Pieces", mqa: 30, sub: "Bags & Carry Solutions" },
      { sku: "HOM003", name: "Party Wear Clutch Handbag", price: 650, unit: "Pieces", mqa: 40, sub: "Bags & Carry Solutions" },
      { sku: "HOM004", name: "Men's Genuine Leather Wallet", price: 499, unit: "Pieces", mqa: 50, sub: "Bags & Carry Solutions" },
      { sku: "HOM005", name: "RFID Blocking Card Wallet", price: 350, unit: "Pieces", mqa: 100, sub: "Bags & Carry Solutions" },
      { sku: "HOM006", name: "Slim Bifold Synthetic Wallet", price: 199, unit: "Pieces", mqa: 100, sub: "Bags & Carry Solutions" },
    ],
  },
  "Chemicals": {
    icon: "🧪", label: "Industrial Chemicals & Materials",
    products: [
      { sku: "CHE001", name: "Calcium Carbonate Powder", price: 15, unit: "KG", mqa: 100, sub: "General Chemicals" },
      { sku: "CHE002", name: "Calcium Chloride Flakes", price: 22, unit: "KG", mqa: 100, sub: "General Chemicals" },
      { sku: "CHE003", name: "Calcium Hydroxide Slaked Lime", price: 12, unit: "KG", mqa: 200, sub: "General Chemicals" },
      { sku: "CHE004", name: "Ammonium Sulphate Fertilizer Grade", price: 25, unit: "KG", mqa: 100, sub: "General Chemicals" },
      { sku: "CHE005", name: "Ammonium Chloride Powder", price: 35, unit: "KG", mqa: 50, sub: "General Chemicals" },
      { sku: "CHE006", name: "Ammonium Nitrate Crystals", price: 45, unit: "KG", mqa: 50, sub: "General Chemicals" },
    ],
  },
  "Industrial": {
    icon: "🏭", label: "Industrial Equipment & Utility Supplies",
    products: [
      { sku: "IND001", name: "Hydraulic Hand Pallet Truck 2.5 Ton", price: 15000, unit: "Units", mqa: 2, sub: "Material Handling" },
      { sku: "IND002", name: "Battery Operated Pallet Jack", price: 120000, unit: "Units", mqa: 1, sub: "Material Handling" },
      { sku: "IND003", name: "Heavy Duty Pallet Stacker", price: 85000, unit: "Units", mqa: 1, sub: "Material Handling" },
      { sku: "IND004", name: "Industrial Ribbon Blender", price: 250000, unit: "Units", mqa: 1, sub: "Material Handling" },
      { sku: "IND005", name: "Chemical Liquid Agitator Mixer", price: 45000, unit: "Units", mqa: 1, sub: "Material Handling" },
      { sku: "IND006", name: "Concrete Pan Mixer", price: 180000, unit: "Units", mqa: 1, sub: "Material Handling" },
    ],
  },
  "Tools": {
    icon: "⚙️", label: "Industrial Tools & Equipment",
    products: [
      { sku: "TOO001", name: "Heavy Duty Pallet Lifting Truck", price: 16000, unit: "Units", mqa: 2, sub: "Lifting Solutions" },
      { sku: "TOO002", name: "Electric Ride-On Pallet Truck", price: 150000, unit: "Units", mqa: 1, sub: "Lifting Solutions" },
      { sku: "TOO003", name: "Low Profile Hand Pallet Truck", price: 18000, unit: "Units", mqa: 2, sub: "Lifting Solutions" },
      { sku: "TOO004", name: "Industrial Dough Mixing Unit", price: 85000, unit: "Units", mqa: 1, sub: "Lifting Solutions" },
      { sku: "TOO005", name: "Powder Coating Mixer Machine", price: 120000, unit: "Units", mqa: 1, sub: "Lifting Solutions" },
      { sku: "TOO006", name: "High Speed Homogenizer Mixer", price: 95000, unit: "Units", mqa: 1, sub: "Lifting Solutions" },
    ],
  },
}

// ── Group slicing map ─────────────────────────────────────────────────────────
// Defines which category keys belong to each group (1, 2, 3).
// Edit these arrays if you want to rearrange which cats appear in which section.
const GROUP_KEYS: Record<1 | 2 | 3, string[]> = {
  1: ['Agriculture', 'Clothing', 'Construction'],
  2: ['Electrical', 'Gifting', 'Health'],
  3: ['Home', 'Chemicals', 'Industrial', 'Tools'],
}

// Per-group section labels shown above the title
const GROUP_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Agriculture · Clothing · Construction',
  2: 'Electrical · Gifting · Health',
  3: 'Home · Chemicals · Industrial · Tools',
}

// Per-group section titles
const GROUP_TITLES: Record<1 | 2 | 3, string> = {
  1: 'Farm, Fashion & Construction',
  2: 'Electronics, Gifts & Wellness',
  3: 'Home, Chemicals & Industrial',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`
  return `₹${price}`
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  icon,
}: {
  product: (typeof ALL_CATEGORIES)[string]['products'][0]
  icon: string
}) {
  const [hovered, setHovered] = useState(false)
  const [quoteAdded, setQuoteAdded] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '12px',
        border: `1.5px solid ${hovered ? BRAND : '#e5e7eb'}`,
        bgcolor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
        height: '100%',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* Thumbnail */}
      <Box sx={{
        height: 90,
        bgcolor: BRAND_LIGHT,
        borderBottom: `1px solid ${BRAND_MID}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>{icon}</Typography>

      </Box>

      {/* Body */}
      <Box sx={{ p: '11px 13px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Typography sx={{
          fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35, color: '#0f172a',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: 33, fontFamily: '"DM Sans", sans-serif',
        }}>
          {product.name}
        </Typography>

        <Box sx={{
          fontSize: '0.62rem', fontWeight: 600,
          bgcolor: BRAND_LIGHT, color: BRAND_TEXT,
          borderRadius: '4px', px: '7px', py: '2px',
          display: 'inline-block', alignSelf: 'flex-start',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          {product.sub}
        </Box>

        <Box sx={{ mt: '3px', display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: '"DM Sans", sans-serif' }}>
            {formatPrice(product.price)}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: '"DM Sans", sans-serif' }}>
            / {product.unit}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.68rem', color: '#6b7280', fontFamily: '"DM Sans", sans-serif' }}>
          Min. order:{' '}
          <Box component="strong" sx={{ color: '#374151' }}>
            {product.mqa} {product.unit}
          </Box>
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ p: '7px 12px 11px', display: 'flex', gap: '6px' }}>
        <Box
          component="button"
          onClick={() => { setQuoteAdded(true); setTimeout(() => setQuoteAdded(false), 1800) }}
          sx={{
            flex: 1, py: '7px',
            bgcolor: quoteAdded ? '#22c55e' : BRAND,
            color: '#fff', border: 'none', borderRadius: '7px',
            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            transition: 'background 0.18s',
            '&:hover': { bgcolor: quoteAdded ? '#22c55e' : BRAND_DARK },
          }}
        >
          {quoteAdded ? '✓ Added!' : 'Add to quote'}
        </Box>
        <Box component="button" sx={{
          px: '10px', py: '7px', bgcolor: 'transparent',
          border: `1px solid ${BRAND}`, borderRadius: '7px',
          fontSize: '0.72rem', fontWeight: 700, color: BRAND,
          cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
          '&:hover': { bgcolor: BRAND_LIGHT },
        }}>
          View
        </Box>
      </Box>
    </Box>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ProductsSectionProps {
  /**
   * Which group of categories to display:
   *   1 → Agriculture, Clothing, Construction       (indices 0-2)
   *   2 → Electrical, Gifting, Health               (indices 3-5)
   *   3 → Home, Chemicals, Industrial, Tools        (indices 6-9)
   */
  group: 1 | 2 | 3
}

// ── Main exported component ───────────────────────────────────────────────────
export default function ProductsSection({ group = 1 }: ProductsSectionProps) {
  // Pick only the category keys for this group
  const keys = GROUP_KEYS[group]

  // Build a subset map for just this group's categories
  const groupCategories = Object.fromEntries(
    keys.map((k) => [k, ALL_CATEGORIES[k]])
  )

  const [active, setActive] = useState(keys[0])
  const catData = groupCategories[active]

  // Count total products in this group
  const totalProducts = keys.reduce((sum, k) => sum + ALL_CATEGORIES[k].products.length, 0)

  return (
    <Box sx={{ bgcolor: '#fff', py: 0, fontFamily: '"DM Sans", sans-serif' }}>
      <Container maxWidth="lg">

        {/* ── Section header ── */}
        <Box sx={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          mb: 3, flexWrap: 'wrap', gap: 1.5,
        }}>
          <Box>
            <Typography variant="h4" sx={{
              fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em',
              fontSize: { xs: '1.5rem', md: '1.9rem' }, fontFamily: '"DM Sans", sans-serif',
            }}>
              {GROUP_TITLES[group]}
            </Typography>
          </Box>
          <Typography component="a" href="#" sx={{
            fontSize: '0.82rem', fontWeight: 700, color: BRAND,
            textDecoration: 'none', fontFamily: '"DM Sans", sans-serif',
          }}>
            Browse all products →
          </Typography>
        </Box>

        {/* ── Category tab strip (only this group's categories) ── */}
        <Box sx={{
          display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, mb: 1.5,
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {Object.entries(groupCategories).map(([key, val]) => {
            const isActive = active === key
            return (
              <Box
                key={key}
                component="button"
                onClick={() => setActive(key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  px: 2, py: '8px', borderRadius: '100px', flexShrink: 0,
                  border: `1px solid ${isActive ? BRAND : '#e5e7eb'}`,
                  bgcolor: isActive ? BRAND_LIGHT : '#fafafa',
                  color: isActive ? BRAND_TEXT : '#6b7280',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem', cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'all 0.18s',
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>{val.icon}</span>
                {key}
              </Box>
            )
          })}
        </Box>

        {/* ── Active category info strip ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
          p: '12px 16px', borderRadius: '10px', mb: 2,
          bgcolor: BRAND_LIGHT, border: `1px solid ${BRAND_MID}`,
        }}>
          <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{catData.icon}</Typography>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: BRAND_TEXT, fontFamily: '"DM Sans", sans-serif' }}>
              {catData.label}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: BRAND_TEXT, opacity: 0.7, fontFamily: '"DM Sans", sans-serif' }}>
              Showing - Verified bulk suppliers products
            </Typography>
          </Box>
          <Box component="button" sx={{
            ml: 'auto', px: 2, py: '6px',
            bgcolor: BRAND, color: '#fff', border: 'none',
            borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            '&:hover': { bgcolor: BRAND_DARK },
          }}>
            View all →
          </Box>
        </Box>

        {/* ── Product grid ── */}
        <Grid container spacing={2}>
          {catData.products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={product.sku}>
              <ProductCard product={product} icon={catData.icon} />
            </Grid>
          ))}
        </Grid>


      </Container>
    </Box>
  )
}