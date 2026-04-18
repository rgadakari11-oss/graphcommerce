import { Logo as LogoBase } from '@graphcommerce/next-ui'
import qtyBizLogo from './qtybiz-logo.png'

export function Logo() {
  return (
    <LogoBase
      sx={{
        // 🔥 override ANY internal div that is centering
        '&, & *': {
          marginLeft: { xs: '0 !important', md: undefined },
          marginRight: { xs: '0 !important', md: undefined },
        },

        '& .GcLogo-logo': {
          width: { xs: '150px', md: '175px' },
          height: 'auto',
          paddingLeft: { xs: '10px', md: 0 },
          marginTop: { xs: 0, md: '-5px' },
          filter: (theme) =>
            theme.palette.mode === 'dark' ? 'invert(100%)' : 'none',
        },
      }}
      image={{ alt: 'QtyBiz Logo', src: qtyBizLogo, unoptimized: true }}
    />
  )
}