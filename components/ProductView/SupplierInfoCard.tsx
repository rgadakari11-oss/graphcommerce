import React from 'react'
import { Box, Typography, Tooltip, Chip, Divider, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'

import LocationOnIcon from '@mui/icons-material/LocationOn'
import CallIcon from '@mui/icons-material/Call'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import StoreIcon from '@mui/icons-material/Store'


import { VendorStoresDocument } from '../../graphql/vendorstore.gql'

/* -------------------------------------------------------------------------- */
/*                               SHARED COLORS                                 */
/* -------------------------------------------------------------------------- */
const sellerColors = {
  trusted: {
    bg: '#F1F8F4',
    text: '#1B5E20',
    icon: '#1B5E20',
  },
  topSeller: {
    bg: '#FFF8E1',
    text: '#F57F17',
    icon: '#F9A825',
  },
  fastResponse: {
    bg: '#E3F2FD',
    text: '#0D47A1',
    icon: '#1565C0',
  },
  location: {
    icon: '#1976d2',
  },
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
type Props = {
  sellerId?: number | string | null
}

/* -------------------------------------------------------------------------- */
/*                             SUPPLIER INFO CARD                              */
/* -------------------------------------------------------------------------- */
export function SupplierInfoCard({ sellerId }: Props) {
  const router = useRouter()

  // ✅ Always convert to Int for GraphQL
  const customerId =
    typeof sellerId === 'number'
      ? sellerId
      : sellerId
        ? parseInt(sellerId, 10)
        : undefined

  const { data, loading, error } = useQuery(VendorStoresDocument, {
    variables: {
      customer_id: customerId,
      status: 1,
    },
    skip: !Number.isInteger(customerId),
  })

  if (loading || error || !data?.vendorStores?.length) return null

  const seller = data.vendorStores[0]
  const sellerUrl = seller?.store_code ? `/seller/${seller.store_code}` : '#'

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: '#f9f9f9',        // Slightly darker than white
        border: '1px solid #ddd',           // Subtle professional border
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // Soft shadow for depth

      }}
    >
      {/* ---------------------------- TITLE ---------------------------- */}
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          mb: 1,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Seller Information
      </Typography>

      <Divider sx={{ mb: 1.5 }} />

      {/* -------------------------- STORE NAME -------------------------- */}
      <Typography
        component="a"
        href={sellerUrl}
        sx={{
          fontSize: 15,
          fontWeight: 600,
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          cursor: 'pointer',
          display: 'inline-block',
        }}
      >
        {seller.store_name}
      </Typography>

      {/* ------------------------ TRUST BADGES -------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mt: 0.75,
          flexWrap: 'wrap',
        }}
      >
        {/* Trusted */}
        {seller?.trust_seal && (
          <Tooltip title="Verified & trusted seller" arrow>
            <Box
              component="a"
              href={sellerUrl}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                px: '6px',
                py: '2px',
                borderRadius: '6px',
                backgroundColor: sellerColors.trusted.bg,
                textDecoration: 'none',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: sellerColors.trusted.icon }} />
              <Typography
                sx={{
                  fontSize: '11px !important',
                  fontWeight: 600,
                  color: sellerColors.trusted.text,
                  lineHeight: 1,
                }}
              >
                Trusted
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Top Seller */}
        {seller?.trust_seal && (
          <Tooltip title="Top rated seller" arrow>
            <Box
              component="a"
              href={sellerUrl}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                px: '6px',
                py: '2px',
                borderRadius: '6px',
                backgroundColor: sellerColors.topSeller.bg,
                textDecoration: 'none',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: sellerColors.topSeller.icon }} />
              <Typography
                sx={{
                  fontSize: '11px !important',
                  fontWeight: 600,
                  color: sellerColors.topSeller.text,
                  lineHeight: 1,
                }}
              >
                Top Seller
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* ----------------------------- LOCATION ----------------------------- */}
      {(seller?.area || seller?.city) && (
        <Typography
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '14px !important',
          }}
        >
          <LocationOnIcon sx={{ fontSize: 16, color: sellerColors.location.icon }} />
          {seller.area}
          {seller.city ? `, ${seller.city}` : ''}
        </Typography>
      )}

      {/* ------------------------- TRUST DETAILS -------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mt: 1.25,
        }}
      >
        {seller?.gst_number && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <CheckCircleIcon sx={{ fontSize: 12, color: '#007a6e' }} />
            <Typography sx={{ fontSize: '12px !important' }}>GST</Typography>
          </Box>
        )}

        {seller?.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <CheckCircleIcon sx={{ fontSize: 12, color: '#007a6e' }} />
            <Typography sx={{ fontSize: '12px !important' }}>Email</Typography>
          </Box>
        )}

        {seller?.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <CheckCircleIcon sx={{ fontSize: 12, color: '#007a6e' }} />
            <Typography sx={{ fontSize: '12px !important' }}>Mobile</Typography>
          </Box>
        )}

        {seller?.years_in_business && (
          <Chip
            label={`${seller.years_in_business} Years`}
            size="small"
            sx={{
              height: 18,
              fontSize: '11px !important',
              fontWeight: 600,
              backgroundColor: 'teal',
              color: '#ffffff',
              borderRadius: '6px',
            }}
          />
        )}

        {seller?.trust_seal && (
          <Tooltip title="Responds quickly" arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                px: '6px',
                py: '2px',
                borderRadius: '6px',
                backgroundColor: sellerColors.fastResponse.bg,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: sellerColors.fastResponse.icon }} />
              <Typography
                sx={{
                  fontSize: '11px !important',
                  fontWeight: 600,
                  color: sellerColors.fastResponse.text,
                  lineHeight: 1,
                }}
              >
                Fast Response
              </Typography>
            </Box>
          </Tooltip>
        )}

        {seller?.address && (
          <Box sx={{ mt: 1 }}>
            {/* Address label */}
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: "15px !important",
                fontWeight: 600,
                color: 'black',
                mb: '2px',
              }}
            >
              <LocationOnIcon
                sx={{ fontSize: 14, color: sellerColors.location.icon }}
              />
              Address
            </Typography>

            {/* Address value */}
            <Typography
              sx={{
                fontSize: "14px !important",
                lineHeight: 1.4,
                color: '#000', // black
                pl: '18px',    // aligns text with label, not icon
              }}
            >
              {seller.address}, {seller.area}, {seller.city},{seller.pincode}, {seller.state}
            </Typography>
          </Box>
        )}

        {/* ACTION BUTTONS */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* View Number */}
          <Button
            variant="outlined"
            size="small"
            sx={{
              justifyContent: 'flex-start',
              gap: 1,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <CallIcon sx={{ fontSize: 16, color: '#007a6e' }} />
            View Mobile Number
          </Button>

          {/* Notify Seller */}
          <Button
            variant="outlined"
            size="small"
            sx={{
              justifyContent: 'flex-start',
              gap: 1,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: 16, color: '#F9A825' }} />
            Notify Seller
          </Button>

          {/* Contact Seller */}
          <Button
            component="a"
            href={sellerUrl}
            size="small"
            sx={{
              justifyContent: 'flex-start',
              gap: 1,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'teal', // same green as years chip
              color: '#ffffff',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#C8E6C9',
              },
            }}
          >
            <StoreIcon sx={{ fontSize: 16, color: '#ffffff' }} />

            Contact Seller
          </Button>

        </Box>


      </Box>
    </Box>
  )
}
