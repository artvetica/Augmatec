'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type Business = {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  primary_color: string
  currency: string
}

type BusinessContextType = {
  businesses: Business[]
  currentBusiness: Business | null
  setCurrentBusiness: (business: Business) => void
  loading: boolean
  userRole: string | null
  isSuperAdmin: boolean
}

const BusinessContext = createContext<BusinessContextType>({
  businesses: [],
  currentBusiness: null,
  setCurrentBusiness: () => {},
  loading: true,
  userRole: null,
  isSuperAdmin: false,
})

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Check if super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    setIsSuperAdmin(!!superAdmin)

    // Get businesses
    let userBusinesses: Business[] = []
    
    if (superAdmin) {
      // Super admin sees all businesses
      const { data } = await supabase.from('businesses').select('*').order('name')
      userBusinesses = data || []
    } else {
      // Regular user sees only their businesses
      const { data: businessUsers } = await supabase
        .from('business_users')
        .select(`role, business:businesses(*)`)
        .eq('user_id', user.id)
        .eq('status', 'active')

      userBusinesses = businessUsers?.map((bu: any) => bu.business).filter(Boolean) || []
    }

    setBusinesses(userBusinesses)

    // Get user profile for last selected business
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('current_business_id')
      .eq('user_id', user.id)
      .single()

    if (profile?.current_business_id) {
      const lastBusiness = userBusinesses.find(b => b.id === profile.current_business_id)
      if (lastBusiness) {
        setCurrentBusinessState(lastBusiness)
      } else if (userBusinesses.length > 0) {
        setCurrentBusinessState(userBusinesses[0])
      }
    } else if (userBusinesses.length > 0) {
      setCurrentBusinessState(userBusinesses[0])
    }

    setLoading(false)
  }

  const setCurrentBusiness = async (business: Business) => {
    setCurrentBusinessState(business)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, current_business_id: business.id })
    }
  }

  return (
    <BusinessContext.Provider value={{
      businesses,
      currentBusiness,
      setCurrentBusiness,
      loading,
      userRole,
      isSuperAdmin,
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export const useBusiness = () => useContext(BusinessContext)
