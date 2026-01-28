import type { ReactNode } from 'react'
import { Box, Modal, Fade, IconButton, Backdrop } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/router'

export type CompactAuthLayoutProps = {
  children: ReactNode
  open?: boolean
  onClose?: () => void
}

/**
 * Compact centered modal layout for authentication pages
 * Designed to replace full-width overlays with a centered, professional modal
 * Features: Semi-transparent backdrop, centered modal, close button
 */
export function CompactAuthLayout(props: CompactAuthLayoutProps) {
  const { children, open = true, onClose } = props
  const router = useRouter()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark backdrop
            backdropFilter: 'blur(4px)', // Blur effect
          },
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        zIndex: 1300, // Above other elements
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            maxHeight: { xs: '95vh', md: '90vh' },
            backgroundColor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            outline: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
            size='small'
          >
            <CloseIcon fontSize='small' />
          </IconButton>

          {/* Scrollable Content */}
          <Box
            sx={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ddd',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#ccc',
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}