'use client'

import { ConfigProvider, theme, App } from 'antd'
import { SessionProvider } from 'next-auth/react'
import React, { createContext, useContext, useMemo, useState, useEffect, useLayoutEffect } from 'react'
import Loading from './loading'

type ThemeMode = 'dark' | 'light'

type ThemeContextValue = {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within Providers')
  }
  return context
}

const baseTokens = {
  colorPrimary: '#845A87',
  colorError: '#A21B11',
  colorSuccess: '#49aa19',
  colorWarning: '#d89614',
  colorInfo: '#845A87',
  fontFamily:
    "var(--font-bricolage-grotesque), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  borderRadius: 8,
}

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...baseTokens,
    colorTextBase: '#141414',
    colorBgBase: '#fafafa',
  },
}

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    colorTextBase: '#e6e6e6',
    colorBgBase: '#141414',
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize with saved theme on client, default on server to avoid hydration mismatch
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as ThemeMode | null
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        return savedTheme
      }
    }
    return 'dark'
  })
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Read theme from localStorage after hydration is complete
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setMode(savedTheme)
    }
    setMounted(true)
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.style.colorScheme = mode
    // Small delay to ensure theme is applied before showing content
    requestAnimationFrame(() => {
      setIsLoading(false)
    })
  }, [])

  // Persist theme changes to localStorage and update DOM
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', mode)
      document.documentElement.setAttribute('data-theme', mode)
      document.documentElement.style.colorScheme = mode
    }
  }, [mode, mounted])

  const themeConfig = useMemo(
    () => (mode === 'dark' ? darkTheme : lightTheme),
    [mode]
  )

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  )

  return (
    <SessionProvider>
      <ThemeContext.Provider value={contextValue}>
        <ConfigProvider 
          theme={themeConfig}
          wave={{ disabled: true }} // Disable wave effect for better performance
          virtual={true} // Enable virtual scrolling for lists
        >
          <App>
            {isLoading ? (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: mode === 'dark' ? '#141414' : '#fafafa',
                zIndex: 9999,
              }}>
                <span className="loader"></span>
              </div>
            ) : (
              children
            )}
          </App>
        </ConfigProvider>
      </ThemeContext.Provider>
    </SessionProvider>
  )
}