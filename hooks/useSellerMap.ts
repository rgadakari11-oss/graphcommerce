import { useQuery, gql } from '@apollo/client'
import { useMemo } from 'react'

const SELLER_OPTIONS_QUERY = gql`
  query SellerOptions {
    customAttributeMetadata(attributes: ["seller"]) {
      items {
        attribute_code
        options {
          value
          label
        }
      }
    }
  }
`

export function useSellerMap() {
  const { data, loading } = useQuery(SELLER_OPTIONS_QUERY)

  const sellerMap = useMemo(() => {
    const map: Record<number, string> = {}
    if (!loading && data?.customAttributeMetadata?.items?.[0]?.options) {
      data.customAttributeMetadata.items[0].options.forEach((opt: any) => {
        map[Number(opt.value)] = opt.label
      })
      console.log('All seller labels:', map) // now this will log properly
    }
    return map
  }, [data, loading])

  return { sellerMap, loading }
}
