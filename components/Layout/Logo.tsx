import { Logo as LogoBase } from '@graphcommerce/next-ui'
import qtyBizLogo from './qtybiz-logo.png'

export function Logo() {
  return (
    <LogoBase
      sx={{
        '& .GcLogo-logo': {
          width: { xs: '90px', md: '175px' },
          //height: { xs: '16px', md: '33px' },
          height: 'auto',
          paddingLeft: { xs: '10px', md: 0 },
          marginTop: { xs: 0, md: '-5px' },
          filter: (theme) => (theme.palette.mode === 'dark' ? 'invert(100%)' : 'none'),
        },
      }}
      image={{ alt: 'QtyBiz Logo', src: qtyBizLogo, unoptimized: true }}
    />
  )
}
