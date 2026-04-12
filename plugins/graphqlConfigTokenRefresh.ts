/**
 * GraphCommerce Plugin: Token Refresh on "Consumer key has expired"
 *
 * Place this file at:
 *   plugins/graphqlConfigTokenRefresh.ts
 *
 * GraphCommerce's plugin system will auto-detect it and inject it into
 * the graphqlConfig function — no manual wiring needed.
 *
 * How it works:
 *  - Intercepts every Apollo error globally
 *  - If the error is "Consumer key has expired" or "isn't authorized",
 *    it calls refreshCustomerToken mutation automatically
 *  - On success: retries the original operation transparently
 *  - On failure: clears token + redirects to /account/signin
 */

import type { graphqlConfig as graphqlConfigType } from '@graphcommerce/graphql'
import type { FunctionPlugin, PluginConfig } from '@graphcommerce/next-config'
import { createAuthErrorLink } from '../lib/graphql/tokenRefreshLink'

export const config: PluginConfig = {
  type: 'function',
  module: '@graphcommerce/graphql',
}

export const graphqlConfig: FunctionPlugin<typeof graphqlConfigType> = (
  prev,
  conf,
) => {
  const results = prev(conf)

  if (typeof window === 'undefined') return results

  return {
    ...results,
    links: [
      createAuthErrorLink(), // ✅ updated here
      ...results.links,
    ],
  }
}