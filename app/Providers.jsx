'use client'
import { SessionProvider } from 'next-auth/react'
import StoreProvider from './StoreProvider'
import { Toaster } from 'react-hot-toast'
import SiteSettingsProvider from '@/lib/siteSettingsContext'

export default function Providers({ children, siteSettings = null }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <SiteSettingsProvider initialData={siteSettings}>
          <Toaster />
          {children}
        </SiteSettingsProvider>
      </StoreProvider>
    </SessionProvider>
  )
}
