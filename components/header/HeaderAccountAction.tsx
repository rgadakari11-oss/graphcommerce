import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  DesktopHeaderBadge,
  IconSvg,
  extendableComponent,
  iconPerson,
} from '@graphcommerce/next-ui'
import { i18n } from '@lingui/core'
import type { BadgeProps, FabProps as FabPropsType, SxProps, Theme } from '@mui/material'
import { Fab, NoSsr } from '@mui/material'
import type { UseCustomerSessionReturn } from '@graphcommerce/magento-customer/hooks'
import { useCustomerAccountCanSignIn, useCustomerSession } from '@graphcommerce/magento-customer/hooks'
import { CompactAuthLayout } from '../Layout/Compactauthlayout'
import { CustomAccountSignInUpForm } from '../account/CustomAccountSignInUpForm'

export type HeaderAccountActionProps = {
  icon?: React.ReactNode
  FabProps?: Omit<FabPropsType, 'children'>
  sx?: SxProps<Theme>
  BadgeProps?: BadgeProps
}

const name = 'HeaderAccountAction'
const parts = ['root'] as const
const { classes } = extendableComponent(name, parts)

function HeaderAccountActionContent(
  props: HeaderAccountActionProps & { session?: UseCustomerSessionReturn },
) {
  const { session, icon, FabProps, sx, BadgeProps } = props
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const openLoginModal = () => {
    sessionStorage.setItem('auth:returnUrl', router.asPath)
    window.history.pushState({}, '', '/account/signin')
    setOpen(true)
  }

  const closeLoginModal = () => {
    const returnUrl = sessionStorage.getItem('auth:returnUrl')
    sessionStorage.removeItem('auth:returnUrl')
    window.history.pushState({}, '', returnUrl || '/')
    setOpen(false)
  }

  // Auto-open modal if user directly hits /account/signin
  useEffect(() => {
    if (router.asPath === '/account/signin' && !session?.loggedIn) {
      setOpen(true)
    }
  }, [router.asPath, session?.loggedIn])

  // If already logged in → go to account page
  const handleClick = () => {
    if (session?.loggedIn) {
      router.push('/account')
      return
    }
    openLoginModal()
  }

  return (
    <>
      <Fab
        onClick={handleClick}
        color='inherit'
        id='account'
        aria-label={i18n._(/* i18n */ 'Account')}
        size='large'
        className={classes.root}
        {...FabProps}
        sx={{ boxShadow: 'none', bgcolor: 'transparent', ...sx }}
      >
        <DesktopHeaderBadge
          badgeContent={session?.token ? 1 : 0}
          color={session?.valid ? 'primary' : 'error'}
          variant='dot'
          overlap='circular'
          {...BadgeProps}
        >
          {icon ?? <IconSvg src={iconPerson} size='large' />}
        </DesktopHeaderBadge>
      </Fab>

      {open && !session?.loggedIn && (
        <CompactAuthLayout open={open} onClose={closeLoginModal}>
          <CustomAccountSignInUpForm />
        </CompactAuthLayout>
      )}
    </>
  )
}

export default function HeaderAccountAction(props: HeaderAccountActionProps) {
  const session = useCustomerSession()
  const canSignIn = useCustomerAccountCanSignIn()

  if (!canSignIn) return null

  return (
    <NoSsr fallback={<HeaderAccountActionContent {...props} />}>
      <HeaderAccountActionContent session={session} {...props} />
    </NoSsr>
  )
}
