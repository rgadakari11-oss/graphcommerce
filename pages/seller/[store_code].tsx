// pages/seller/[store_code].tsx
import React, { useRef } from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import { useQuery } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { VendorStoresDocument } from '../../graphql/vendorstore.gql'
import { SellerProductsDocument } from '../../graphql/sellerProducts.gql'

import SellerHeader from '../../components/seller/SellerHeader'
import SellerAbout from '../../components/seller/SellerAbout'
import SellerServices from '../../components/seller/SellerServices'
import SellerReachUs from '../../components/seller/SellerReachUs'
import SellerReviews from '../../components/seller/SellerReviews'
import SellerStats from '../../components/seller/SellerStats'
import SellerSidebar from '../../components/seller/SellerSidebar'
import SellerFooter from '../../components/seller/SellerFooter'

export default function SellerPage() {
  const router = useRouter()
  const { store_code } = router.query

  /* -------------------------------
   * Refs for scroll navigation
   * ------------------------------- */
  const aboutRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const reachUsRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* -------------------------------
   * Fetch Seller by store_code
   * ------------------------------- */
  const { data: storeData, loading: storeLoading, error: storeError } =
    useQuery(VendorStoresDocument, {
      variables: { store_code: String(store_code), status: 1 },
      skip: !store_code,
    })

  const store = storeData?.vendorStores?.[0]

  /* -------------------------------
   * Fetch Seller Products
   * ------------------------------- */
  const {
    data: productData,
    loading: productsLoading,
    error: productError,
  } = useQuery(SellerProductsDocument, {
    variables: { seller: String(store?.customer_id) },
    skip: !store?.customer_id,
  })

  console.log('Products for seller:', productData?.products?.items)

  if (storeLoading) return <Typography>Loading seller...</Typography>
  if (storeError) return <Typography>Error loading seller</Typography>
  if (!store) return <Typography>No seller found</Typography>

  return (
    <>
      {/* SEO */}
      <Head>
        <title>{store.store_name}</title>
        <meta
          name="description"
        />
      </Head>


      <Box sx={{ minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
        {/* ================= HEADER ================= */}
        <SellerHeader
          data={{
            storeName: store.store_name || '',
            gstNumber: store.gst_number || '',
            yearsInBusiness: store.years_in_business || 0,
            trustSeal: store.trust_seal || false,
            phone: store.phone || '',
            email: store.email || '',
            logoUrl: store.logo || '',
            rating: 4,
            ratingCount: 1,
            responseRate: 71,
          }}
        />

        {/* ================= CONTENT ================= */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* ===== LEFT SIDEBAR ===== */}
            <Grid item xs={12} md={3}>
              <SellerSidebar
                onAbout={() => scrollTo(aboutRef)}
                onProducts={() => scrollTo(productsRef)}
                onGallery={() => scrollTo(galleryRef)}
                onReachUs={() => scrollTo(reachUsRef)}
                gstNumber={store.gst_number || ''}
                location={`${store.city}, ${store.state}`}
                phone={store.phone || ''}
                email={store.email || ''}
              />
            </Grid>

            {/* ===== MAIN CONTENT ===== */}
            <Grid item xs={12} md={9}>
              {/* ABOUT / STATS */}
              <div ref={aboutRef}>
                <SellerStats
                  yearsInBusiness={store.years_in_business || 0}
                  clientRating="4.5"
                  completedProjects={store.completed_projects || ''}
                  certifications={store.certifications || ''}
                  awards={store.awards || ''}
                />
                <SellerAbout aboutUs={store.about_us} />
              </div>

              {/* PRODUCTS */}
              <div ref={productsRef}>
                {productsLoading ? (
                  <Typography sx={{ mt: 5 }}>Loading products...</Typography>
                ) : productData?.products?.items?.length ? (
                  <SellerServices products={productData.products.items} />
                ) : (
                  <Typography sx={{ mt: 5 }}>No products found</Typography>
                )}
              </div>

              {/* GALLERY */}
              <div ref={galleryRef}>
                {/* Future gallery/photos/videos */}
              </div>

              {/* REVIEWS */}
              <SellerReviews averageRating={4} totalReviews={93} />

              {/* REACH US */}
              <div ref={reachUsRef}>
                <Box sx={{ mt: 6 }}>
                  <SellerReachUs
                    address={store.address || ''}
                    city={store.city || ''}
                    state={store.state || ''}
                    country={store.country || ''}
                    pincode={store.pincode || ''}
                    gstNumber={store.gst_number || ''}
                  />
                </Box>
              </div>
            </Grid>
          </Grid>
        </Container>

        {/* FOOTER */}
        <SellerFooter />
      </Box>
    </>
  )
}
