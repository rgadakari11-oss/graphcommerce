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
  Button,
  Chip,
  Paper,
  InputBase,
  Avatar,
} from '@mui/material'
import {
  Search as SearchIcon,
  LocalFireDepartment as TrendingIcon,
  ArrowForward as ArrowIcon,
  CheckCircleOutline as CheckIcon,
  Storefront as StoreIcon,
  Inventory2Outlined as ProductIcon,
  Groups as BuyersIcon,
  SupportAgent as SupportIcon,
  VerifiedUser as VerifiedIcon,
  RequestQuote as QuoteIcon,
  LocalShipping as ShippingIcon,
  EmojiEvents as AwardIcon,
  KeyboardArrowRight as ChevronIcon,
} from '@mui/icons-material'
import React, { useState } from 'react'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import ProductsSection from './../components/ProductsSection'

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

// ── All categories from JSON files ───────────────────────────────────────────
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

const TRENDING_CATS = ALL_CATEGORIES.filter((c) => c.trending)

const STATS = [
  { icon: <StoreIcon sx={{ fontSize: 28 }} />, value: '500+', label: 'Verified Suppliers' },
  { icon: <ProductIcon sx={{ fontSize: 28 }} />, value: '50K+', label: 'Products Listed' },
  { icon: <BuyersIcon sx={{ fontSize: 28 }} />, value: '1,200+', label: 'Active Buyers' },
  { icon: <SupportIcon sx={{ fontSize: 28 }} />, value: '24/7', label: 'Trade Support' },
]

const BENEFITS = [
  { icon: <VerifiedIcon sx={{ fontSize: 36 }} />, title: 'Verified Network', desc: 'Every supplier is KYC-verified before listing on our platform.' },
  { icon: <QuoteIcon sx={{ fontSize: 36 }} />, title: 'Instant Quotes', desc: 'Post your requirement and receive competitive bulk quotes within hours.' },
  { icon: <ShippingIcon sx={{ fontSize: 36 }} />, title: 'Logistics Support', desc: 'End-to-end freight solutions — from factory to your doorstep.' },
  { icon: <AwardIcon sx={{ fontSize: 36 }} />, title: 'Quality Assured', desc: 'Product samples, inspection reports and buyer protection on every order.' },
]
// ── Sub-component: Category Card ─────────────────────────────────────────────
function CategoryCard({ cat, variant = 'default',
}: {
  cat: typeof ALL_CATEGORIES[0]
  variant?: 'default' | 'compact'
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? '#f97316' : '#e5e7eb'}`,
        transition: 'all 0.24s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'pointer',
        bgcolor: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Hero image with overlay ── */}
      {variant !== 'compact' && (
        <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', bgcolor: '#f3f4f6' }}>
          <Box
            component="img"
            src={cat.children[0]?.img}
            alt={cat.name}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = cat.image
              e.currentTarget.style.objectFit = 'contain'
              e.currentTarget.style.padding = '20px'
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.32s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,.52) 0%, transparent 55%)',
            }}
          />

          {/* Tag badge */}
          {cat.tag && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: '#1159b4',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '100px',
                px: '9px',
                py: '3px',
                letterSpacing: '0.02em',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {cat.tag}
            </Box>
          )}
        </Box>
      )}

      {/* ── Card body ── */}

      <Box sx={{ p: '14px 16px 10px', flex: 1 }}>
        {/* Category name */}
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#0f172a',
            lineHeight: 1.3,
            mb: 1.5,
          }}
        >
          {cat.icon} {cat.name}
        </Typography>

        {/* Sub-category rows */}
        {variant !== 'compact' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {cat.children.slice(0, 4).map((sub, i, arr) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: '5px',
                  borderBottom: i < arr.length - 1 ? '1px dashed #f1f5f9' : 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  '&:hover': { color: '#f97316', pl: 0.5 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'inherit',
                    fontFamily: '"DM Sans", sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  {sub.name}
                </Typography>
                <ChevronIcon sx={{ fontSize: 14, opacity: 0.45, flexShrink: 0, ml: 0.5 }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>


      {/* ── Card footer ── */}
      {variant !== 'compact' && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: '"DM Sans", sans-serif' }}>
            {cat.children.length} sub-categories
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f97316',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Explore <ChevronIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function IndexPage() {
  const [searchVal, setSearchVal] = useState('')

  return (
    <>
      <PageMeta
        title="QTYBID — India's B2B Marketplace | Connect. Trade. Grow."
        metaDescription="Connect with verified suppliers across 14 categories. Post requirements, get quotes, and grow your business on QTYBID."
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 55%, #14527a 100%)',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 6, md: 9 },
          pb: { xs: 5, md: 7 },
        }}
      >
        {/* Decorative circles */}
        {[
          { size: 500, top: -180, right: -120, opacity: 0.06 },
          { size: 300, top: 40, right: 220, opacity: 0.04 },
          { size: 200, bottom: -60, left: -60, opacity: 0.05 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: c.size,
              height: c.size,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,.3)',
              top: c.top,
              right: c.right,
              bottom: c.bottom,
              left: c.left,
              opacity: c.opacity,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              {/* Eyebrow */}
              <Chip
                label="🇮🇳  Made in India · For Indian Businesses"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.9)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  mb: 2.5,
                  border: '1px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(4px)',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3.2rem' },
                  color: '#fff',
                  lineHeight: 1.15,
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                India's Emerging{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  B2B Marketplace
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,.75)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4,
                  maxWidth: 560,
                  lineHeight: 1.65,
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                Connect with verified suppliers across 14 industries. Post requirements, receive
                competitive bulk quotes, and grow your procurement network.
              </Typography>

              {/* Search bar */}
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,.25)',
                  maxWidth: 580,
                  mb: 3,
                }}
              >
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search products, categories, suppliers…"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  sx={{
                    flex: 1,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.95rem',
                    '& input': { py: 1.6 },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 0,
                    px: 3,
                    background: 'linear-gradient(90deg, #f97316, #ea580c)',
                    textTransform: 'none',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
                  }}
                >
                  Search
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Steel Pipes', 'LED Lights', 'Rice (Basmati)', 'Solar Panels', 'PPE Kits'].map(
                  (q) => (
                    <Chip
                      key={q}
                      label={q}
                      size="small"
                      onClick={() => setSearchVal(q)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,.1)',
                        color: 'rgba(255,255,255,.85)',
                        border: '1px solid rgba(255,255,255,.2)',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255,255,255,.18)' },
                      }}
                    />
                  ),
                )}
              </Box>
            </Grid>

            {/* Stats card */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.12)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '1rem',
                      mb: 0.5,
                    }}
                  >
                    🚀 Platform at a Glance
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,.5)', fontSize: '0.8rem' }}>
                    Growing every day
                  </Typography>
                </Box>
                <Grid container>
                  {STATS.map((s, i) => (
                    <Grid item xs={6} key={i}>
                      <Box
                        sx={{
                          px: 3,
                          py: 2.5,
                          borderTop: i >= 2 ? '1px solid rgba(255,255,255,.08)' : 'none',
                          borderLeft: i % 2 === 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
                        }}
                      >
                        <Box sx={{ color: '#fbbf24', mb: 0.5 }}>{s.icon}</Box>
                        <Typography
                          sx={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontWeight: 800,
                            fontSize: '1.6rem',
                            color: '#fff',
                            lineHeight: 1,
                          }}
                        >
                          {s.value}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '0.8rem', mt: 0.3 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ px: 3, pb: 2.5, pt: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowIcon />}
                    sx={{
                      background: 'linear-gradient(90deg, #f97316, #ea580c)',
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      py: 1.2,
                      '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
                    }}
                  >
                    Register as Supplier — Free
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── TRUST BAR ──────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f97316', py: 1.5 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 5 },
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[
              '✅ Zero Commission on First 100 Orders',
              '🔒 KYC-Verified Suppliers',
              '💬 24/7 Trade Desk',
              '🆓 Free Registration',
            ].map((t) => (
              <Typography
                key={t}
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: { xs: '0.78rem', md: '0.88rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── TRENDING CATEGORIES ─────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fafafa', py: { xs: 2, md: 2 } }}>
        <Container maxWidth="lg">

          {/* Section header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              mb: 3,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <TrendingIcon sx={{ color: '#1159b4', fontSize: 20 }} />
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 800,
                    color: '#1159b4',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Trending Now
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1.5rem', md: '1.9rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Most Active Categories
              </Typography>
            </Box>

            {/* View All button — always visible */}
            <Button
              variant="contained"
              endIcon={<ArrowIcon />}
              sx={{
                background: '#f8f9fa',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '9px',
                px: 2.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': { background: '#f8f9fa', boxShadow: 'none' },
              }}
            >
              View All Categories
            </Button>
          </Box>

          {/* Only show first 4 trending categories */}
          <Grid container spacing={2.5}>
            {TRENDING_CATS.slice(0, 4).map((cat) => (
              <Grid item xs={12} sm={6} md={3} key={cat.id}>
                <CategoryCard cat={cat} />
              </Grid>
            ))}
          </Grid>

        </Container>
      </Box>
      <ProductsSection group={1} />

      {/* ── Bottom CTA ── */}
      <Box sx={{
        mt: 3, mb: 3, p: '18px 22px', borderRadius: '12px',
        background: 'linear-gradient(90deg, #0c1e3c, #1a3a6b)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: '"DM Sans", sans-serif' }}>
            Can't find what you need?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '0.8rem', mt: 0.3, fontFamily: '"DM Sans", sans-serif' }}>
            Post a requirement and receive bulk quotes from 500+ verified suppliers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box component="button" sx={{
            px: 2.5, py: '9px', bgcolor: '#f97316', color: '#fff', border: 'none',
            borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            '&:hover': { bgcolor: '#c2410c' },
          }}>
            Post requirement
          </Box>
          <Box component="button" sx={{
            px: 2.5, py: '9px', bgcolor: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,.3)', borderRadius: '9px',
            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
          }}>
            Browse all
          </Box>
        </Box>
      </Box>
      <ProductsSection group={2} />

      {/* ── ALL CATEGORIES ──────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                color: '#1159b4',
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 0.5,
              }}
            >
              Browse by Industry
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1.5rem', md: '1.9rem' },
                letterSpacing: '-0.02em',
              }}
            >
              All Product Categories
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {ALL_CATEGORIES.map((cat) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                <CategoryCard cat={cat} variant="compact" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── WHY QTYBID ──────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 800,
                color: '#0f172a',
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Why Thousands Choose QTYBID
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '1.05rem',
                maxWidth: 480,
                mx: 'auto',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Built specifically for India's bulk procurement ecosystem
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {BENEFITS.map((b, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '16px',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      boxShadow: '0 12px 32px rgba(29,78,216,.1)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ color: '#1d4ed8', mb: 2 }}>{b.icon}</Box>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#0f172a',
                      mb: 1,
                    }}
                  >
                    {b.title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {b.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── EARLY OFFER BANNER ──────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(118deg, #0c1e3c 0%, #1a3a6b 100%)',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="🎉 Limited Time — Early Member Offer"
            sx={{
              bgcolor: '#f97316',
              color: '#fff',
              fontWeight: 700,
              mb: 3,
              fontSize: '0.82rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 800,
              color: '#fff',
              mb: 2,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}
          >
            Ready to Grow Your Business?
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,.7)',
              mb: 4,
              fontSize: '1.05rem',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Join QTYBID and get premium features free for 6 months
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #f97316, #ea580c)',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                '&:hover': { background: 'linear-gradient(90deg, #ea580c, #c2410c)' },
              }}
            >
              Get Started for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,.4)',
                borderWidth: 2,
                color: '#fff',
                textTransform: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                borderRadius: '12px',
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: '#fff',
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,.08)',
                },
              }}
            >
              Post a Requirement
            </Button>
          </Box>
          <Box
            sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {['Free Registration', 'No Hidden Fees', '24/7 Support', 'Zero Commission on 1st 100 Orders'].map(
              (t) => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,.8)',
                      fontSize: '0.88rem',
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    {t}
                  </Typography>
                </Box>
              ),
            )}
          </Box>
        </Container>
      </Box>
    </>
  )
}

IndexPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default IndexPage

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