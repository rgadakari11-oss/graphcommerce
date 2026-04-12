import { useMutation } from '@apollo/client'
import { LogSellerActionDocument } from '../graphql/customeraction/logSellerAction.gql'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SellerActionType = 'SUBMIT_REQUIREMENT' | 'NOTIFY_SELLER' | 'VIEW_CONTACT' | 'GET_LATEST_PRICE'

export interface SellerActionInput {
  product_id: number
  seller_id: number
  action_type: SellerActionType
  quantity?: number
  unit?: string
  customer_name?: string
  phone_number?: string
}

export interface SellerActionResult {
  logSellerAction: {
    success: boolean
    message: string
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Generic hook to log a seller action (SUBMIT_REQUIREMENT, NOTIFY_SELLER, etc.)
 *
 * Usage:
 *   const { submit, loading, error, data } = useSellerAction()
 *   await submit({ product_id: 1, seller_id: 2, action_type: 'NOTIFY_SELLER' })
 */
export function useSellerAction() {
  const [mutate, { loading, error, data }] = useMutation<SellerActionResult>(LogSellerActionDocument)

  const submit = async (input: SellerActionInput) => {
    const result = await mutate({ variables: input })
    return result.data?.logSellerAction
  }

  return { submit, loading, error, data }
}