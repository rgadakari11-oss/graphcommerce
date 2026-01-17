type SellerStore = {
  customer_id: number
  store_name?: string
  area?: string
  city?: string
  phone?: string
  trust_seal?: boolean
}

type Props = ProductListItemFragment & {
  sellerMap?: Record<number, SellerStore>
}

export function MyProductListItem(props: Props) {
  const {
    name,
    price_range,
    small_image,
    seller_id,
    sellerMap,
  } = props

  const seller = seller_id ? sellerMap?.[seller_id] : null

  return (
    <ProductListItemLinkOrDiv href={productLink(props)}>
      {/* IMAGE */}
      <ProductListItemImage
        src={small_image?.url}
        alt={name}
        aspectRatio={[4, 3]}
      />

      {/* CONTENT */}
      <Typography variant="h6">{name}</Typography>
      <ProductListPrice {...price_range.minimum_price} />

      {/* SELLER INFO */}
      {seller && (
        <>
          <Typography fontSize={14} color="text.secondary">
            📍 {seller.area}, {seller.city}
          </Typography>

          <Typography fontSize={14} color="text.secondary">
            🏬 {seller.store_name}
          </Typography>

          {seller.phone && (
            <Typography fontSize={14} color="text.secondary">
              📞 {seller.phone}
            </Typography>
          )}

          {seller.trust_seal && (
            <Typography fontSize={14} color="success.main">
              ✅ Trusted Seller
            </Typography>
          )}

          <Link href={`/seller/${seller.customer_id}`}>
            View Seller
          </Link>
        </>
      )}
    </ProductListItemLinkOrDiv>
  )
}
