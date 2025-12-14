'use client'

import { BusinessProvider } from '@/lib/context/business-context'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <BusinessProvider>{children}</BusinessProvider>
}
