'use client'

import { ConfigProvider, theme } from 'antd'
import { SessionProvider } from 'next-auth/react'
import React, { createContext, useContext, useMemo, useState } from 'react'

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
  const [mode, setMode] = useState<ThemeMode>('dark')

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

  // Theme is provided via React context (`mode` + `toggleTheme`).
  // Components should read `mode` from `useThemeContext()` and adjust
  // their styles/props accordingly — avoid mutating DOM classes directly.

  return (
    <SessionProvider>
      <ThemeContext.Provider value={contextValue}>
        <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
      </ThemeContext.Provider>
    </SessionProvider>
  )
}