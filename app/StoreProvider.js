'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { loadProducts } from '@/lib/features/product/productSlice'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  // Load products into the store on client mount
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(loadProducts())
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}