import { onError } from '@apollo/client/link/error'

let isRedirecting = false

function clearAllAuthStorage(): void {
  if (typeof window === 'undefined') return

  // GraphCommerce persists the entire Apollo cache under this key
  localStorage.removeItem('apollo-cache-persist')

  // Also clear any other auth-related keys just in case
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (
      key &&
      (key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('customer') ||
        key.toLowerCase().includes('apollo') ||
        key.toLowerCase().includes('cart') ||
        key.toLowerCase().includes('auth'))
    ) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))

  // Clear sessionStorage too
  sessionStorage.clear()
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

      clearAllAuthStorage()

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/account/signin?reason=session_expired'
        }, 100)
      }
    }
  })
}