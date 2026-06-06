'use client'
import { SessionProvider } from 'next-auth/react'
import StoreProvider from './StoreProvider'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <Toaster />
        {children}
      </StoreProvider>
    </SessionProvider>
  )
}
