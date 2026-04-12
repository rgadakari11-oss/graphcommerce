import { useQuery, gql } from '@apollo/client'
import { useMemo } from 'react'

const SELLER_BY_ID_QUERY = gql`
  query SellerById($customer_id: Int!) {
    vendorStores(customer_id: $customer_id) {
      customer_id
      store_name
      store_code
      years_in_business
      area
      city
      phone
      trust_seal
    }
  }
`

export function useProductSeller(sellerId?: number | null) {
  const { data, loading, error } = useQuery(SELLER_BY_ID_QUERY, {
    variables: { customer_id: Number(sellerId) },
    skip: !sellerId,
  })

  const seller = useMemo(() => {
    if (!data?.vendorStores?.length) return null
    return data.vendorStores[0] // ✅ THIS WAS MISSING
  }, [data])

  return { seller, loading, error }
}
