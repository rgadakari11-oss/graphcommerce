import type { UseFormClearErrors, UseFormSetError } from '@graphcommerce/ecommerce-ui'
import { PasswordElement } from '@graphcommerce/ecommerce-ui'
import { graphqlErrorByCategory } from '@graphcommerce/magento-graphql'
import { Button, FormActions, FormRow } from '@graphcommerce/next-ui'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/react'
import type { SxProps, Theme } from '@mui/material'
import { Box, FormControl, Link } from '@mui/material'
import { useRef } from 'react'
import { useSignInForm } from '@graphcommerce/magento-customer/hooks/useSignInForm'
import { ApolloCustomerErrorAlert } from '@graphcommerce/magento-customer/components/ApolloCustomerError/ApolloCustomerErrorAlert'


export type CustomSignInFormProps = {
  email?: string
  sx?: SxProps<Theme>
  setError: UseFormSetError<{ email?: string; requestedMode?: 'signin' | 'signup' }>
  clearErrors: UseFormClearErrors<{ email?: string; requestedMode?: 'signin' | 'signup' }>
}

export function CustomSignInForm(props: CustomSignInFormProps) {
  const { email, sx, setError, clearErrors } = props

  // Store password in a ref so we can access it in onBeforeSubmit
  const passwordRef = useRef<string>('')

  const form = useSignInForm({
    email,
    onBeforeSubmit(variables) {
      if (!email) {
        setError('email', { message: t`Please enter a valid email address` })
        return false
      }
      clearErrors()



      // Add password from ref to variables
      const completeVariables = {
        ...variables,
        password: passwordRef.current,
      }

      return completeVariables
    },
  })

  const { handleSubmit, required, formState, error, control, watch } = form
  const [remainingError, authError] = graphqlErrorByCategory({
    category: 'graphql-authentication',
    error,
  })

  // Watch the password field and update ref
  const password = watch('password')
  passwordRef.current = password || ''

  const submitHandler = handleSubmit((formData) => {
  })

  return (
    <Box component='form' onSubmit={submitHandler} noValidate sx={sx}>
      <FormRow sx={{ gridTemplateColumns: 'none' }}>
        <PasswordElement
          variant='outlined'
          error={!!formState.errors.password || !!authError}
          control={control}
          name='password'
          label={<Trans id='Password' />}
          autoFocus={!!email}
          autoComplete='current-password'
          id='current-password'
          required={required.password}
          disabled={formState.isSubmitting}
          helperText={!!formState.errors.password || authError?.message}
          InputProps={{
            endAdornment: (
              <Link href='/account/forgot-password' underline='hover' sx={{ whiteSpace: 'nowrap' }}>
                <Trans id='Forgot password?' />
              </Link>
            ),
          }}
        />
      </FormRow>

      <ApolloCustomerErrorAlert error={remainingError} key='error' />

      <FormActions>
        <FormControl>
          <Button
            type='submit'
            loading={formState.isSubmitting}
            color='primary'
            variant='pill'
            size='large'
          >
            <Trans id='Sign in' />
          </Button>
        </FormControl>
      </FormActions>
    </Box>
  )
}