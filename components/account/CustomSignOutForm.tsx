import { useApolloClient } from '@graphcommerce/graphql'
import type { FormState } from '@graphcommerce/react-hook-form'
import { useFormGqlMutation } from '@graphcommerce/react-hook-form'
import { useRouter } from 'next/router'
import React from 'react'
import { ApolloCustomerErrorAlert } from '@graphcommerce/magento-customer/components/ApolloCustomerError/ApolloCustomerErrorAlert'
import { SignOutFormDocument } from '@graphcommerce/magento-customer/components/SignOutForm/SignOutForm.gql'
import { signOut } from '@graphcommerce/magento-customer/components/SignOutForm/signOut'

export type CustomSignOutFormProps = {
  button: (props: { formState: FormState<Record<string, unknown>> }) => React.ReactNode
}

const SELLER_AUTH_KEY = 'seller-auth' // 👈 inline key

export function CustomSignOutForm(props: CustomSignOutFormProps) {
  const { button: Button } = props
  const router = useRouter()
  const client = useApolloClient()

  const { handleSubmit, formState, error } = useFormGqlMutation(
    SignOutFormDocument,
    {
      onComplete: async () => {
        // ✅ 1. Clear seller auth from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SELLER_AUTH_KEY)
        }

        // ✅ 2. Clear Magento + Apollo session
        signOut(client)

        // ✅ 3. Redirect to home
        await router.push('/')
      },
    },
    { errorPolicy: 'all' },
  )

  const submitHandler = handleSubmit(() => { })

  return (
    <form onSubmit={submitHandler} noValidate>
      <Button formState={formState} />
      <ApolloCustomerErrorAlert error={error} />
    </form>
  )
}
