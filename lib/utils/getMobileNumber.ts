export function getMobileNumber(): string | null {
  if (typeof window === 'undefined') return null

  const auth = localStorage.getItem('seller-auth')
  if (!auth) return null

  try {
    const parsed = JSON.parse(auth)

    if (!parsed?.email) return null

    // remove @gmail.com
    return parsed.email.replace('@gmail.com', '')
  } catch (e) {
    return null
  }
}

export function getSellerId(): number | null {
  if (typeof window === 'undefined') return null

  const auth = localStorage.getItem('seller-auth')
  if (!auth) return null

  try {
    const parsed = JSON.parse(auth)

    if (!parsed?.entity_id) return null

    return parsed.entity_id
  } catch (e) {
    return null
  }
}