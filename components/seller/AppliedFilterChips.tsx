import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Chip } from '@mui/material'

type FilterChip = {
  code: string
  value: string
}

export function AppliedFilterChips() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [chips, setChips] = useState<FilterChip[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    /**
     * Example URL:
     * /c/paint/q/category_uid/Mw==/shade/38
     */
    const path = router.asPath.split('?')[0]
    const parts = path.split('/').filter(Boolean)

    const qIndex = parts.indexOf('q')
    if (qIndex === -1) {
      setChips([])
      return
    }

    const filterParts = parts.slice(qIndex + 1)

    const parsed: FilterChip[] = []

    for (let i = 0; i < filterParts.length; i += 2) {
      const code = filterParts[i]
      const value = filterParts[i + 1]

      if (!code || !value) continue
      if (code === 'category_uid') continue

      parsed.push({ code, value })
    }

    setChips(parsed)
  }, [router.asPath, mounted])

  if (!mounted || chips.length === 0) return null

  /**
   * Remove filter from URL
   */
  const removeFilter = (code: string) => {
    const [path, query] = router.asPath.split('?')
    const parts = path.split('/').filter(Boolean)

    const qIndex = parts.indexOf('q')
    if (qIndex === -1) return

    const beforeQ = parts.slice(0, qIndex + 1)
    const afterQ = parts.slice(qIndex + 1)

    const nextFilters: string[] = []

    for (let i = 0; i < afterQ.length; i += 2) {
      if (afterQ[i] === code) continue
      nextFilters.push(afterQ[i], afterQ[i + 1])
    }

    const nextPath =
      '/' + [...beforeQ, ...nextFilters].join('/')

    router.replace(
      query ? `${nextPath}?${query}` : nextPath,
      undefined,
      { shallow: true }
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        mt: 1,
      }}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.code}
          label={`${chip.code}: ${chip.value}`}
          onDelete={() => removeFilter(chip.code)}
          size="small"
          sx={{
            fontWeight: 500,
          }}
        />
      ))}
    </Box>
  )
}
