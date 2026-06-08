'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SiteSettingsContext = createContext({ settings: null, isLoading: true, refresh: async () => {} })

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

export default function SiteSettingsProvider({ children, initialData = null }) {
  const [settings, setSettings] = useState(initialData ?? null)
  const [isLoading, setIsLoading] = useState(initialData ? false : true)

  const fetchAndCache = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings')
      if (!res.ok) return null
      const json = await res.json()
      const s = json?.siteSetting ?? null
      if (s) {
        try { sessionStorage.setItem('siteSettings', JSON.stringify(s)) } catch (err) { /* ignore */ }
        setSettings(s)
      }
      return s
    } catch (err) {
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    if (initialData) {
      try { sessionStorage.setItem('siteSettings', JSON.stringify(initialData)) } catch (err) { }
      setSettings(initialData)
      setIsLoading(false)
      // revalidate in background
      fetchAndCache()
      return
    }

    try {
      const cached = sessionStorage.getItem('siteSettings')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (mounted) {
          setSettings(parsed)
          setIsLoading(false)
        }
      }
    } catch (err) {
      // ignore
    }

    fetchAndCache()

    return () => { mounted = false }
  }, [initialData, fetchAndCache])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    return fetchAndCache()
  }, [fetchAndCache])

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}
