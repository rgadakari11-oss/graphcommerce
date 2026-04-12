// components/signup/DetailsStep.tsx

import { Button, TextField, Typography } from '@mui/material'
import { Trans } from '@lingui/react'
import { i18n } from '@lingui/core'
import React from 'react'

type Props = {
  firstName: string
  lastName: string
  email: string
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setEmail: (v: string) => void
  onSubmit: () => void
  loading?: boolean
}

export function DetailsStep({
  firstName,
  lastName,
  email,
  setFirstName,
  setLastName,
  setEmail,
  onSubmit,
  loading,
}: Props) {
  return (
    <>
      <Typography variant='h4' gutterBottom>
        <Trans id='Complete your account' />
      </Typography>

      <TextField
        label={i18n._(/* i18n */ 'First Name')}
        fullWidth
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label={i18n._(/* i18n */ 'Last Name')}
        fullWidth
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label={i18n._(/* i18n */ 'Email')}
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        variant='contained'
        size='large'
        fullWidth
        onClick={onSubmit}
        disabled={loading}
      >
        <Trans id='Complete Account' />
      </Button>
    </>
  )
}
