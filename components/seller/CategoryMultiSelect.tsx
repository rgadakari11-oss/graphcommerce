import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import {
  Box,
  Typography,
  Chip,
  InputBase,
  Paper,
  Collapse,
  IconButton,
  CircularProgress,
  Divider,
  ClickAwayListener,
} from '@mui/material'
import {
  Search,
  ExpandMore,
  ExpandLess,
  Close,
  KeyboardArrowDown,
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
} from '@mui/icons-material'

// ─── Types ────────────────────────────────────────────────────────────────────
// These mirror menu?.items?.[0]?.children from LayoutNavigation

export interface MicroCategory {
  uid: string
  name: string
  url_path?: string
  url_key?: string
}

export interface SubCategory {
  uid: string
  name: string
  url_path?: string
  url_key?: string
  children?: MicroCategory[]
}

export interface MainCategory {
  uid: string
  name: string
  url_path?: string
  url_key?: string
  children?: SubCategory[]
}

export interface CategoryMultiSelectProps {
  categories: MainCategory[]
  selectedUids: string[]
  onChange: (uids: string[]) => void
  loading?: boolean
  error?: boolean
  errorMessage?: string
  placeholder?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Collect uid of node + all its descendants */
function collectAllUids(node: MainCategory | SubCategory): string[] {
  const result: string[] = [node.uid]
  for (const child of (node as any).children ?? []) {
    result.push(...collectAllUids(child))
  }
  return result
}

/** Returns 'all' | 'some' | 'none' for checkbox display */
function getCheckState(
  node: MainCategory | SubCategory,
  selectedSet: Set<string>,
): 'all' | 'none' {
  return selectedSet.has(node.uid) ? 'all' : 'none'
}

/** Flat uid → name map for chip display */
function buildNameMap(cats: MainCategory[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const m of cats) {
    map[m.uid] = m.name
    for (const s of m.children ?? []) {
      map[s.uid] = s.name
      for (const mc of s.children ?? []) {
        map[mc.uid] = mc.name
      }
    }
  }
  return map
}

/** Does a node (or any descendant) match the search string? */
function matchesSearch(node: { name: string; children?: any[] }, term: string): boolean {
  if (!term) return true
  if (node.name.toLowerCase().includes(term)) return true
  return (node.children ?? []).some((c: any) => matchesSearch(c, term))
}

// ─── Checkbox Icon ────────────────────────────────────────────────────────────
function CheckIcon({ state, size = 18 }: { state: 'all' | 'some' | 'none'; size?: number }) {
  if (state === 'all') return <CheckBox sx={{ fontSize: size, color: '#3b82f6' }} />
  if (state === 'some') return <IndeterminateCheckBox sx={{ fontSize: size, color: '#3b82f6' }} />
  return <CheckBoxOutlineBlank sx={{ fontSize: size, color: '#d1d5db' }} />
}

// ─── MicroRow ─────────────────────────────────────────────────────────────────
function MicroRow({
  node,
  selectedSet,
  onToggle,
}: {
  node: MicroCategory
  selectedSet: Set<string>
  onToggle: (uid: string) => void
}) {
  const isSelected = selectedSet.has(node.uid)
  return (
    <Box
      onClick={() => onToggle(node.uid)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        pl: '72px',
        pr: 1.5,
        py: '5px',
        cursor: 'pointer',
        bgcolor: isSelected ? '#eff6ff' : 'transparent',
        borderLeft: isSelected ? '3px solid #93c5fd' : '3px solid transparent',
        '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f8fafc' },
        transition: 'all 0.12s',
      }}
    >
      {/* Dashed connector line */}
      <Box
        sx={{
          width: 14,
          height: 0,
          borderBottom: '1.5px dashed #d1d5db',
          mr: '6px',
          flexShrink: 0,
        }}
      />
      <Box sx={{ mr: '6px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <CheckIcon state={isSelected ? 'all' : 'none'} size={15} />
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontSize: '12px',
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? '#1d4ed8' : '#6b7280',
          userSelect: 'none',
          flex: 1,
        }}
      >
        {node.name}
      </Typography>
    </Box>
  )
}

// ─── SubRow ───────────────────────────────────────────────────────────────────
function SubRow({
  node,
  selectedSet,
  expandedSubs,
  searchTerm,
  onToggle,
  onToggleExpand,
}: {
  node: SubCategory
  selectedSet: Set<string>
  expandedSubs: Set<string>
  searchTerm: string
  onToggle: (uid: string) => void
  onToggleExpand: (uid: string) => void
}) {
  const checkState = getCheckState(node, selectedSet)
  const isExpanded = expandedSubs.has(node.uid)
  const microChildren = node.children ?? []
  const hasMicro = microChildren.length > 0

  // When searching, show if any descendant matches
  if (searchTerm && !matchesSearch(node, searchTerm)) return null

  const visibleMicro = searchTerm
    ? microChildren.filter((m) => matchesSearch(m, searchTerm))
    : microChildren

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: '36px',
          pr: 1.5,
          py: '6px',
          cursor: 'pointer',
          bgcolor: checkState !== 'none' ? '#f0f9ff' : 'transparent',
          borderLeft: checkState !== 'none' ? '3px solid #60a5fa' : '3px solid transparent',
          '&:hover': { bgcolor: checkState !== 'none' ? '#dbeafe' : '#f8fafc' },
          transition: 'all 0.12s',
        }}
      >
        {/* Expand toggle for micro level */}
        <Box
          onClick={(e) => { e.stopPropagation(); if (hasMicro) onToggleExpand(node.uid) }}
          sx={{ display: 'flex', alignItems: 'center', mr: '4px', flexShrink: 0, color: '#9ca3af' }}
        >
          {hasMicro
            ? isExpanded
              ? <ExpandLess sx={{ fontSize: 16 }} />
              : <ExpandMore sx={{ fontSize: 16 }} />
            : <Box sx={{ width: 16 }} />}
        </Box>

        <Box
          onClick={() => onToggle(node.uid)}
          sx={{ mr: '6px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          <CheckIcon state={checkState} size={16} />
        </Box>

        <Typography
          onClick={() => onToggle(node.uid)}
          variant="body2"
          sx={{
            fontSize: '12.5px',
            fontWeight: checkState !== 'none' ? 600 : 400,
            color: checkState !== 'none' ? '#1d4ed8' : '#4b5563',
            userSelect: 'none',
            flex: 1,
          }}
        >
          {node.name}
        </Typography>
      </Box>

      {/* ── Micro level (3rd level) ── */}
      <Collapse in={isExpanded || !!searchTerm} timeout="auto" unmountOnExit={!searchTerm}>
        {visibleMicro.map((micro) => (
          <MicroRow
            key={micro.uid}
            node={micro}
            selectedSet={selectedSet}
            onToggle={onToggle}
          />
        ))}
      </Collapse>
    </Box>
  )
}

// ─── MainRow ──────────────────────────────────────────────────────────────────
function MainRow({
  node,
  selectedSet,
  expandedMains,
  expandedSubs,
  searchTerm,
  onToggle,
  onToggleExpandMain,
  onToggleExpandSub,
}: {
  node: MainCategory
  selectedSet: Set<string>
  expandedMains: Set<string>
  expandedSubs: Set<string>
  searchTerm: string
  onToggle: (uid: string) => void
  onToggleExpandMain: (uid: string) => void
  onToggleExpandSub: (uid: string) => void
}) {
  const checkState = getCheckState(node, selectedSet)
  const isExpanded = expandedMains.has(node.uid)
  const subChildren = node.children ?? []
  const hasSub = subChildren.length > 0

  if (searchTerm && !matchesSearch(node, searchTerm)) return null

  const visibleSubs = searchTerm
    ? subChildren.filter((s) => matchesSearch(s, searchTerm))
    : subChildren

  return (
    <Box>
      {/* ── Main row ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: '8px',
          cursor: 'pointer',
          bgcolor: checkState !== 'none' ? '#eff6ff' : 'transparent',
          borderLeft: checkState !== 'none' ? '3px solid #3b82f6' : '3px solid transparent',
          '&:hover': { bgcolor: checkState !== 'none' ? '#dbeafe' : '#f8fafc' },
          transition: 'all 0.12s',
        }}
      >
        <Box
          onClick={(e) => { e.stopPropagation(); if (hasSub) onToggleExpandMain(node.uid) }}
          sx={{ display: 'flex', alignItems: 'center', mr: '4px', flexShrink: 0, color: '#9ca3af' }}
        >
          {hasSub
            ? isExpanded
              ? <ExpandLess sx={{ fontSize: 18 }} />
              : <ExpandMore sx={{ fontSize: 18 }} />
            : <Box sx={{ width: 18 }} />}
        </Box>

        <Box
          onClick={() => onToggle(node.uid)}
          sx={{ mr: '6px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          <CheckIcon state={checkState} size={18} />
        </Box>

        <Typography
          onClick={() => onToggle(node.uid)}
          variant="body2"
          sx={{
            fontSize: '13px',
            fontWeight: checkState !== 'none' ? 700 : 600,
            color: checkState !== 'none' ? '#1d4ed8' : '#1f2937',
            userSelect: 'none',
            flex: 1,
          }}
        >
          {node.name}
        </Typography>
      </Box>

      {/* ── Sub level (2nd level) ── */}
      <Collapse in={isExpanded || !!searchTerm} timeout="auto" unmountOnExit={!searchTerm}>
        {visibleSubs.map((sub) => (
          <SubRow
            key={sub.uid}
            node={sub}
            selectedSet={selectedSet}
            expandedSubs={expandedSubs}
            searchTerm={searchTerm}
            onToggle={onToggle}
            onToggleExpand={onToggleExpandSub}
          />
        ))}
      </Collapse>

      <Divider sx={{ opacity: 0.4 }} />
    </Box>
  )
}

// ─── CategoryMultiSelect ──────────────────────────────────────────────────────

export function CategoryMultiSelect({
  categories,
  selectedUids,
  onChange,
  loading = false,
  error = false,
  errorMessage = 'Please select a category',
  placeholder = 'Click to select categories…',
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMains, setExpandedMains] = useState<Set<string>>(new Set())
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedSet = useMemo(() => new Set(selectedUids), [selectedUids])
  const nameMap = useMemo(() => buildNameMap(categories), [categories])
  const normalised = searchTerm.trim().toLowerCase()

  // Auto-expand parent rows of pre-selected nodes
  useEffect(() => {
    if (!categories.length || !selectedUids.length) return
    const newMains = new Set<string>()
    const newSubs = new Set<string>()
    for (const m of categories) {
      for (const s of m.children ?? []) {
        for (const mc of s.children ?? []) {
          if (selectedUids.includes(mc.uid)) { newMains.add(m.uid); newSubs.add(s.uid) }
        }
        if (selectedUids.includes(s.uid)) newMains.add(m.uid)
      }
    }
    setExpandedMains(newMains)
    setExpandedSubs(newSubs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedUids.join(',')])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 80)
  }, [open])

  // ── Toggle a node (select/deselect it + all descendants) ─────────────────
  const toggleNode = useCallback(
    (uid: string) => {
      const isSelected = selectedSet.has(uid)

      const next = isSelected
        ? selectedUids.filter((u) => u !== uid)
        : [...selectedUids, uid]

      onChange(next)
    },
    [selectedUids, selectedSet, onChange],
  )

  const toggleExpandMain = (uid: string) =>
    setExpandedMains((prev) => { const n = new Set(prev); n.has(uid) ? n.delete(uid) : n.add(uid); return n })

  const toggleExpandSub = (uid: string) =>
    setExpandedSubs((prev) => { const n = new Set(prev); n.has(uid) ? n.delete(uid) : n.add(uid); return n })

  const removeChip = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedUids.filter((u) => u !== uid))
  }

  const clearAll = (e: React.MouseEvent) => { e.stopPropagation(); onChange([]) }

  const visibleCategories = useMemo(
    () => categories.filter((c) => matchesSearch(c, normalised)),
    [categories, normalised],
  )

  // Deduplicate chips: hide a child if its fully-selected parent is already shown
  const chipUids = useMemo(() => {
    const result: string[] = []
    for (const uid of selectedUids) {
      let skip = false
      for (const m of categories) {
        if (m.uid === uid) break
        for (const s of m.children ?? []) {
          if (s.uid === uid) {
            if (collectAllUids(m).every((u) => selectedSet.has(u))) skip = true
            break
          }
          for (const mc of s.children ?? []) {
            if (mc.uid === uid) {
              if (collectAllUids(s).every((u) => selectedSet.has(u))) skip = true
              break
            }
          }
        }
      }
      if (!skip) result.push(uid)
    }
    return result
  }, [selectedUids, selectedSet, categories])

  return (
    <ClickAwayListener onClickAway={() => { setOpen(false); setSearchTerm('') }}>
      <Box sx={{ position: 'relative' }}>
        {/* ── Trigger ── */}
        <Box
          onClick={() => setOpen((v) => !v)}
          sx={{
            minHeight: 42,
            border: `1px solid ${error ? '#ef4444' : open ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '8px',
            px: 1.5,
            py: 0.75,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.6,
            cursor: 'pointer',
            bgcolor: '#fff',
            boxShadow: open ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:hover': { borderColor: open ? '#3b82f6' : '#9ca3af' },
          }}
        >
          {chipUids.length === 0 && (
            <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '13.5px', flex: 1 }}>
              {placeholder}
            </Typography>
          )}

          {chipUids.map((uid) => (
            <Chip
              key={uid}
              label={nameMap[uid] ?? uid}
              size="small"
              onDelete={(e) => removeChip(uid, e as any)}
              deleteIcon={<Close sx={{ fontSize: '13px !important' }} />}
              onClick={(e) => e.stopPropagation()}
              sx={{
                height: 26, fontSize: '12px', fontWeight: 600,
                bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                '& .MuiChip-deleteIcon': { color: '#93c5fd', '&:hover': { color: '#3b82f6' } },
              }}
            />
          ))}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {selectedUids.length > 0 && (
              <Box
                onClick={clearAll}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: '50%', bgcolor: '#e5e7eb',
                  cursor: 'pointer', '&:hover': { bgcolor: '#fecaca' }, transition: 'background 0.12s',
                }}
              >
                <Close sx={{ fontSize: 12, color: '#6b7280' }} />
              </Box>
            )}
            <KeyboardArrowDown sx={{
              fontSize: 20, color: '#9ca3af',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} />
          </Box>
        </Box>

        {error && (
          <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, ml: 1, display: 'block' }}>
            {errorMessage}
          </Typography>
        )}

        {/* ── Dropdown ── */}
        {open && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              zIndex: 1400,
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            {/* Search */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafafa' }}>
              <Search sx={{ fontSize: 17, color: '#9ca3af', mr: 1, flexShrink: 0 }} />
              <InputBase
                inputRef={searchRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories…"
                sx={{ flex: 1, fontSize: '13px' }}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSearchTerm('') }}>
                  <Close sx={{ fontSize: 14, color: '#9ca3af' }} />
                </IconButton>
              )}
            </Box>

            {/* Selection count bar */}
            {selectedUids.length > 0 && (
              <Box sx={{ px: 1.5, py: 0.6, bgcolor: '#f0f9ff', borderBottom: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                  {selectedUids.length} categor{selectedUids.length === 1 ? 'y' : 'ies'} selected
                </Typography>
                <Typography
                  variant="caption"
                  onClick={(e) => { e.stopPropagation(); onChange([]) }}
                  sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Clear all
                </Typography>
              </Box>
            )}

            {/* Tree — 3 levels: Main → Sub → Micro */}
            <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : visibleCategories.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>No categories found</Typography>
                </Box>
              ) : (
                visibleCategories.map((main) => (
                  <MainRow
                    key={main.uid}
                    node={main}
                    selectedSet={selectedSet}
                    expandedMains={expandedMains}
                    expandedSubs={expandedSubs}
                    searchTerm={normalised}
                    onToggle={toggleNode}
                    onToggleExpandMain={toggleExpandMain}
                    onToggleExpandSub={toggleExpandSub}
                  />
                ))
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 1.5, py: 0.8, borderTop: '1px solid #f1f5f9', bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
              <Box
                onClick={(e) => { e.stopPropagation(); setOpen(false); setSearchTerm('') }}
                sx={{
                  fontSize: '12px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer',
                  px: 1.5, py: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#eff6ff' },
                }}
              >
                Done
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  )
}