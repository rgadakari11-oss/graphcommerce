import { onError } from '@apollo/client/link/error'

const TOKEN_KEY = 'customerToken'

let isRedirecting = false

function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

function isAuthError(graphQLErrors: readonly any[]): boolean {
  return graphQLErrors?.some(
    (err) =>
      err?.message?.toLowerCase().includes('consumer key has expired') ||
      err?.message?.toLowerCase().includes("current customer isn't authorized") ||
      err?.extensions?.category === 'graphql-authorization',
  )
}

export function createAuthErrorLink() {
  return onError(({ graphQLErrors }) => {
    if (!graphQLErrors) return

    if (isAuthError(graphQLErrors) && !isRedirecting) {
      isRedirecting = true

      // Clear token from localStorage
      clearStoredToken()

      // Redirect user to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/account/signin?reason=session_expired'
      }
    }
  })
}