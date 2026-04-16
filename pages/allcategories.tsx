import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import { PageMeta, StoreConfigDocument } from '@graphcommerce/magento-store'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import {
  Box,
  Container,
  Grid,
  Typography,
  InputBase,
  Chip,
} from '@mui/material'
import {
  Search as SearchIcon,
  KeyboardArrowRight as ChevronIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material'
import React, { useState, useMemo } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ── All Categories Data ────────────────────────────────────────────────────────
const ALL_CATEGORIES = [
  {
    id: 'agriculture',
    name: 'Agriculture Produce & Farming Supplies',
    icon: '🌾',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/agriculture.svg',
    trending: true,
    tag: 'Trending',
    color: '#16a34a',
    bg: '#f0fdf4',
    supplierCount: 480,
    children: [
      { name: 'Rice & Grain Varieties', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Rice-781.jpg' },
      { name: 'Tea & Herbal Beverage Products', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Tea-27.jpg' },
      { name: 'Irrigation & Water Management', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Irrigation-Systems-773.jpg' },
      { name: 'Organic Vegetables & Fresh Produce', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Organic-Vegetables-1524.jpg' },
      { name: 'Pulses & Lentil Products', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pulses-780.jpg' },
      { name: 'Tractor & Farm Equipment Parts', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Tractor-Parts-786.jpg' },
    ],
  },
  {
    id: 'construction',
    name: 'Construction Materials & Building Solutions',
    icon: '🏗️',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/construction-real-estate.svg',
    trending: true,
    tag: 'Top Seller',
    color: '#b45309',
    bg: '#fffbeb',
    supplierCount: 620,
    children: [
      { name: 'Prebuilt & Modular Buildings', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Prefabricated-Portable-Buildings-1189.jpg' },
      { name: 'Flooring & Wall Tile Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Tiles-249.jpg' },
      { name: 'Portable Cabins & Site Offices', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Portable-Cabins-2261.jpg' },
      { name: 'Bathroom Fixtures & Fittings', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Bathroom-Toilet-Accessories-Fittings-248.jpg' },
      { name: 'Sanitary Fixtures & Plumbing', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Sanitaryware-1226.jpg' },
      { name: 'Doors, Windows & Hardware', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Doors-Windows-Accessories-Fittings-1323.jpg' },
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical & Electronic Appliances',
    icon: '⚡',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/electronics-electrical-supplies.svg',
    trending: true,
    tag: 'Hot',
    color: '#d97706',
    bg: '#fff7ed',
    supplierCount: 390,
    children: [
      { name: 'Cooling & Air Conditioning', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Air-Conditioner-289.jpg' },
      { name: 'Voltage Control & Stabilizers', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Voltage-Stabilizers-361.jpg' },
      { name: 'Air Cooling & Ventilation', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Air-Cooler-1317.jpg' },
      { name: 'Refrigeration & Freezing', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Refrigerator-Freezer-309.jpg' },
      { name: 'Solar Energy Systems', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Solar-Products-Equipment-380.jpg' },
      { name: 'LED Lighting & Illumination', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/LED-Products-1661.jpg' },
    ],
  },
  {
    id: 'machinery',
    name: 'Machinery & Equipment',
    icon: '⚙️',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/machinery.svg',
    trending: true,
    tag: 'New',
    color: '#1d4ed8',
    bg: '#eff6ff',
    supplierCount: 540,
    children: [
      { name: 'Packaging & Sealing Machines', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Packaging-Machine-1084.jpg' },
      { name: 'Construction Machinery', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Construction-Machinery-258.jpg' },
      { name: 'Cutting & Shaping Machines', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Cutting-Machine-1621.jpg' },
      { name: 'Food Processing Equipment', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Food-Processing-Machinery-409.jpg' },
      { name: 'General Industrial Machines', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Industrial-Machinery-Parts-1014.jpg' },
      { name: 'Agricultural Machinery', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Agricultural-Machines-Tools-11.jpg' },
    ],
  },
  {
    id: 'metals',
    name: 'Metals, Minerals & Raw Materials',
    icon: '🔩',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/mineral-metals.svg',
    trending: false,
    tag: '',
    color: '#4b5563',
    bg: '#f9fafb',
    supplierCount: 310,
    children: [
      { name: 'Aluminum Materials & Components', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Aluminum-Aluminum-Products-1719.jpg' },
      { name: 'Copper Materials & Products', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Copper-Products-1056.jpg' },
      { name: 'Metal Forms, Alloys & Powders', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Metal-Products-Powder-1064.jpg' },
      { name: 'Industrial Minerals & Refractory', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Minerals-Refractories-1065.jpg' },
      { name: 'Steel & Stainless Steel', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Steel-Stainless-Steel-Products-Components-1194.jpg' },
      { name: 'Iron Materials & Structural Steel', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Iron-Steel-539.jpg' },
    ],
  },
  {
    id: 'medical',
    name: 'Medical Equipment & Healthcare Supplies',
    icon: '🏥',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/hospital-medical-supplies.svg',
    trending: true,
    tag: 'In Demand',
    color: '#0891b2',
    bg: '#ecfeff',
    supplierCount: 270,
    children: [
      { name: 'Protective Medical Gloves', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Disposable-Gloves-2342.jpg' },
      { name: 'Patient Care Beds & Support', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Hospital-Beds-2344.jpg' },
      { name: 'Clinical Equipment & Monitoring', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Medical-Equipment-462.jpg' },
      { name: 'Diagnostic & Hospital Supplies', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Medical-Diagnostic-Hospital-Supplies-464.jpg' },
      { name: 'Oxygen & Pulse Monitoring', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pulse-Oximeters-2356.jpg' },
      { name: 'Wound Care & Disposables', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Surgical-Dressings-Disposable-941.jpg' },
    ],
  },
  {
    id: 'packaging',
    name: 'Packaging Materials & Paper Products',
    icon: '📦',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/packaging-paper.svg',
    trending: false,
    tag: '',
    color: '#7c3aed',
    bg: '#f5f3ff',
    supplierCount: 220,
    children: [
      { name: 'Adhesive & Sealing Tapes', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Adhesive-Tapes-1091.jpg' },
      { name: 'Packaging Bottles & Containers', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Bottles-1224.jpg' },
      { name: 'Packaging Boxes & Cartons', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Packaging-Boxes-1077.jpg' },
      { name: 'Pallets, Crates & Storage', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pallets-Crates-1231.jpg' },
      { name: 'Paper Bags & Carry Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Paper-Bags-1079.jpg' },
      { name: 'Flexible Packaging & Plastics', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Plastic-Packaging-Materials-1489.jpg' },
    ],
  },
  {
    id: 'piping',
    name: 'Piping Systems & Fluid Transfer',
    icon: '🔧',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/pipes-tubes-fittings.svg',
    trending: false,
    tag: '',
    color: '#0369a1',
    bg: '#f0f9ff',
    supplierCount: 185,
    children: [
      { name: 'Pipes & Connection Fittings', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pipes-Pipe-Fittings-269.jpg' },
      { name: 'Tubes & Precision Fittings', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Tubes-Tube-Fittings-1050.jpg' },
      { name: 'Brass Pipes & Tube Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Brass-Pipes-Tubes-2321.jpg' },
      { name: 'Flange Systems & Mounting', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Flanges-1664.jpg' },
      { name: 'Polymer Pipes & Flexible Tubing', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/PVC-Pipes-1033.jpg' },
      { name: 'Rotary Joints & Flow Couplings', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Rotary-Unions-Joints-2478.jpg' },
    ],
  },
  {
    id: 'health',
    name: 'Health Care & Wellness',
    icon: '💊',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/health-beauty.svg',
    trending: true,
    tag: 'Popular',
    color: '#dc2626',
    bg: '#fff1f2',
    supplierCount: 430,
    children: [
      { name: 'Daily Personal Hygiene', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Personal-Care-Products-466.jpg' },
      { name: 'Health Supplements & Medicines', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Common-Medicines-Drugs-455.jpg' },
      { name: 'Handwash & Bath Care', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Soap-Hand-Wash-195.jpg' },
      { name: 'Beauty & Skin Care Essentials', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Cosmetics-191.jpg' },
      { name: 'Herbal & Natural Wellness', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Ayurvedic-Medicines-Products-925.jpg' },
      { name: 'Pain Relief & Recovery', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pain-Relief-Drugs-Medicines-1546.jpg' },
    ],
  },
  {
    id: 'chemicals',
    name: 'Industrial Chemicals & Materials',
    icon: '🧪',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/chemicals.svg',
    trending: false,
    tag: '',
    color: '#059669',
    bg: '#ecfdf5',
    supplierCount: 260,
    children: [
      { name: 'General Chemical Compounds', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Chemical-Supplies-830.jpg' },
      { name: 'Agricultural Nutrients & Fertilizers', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Fertilizers-12.jpg' },
      { name: 'Process & Industrial Chemicals', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Industrial-Chemicals-839.jpg' },
      { name: 'Coatings, Paints & Treatments', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Paint-Allied-Products-222.jpg' },
      { name: 'Rubber Materials & Components', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Rubber-Rubber-Products-227.jpg' },
      { name: 'Colorants & Dyeing Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Dyes-1420.jpg' },
    ],
  },
  {
    id: 'industrial_equip',
    name: 'Industrial Equipment & Utility Supplies',
    icon: '🏭',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/industrial-supplies.svg',
    trending: false,
    tag: '',
    color: '#374151',
    bg: '#f3f4f6',
    supplierCount: 340,
    children: [
      { name: 'Material Handling & Lifting', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Material-Handling-Equipment-524.jpg' },
      { name: 'Conveyor Systems & Belts', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Conveyor-Conveyor-Industrial-Belts-512.jpg' },
      { name: 'Hydraulic Systems & Power', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Hydraulic-Products-Equipment-1011.jpg' },
      { name: 'Laboratory & Testing Instruments', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Laboratory-Glassware-Equipment-1245.jpg' },
      { name: 'Storage & Warehouse Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Storage-Systems-1048.jpg' },
      { name: 'Flow Control Valves', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Valves-532.jpg' },
    ],
  },
  {
    id: 'gifting',
    name: 'Gifting & Decorative Creations',
    icon: '🎁',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/gifts-crafts.svg',
    trending: false,
    tag: '',
    color: '#be185d',
    bg: '#fdf2f8',
    supplierCount: 195,
    children: [
      { name: 'Handcrafted Art & Creative Items', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Handicrafts-916.jpg' },
      { name: 'Home Décor & Styling Items', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Decorative-Items-1300.jpg' },
      { name: 'Fragrance & Incense Products', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Incense-Agarbatti-437.jpg' },
      { name: 'Spiritual Décor & Devotional', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Religious-Crafts-448.jpg' },
      { name: 'Timepieces & Decorative Clocks', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Watches-Clocks-486.jpg' },
      { name: 'Ritual & Pooja Essentials', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Pooja-Articles-Items-2555.jpg' },
    ],
  },
  {
    id: 'home',
    name: 'Home Essentials & Utility Products',
    icon: '🏠',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/home-supplies.svg',
    trending: false,
    tag: '',
    color: '#0f766e',
    bg: '#f0fdfa',
    supplierCount: 290,
    children: [
      { name: 'Bags, Wallets & Carry Solutions', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Bags-Cases-1212.jpg' },
      { name: 'Single-Use & Disposable Items', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Disposable-Products-1385.jpg' },
      { name: 'Cleaning & Household Utility', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Housekeeping-Products-953.jpg' },
      { name: 'Eco-Friendly Jute Carry Bags', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Jute-Bags-1564.jpg' },
      { name: 'Kitchen Equipment & Storage', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Kitchen-Canteen-Accessories-Equipment-1241.jpg' },
      { name: 'Kitchen Tools & Dining Essentials', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Kitchenware-497.jpg' },
    ],
  },
  {
    id: 'clothing',
    name: 'Clothing & Lifestyle Wear',
    icon: '👕',
    image: 'https://tiimg.tistatic.com/new_website1/ti-revamp/icons/apparel-fashion.svg',
    trending: true,
    tag: 'Seasonal',
    color: '#6d28d9',
    bg: '#f5f3ff',
    supplierCount: 510,
    children: [
      { name: 'Hair Extensions & Styling', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Human-Hair-Accessories-772.jpg' },
      { name: 'Casual & Everyday T-Shirts', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/T-Shirts-61.jpg' },
      { name: 'Ethnic Tunics & Kurta Styles', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Kurtis-2304.jpg' },
      { name: 'Denim Wear & Jeans Collection', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Jeans-42.jpg' },
      { name: 'Traditional Saree Collection', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Sarees-800.jpg' },
      { name: 'Athletic & Performance Footwear', img: 'https://tiimg.tistatic.com/categoryimg/v1/1/Sport-Shoes-1454.jpg' },
    ],
  },
]

const FILTER_TABS = ['All Industries', 'Trending', 'Manufacturing', 'Consumer', 'Infrastructure']

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, index }: { cat: typeof ALL_CATEGORIES[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [expandedSub, setExpandedSub] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setExpandedSub(false) }}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? cat.color : '#e8ecf0'}`,
        bgcolor: '#fff',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered
          ? `0 16px 48px ${cat.color}22`
          : '0 1px 4px rgba(0,0,0,0.06)',
        animationDelay: `${index * 40}ms`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero image strip */}
      <Box sx={{ position: 'relative', height: 140, overflow: 'hidden', bgcolor: cat.bg }}>
        {/* Subcategory image mosaic — 2×2 grid */}
        <Grid container sx={{ height: '100%' }}>
          {cat.children.slice(0, 4).map((child, i) => (
            <Grid item xs={6} key={i} sx={{ height: '50%', position: 'relative', overflow: 'hidden' }}>
              <Box
                component="img"
                src={child.img}
                alt={child.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none'
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.08)' : 'scale(1)',
                  transitionDelay: `${i * 30}ms`,
                }}
              />
              {/* Subtle grid overlay lines */}
              <Box sx={{
                position: 'absolute', inset: 0,
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.5)' : 'none',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.5)' : 'none',
              }} />
            </Grid>
          ))}
        </Grid>

        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(160deg, ${cat.color}11 0%, rgba(0,0,0,0.38) 100%)`,
        }} />

        {/* Category icon + badge */}
        <Box sx={{
          position: 'absolute', top: 10, left: 12,
          display: 'flex', alignItems: 'center', gap: 0.8,
        }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {cat.icon}
          </Box>
          {cat.tag && (
            <Box sx={{
              bgcolor: cat.color,
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 800,
              borderRadius: '100px',
              px: '8px', py: '3px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif',
              display: 'flex', alignItems: 'center', gap: 0.4,
            }}>
              {cat.trending && <TrendingIcon sx={{ fontSize: 10 }} />}
              {cat.tag}
            </Box>
          )}
        </Box>

      </Box>

      {/* Card body */}
      <Box sx={{ p: '14px 16px 0', flex: 1 }}>
        <Typography sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          fontSize: '0.88rem',
          color: '#0f172a',
          lineHeight: 1.3,
          mb: 1.5,
        }}>
          {cat.name}
        </Typography>

        {/* Sub-category list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {cat.children.slice(0, expandedSub ? 6 : 3).map((sub, i, arr) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: '5px',
                borderBottom: i < arr.length - 1 ? '1px dashed #f1f5f9' : 'none',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.15s',
                '&:hover': { color: cat.color, pl: 0.5 },
              }}
            >
              <Typography sx={{
                fontSize: '0.73rem',
                fontWeight: 500,
                color: 'inherit',
                fontFamily: '"DM Sans", sans-serif',
                lineHeight: 1.3,
              }}>
                {sub.name}
              </Typography>
              <ChevronIcon sx={{ fontSize: 13, opacity: 0.4, flexShrink: 0, ml: 0.5 }} />
            </Box>
          ))}
        </Box>

        {cat.children.length > 3 && (
          <Box
            onClick={(e) => { e.stopPropagation(); setExpandedSub(!expandedSub) }}
            sx={{
              mt: 0.5, pb: 0.5,
              fontSize: '0.7rem',
              fontWeight: 700,
              color: cat.color,
              cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
              '&:hover': { opacity: 0.75 },
            }}
          >
            {expandedSub ? '▲ Show less' : `+${cat.children.length - 3} more`}
          </Box>
        )}
      </Box>

      {/* Footer CTA */}
      <Box sx={{
        mx: 2, mb: 2, mt: 1.5,
        p: '9px 14px',
        borderRadius: '10px',
        bgcolor: hovered ? cat.color : cat.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}>
        <Typography sx={{
          fontSize: '0.73rem',
          fontWeight: 700,
          color: hovered ? '#fff' : cat.color,
          fontFamily: '"DM Sans", sans-serif',
          transition: 'color 0.25s',
        }}>
          Browse {cat.children.length} sub-categories
        </Typography>
        <ChevronIcon sx={{
          fontSize: 16,
          color: hovered ? '#fff' : cat.color,
          transition: 'all 0.25s',
          transform: hovered ? 'translateX(3px)' : 'none',
        }} />
      </Box>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Industries')

  const trendingIds = new Set(ALL_CATEGORIES.filter((c) => c.trending).map((c) => c.id))
  const manufacturingIds = new Set(['machinery', 'metals', 'chemicals', 'industrial_equip', 'piping'])
  const consumerIds = new Set(['clothing', 'health', 'home', 'gifting', 'agriculture'])
  const infrastructureIds = new Set(['construction', 'electrical', 'medical', 'packaging', 'piping'])

  const filtered = useMemo(() => {
    let list = ALL_CATEGORIES
    if (activeFilter === 'Trending') list = list.filter((c) => trendingIds.has(c.id))
    else if (activeFilter === 'Manufacturing') list = list.filter((c) => manufacturingIds.has(c.id))
    else if (activeFilter === 'Consumer') list = list.filter((c) => consumerIds.has(c.id))
    else if (activeFilter === 'Infrastructure') list = list.filter((c) => infrastructureIds.has(c.id))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.children.some((ch) => ch.name.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeFilter, search])

  const totalSuppliers = ALL_CATEGORIES.reduce((s, c) => s + c.supplierCount, 0)
  const totalSubcats = ALL_CATEGORIES.reduce((s, c) => s + c.children.length, 0)

  return (
    <>
      <PageMeta
        title="All Categories — QTYBID B2B Marketplace"
        metaDescription="Browse all 14 product categories on QTYBID. Connect with verified bulk suppliers across Agriculture, Construction, Electronics, Machinery and more."
      />

      {/* ── PAGE HERO ─────────────────────────────────────────────────────── */}
      <Box sx={{
        background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 58%, #0e527a 100%)',
        pt: { xs: 5, md: 7 },
        pb: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative dot grid */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Glow orbs */}
        {[
          { size: 420, top: -150, right: -80, color: 'rgba(249,115,22,0.12)' },
          { size: 280, bottom: -100, left: 100, color: 'rgba(59,130,246,0.10)' },
        ].map((o, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: o.size, height: o.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            top: o.top, right: o.right, bottom: o.bottom, left: o.left,
            pointerEvents: 'none',
          }} />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Typography
              component="a" href="/"
              sx={{
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', fontFamily: '"DM Sans", sans-serif',
                '&:hover': { color: 'rgba(255,255,255,0.8)' },
              }}
            >
              Home
            </Typography>
            <ChevronIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', fontFamily: '"DM Sans", sans-serif' }}>
              All Categories
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.8rem' },
                  color: '#fff',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  mb: 1.5,
                }}
              >
                Browse{' '}
                <Box component="span" sx={{
                  background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  All Industries
                </Box>
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '1rem',
                fontFamily: '"DM Sans", sans-serif',
                lineHeight: 1.6,
                maxWidth: 480,
                mb: 3,
              }}>
                {ALL_CATEGORIES.length} product categories · {totalSubcats}+ sub-categories ·{' '}
                {totalSuppliers.toLocaleString()}+ verified suppliers
              </Typography>

              {/* Search */}
              <Box sx={{
                display: 'flex',
                bgcolor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,.22)',
                maxWidth: 520,
              }}>
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search categories or sub-categories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    flex: 1,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.92rem',
                    '& input': { py: 1.6 },
                  }}
                />
                {search && (
                  <Box
                    component="button"
                    onClick={() => setSearch('')}
                    sx={{
                      px: 2, bgcolor: 'transparent', border: 'none',
                      color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem',
                      fontFamily: '"DM Sans", sans-serif',
                      '&:hover': { color: '#374151' },
                    }}
                  >
                    ✕ Clear
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Quick-stat cards */}
            <Grid item xs={12} md={5}>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Total Categories', value: ALL_CATEGORIES.length, accent: '#fbbf24' },
                  { label: 'Sub-Categories', value: `${totalSubcats}+`, accent: '#34d399' },
                  { label: 'Verified Suppliers', value: `${totalSuppliers.toLocaleString()}+`, accent: '#60a5fa' },
                  { label: 'Trending Now', value: ALL_CATEGORIES.filter((c) => c.trending).length, accent: '#f97316' },
                ].map((s) => (
                  <Grid item xs={6} key={s.label}>
                    <Box sx={{
                      p: '16px 18px',
                      borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                    }}>
                      <Typography sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 800,
                        fontSize: '1.6rem',
                        color: s.accent,
                        lineHeight: 1,
                        mb: 0.4,
                      }}>
                        {s.value}
                      </Typography>
                      <Typography sx={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontFamily: '"DM Sans", sans-serif',
                      }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f97316', py: 1.2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 5 }, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✅ KYC-Verified Suppliers', '💬 Get Bulk Quotes in 24hrs', '🏆 Quality-Assured Products', '🚚 End-to-End Logistics'].map((t) => (
              <Typography key={t} sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600, color: '#fff',
                fontSize: { xs: '0.76rem', md: '0.86rem' },
                whiteSpace: 'nowrap',
              }}>
                {t}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '60vh', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">

          {/* Filter tabs + result count */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {FILTER_TABS.map((tab) => {
                const active = activeFilter === tab
                return (
                  <Chip
                    key={tab}
                    label={tab}
                    onClick={() => setActiveFilter(tab)}
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.8rem',
                      height: 34,
                      bgcolor: active ? '#1159b4' : '#fff',
                      color: active ? '#fff' : '#475569',
                      border: `1.5px solid ${active ? '#1159b4' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      '&:hover': {
                        bgcolor: active ? '#0e4491' : '#f1f5f9',
                        borderColor: active ? '#0e4491' : '#cbd5e1',
                      },
                    }}
                  />
                )
              })}
            </Box>
            <Typography sx={{
              fontSize: '0.8rem',
              color: '#64748b',
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
              {search ? ` matching "${search}"` : ''}
            </Typography>
          </Box>

          {/* ── Category grid ── */}
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔍</Typography>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700, fontSize: '1.2rem',
                color: '#334155', mb: 1,
              }}>
                No categories found
              </Typography>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                color: '#94a3b8', fontSize: '0.9rem', mb: 3,
              }}>
                Try a different search term or clear your filters
              </Typography>
              <Box
                component="button"
                onClick={() => { setSearch(''); setActiveFilter('All Industries') }}
                sx={{
                  px: 3, py: '10px',
                  bgcolor: '#1159b4', color: '#fff', border: 'none',
                  borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem',
                  fontFamily: '"DM Sans", sans-serif',
                  '&:hover': { bgcolor: '#0e4491' },
                }}
              >
                Clear all filters
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filtered.map((cat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                  <CategoryCard cat={cat} index={index} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* ── Post-requirement CTA ── */}
          <Box sx={{
            mt: 6, p: { xs: '24px', md: '32px 40px' },
            borderRadius: '20px',
            background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute', top: -60, right: -60,
              width: 260, height: 260, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.5rem' },
                color: '#fff', mb: 0.5, letterSpacing: '-0.01em',
              }}>
                Can't find your category?
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                fontFamily: '"DM Sans", sans-serif',
              }}>
                Post a buying requirement — get quotes from 500+ verified suppliers within 24 hours
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <Box component="button" sx={{
                px: 3, py: '11px',
                background: 'linear-gradient(90deg, #f97316, #ea580c)',
                color: '#fff', border: 'none',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                whiteSpace: 'nowrap',
                '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
              }}>
                📋 Post a Requirement
              </Box>
              <Box component="button" sx={{
                px: 3, py: '11px',
                bgcolor: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.06)' },
              }}>
                Register Free →
              </Box>
            </Box>
          </Box>

        </Container>
      </Box>
    </>
  )
}

CategoriesPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default CategoriesPage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })

  return {
    props: {
      ...(await layout).data,
      up: { href: '/', title: i18n._(/* i18n */ 'Home') },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}
