'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Globe, Edit2, Trash2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  domain: string | null
  primary_color: string
  is_core: boolean
  created_at: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const { isSuperAdmin } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchBusinesses()
  }, [])

  async function fetchBusinesses() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteBusiness(id: string, name: string) {
    if (!confirm(`Delete business "${name}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBusinesses()
    } catch (error) {
      alert('Failed to delete business')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Businesses</h1>
          <p className="text-[var(--muted)] mt-1">Manage all businesses</p>
        </div>
        {isSuperAdmin && (
          <Link
            href="/dashboard/settings/businesses/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg"
          >
            <Plus size={18} />
            Add Business
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                {business.name.charAt(0)}
              </div>
              {business.is_core && (
                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded border border-yellow-500/20">
                  Core
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{business.name}</h3>
            <div className="text-sm text-[var(--muted)] mb-3">/{business.slug}</div>

            {business.domain && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
                <Globe size={14} />
                {business.domain}
              </div>
            )}

            <div className="text-xs text-[var(--muted)] mb-4">
              Created {new Date(business.created_at).toLocaleDateString()}
            </div>

            {isSuperAdmin && (
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => router.push(`/dashboard/businesses/${business.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded text-sm"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                {!business.is_core && (
                  <button
                    onClick={() => deleteBusiness(business.id, business.name)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-12 text-center">
          <Building2 size={48} className="mx-auto text-[var(--muted)] mb-4" />
          <p className="text-[var(--muted)] mb-4">No businesses found</p>
          {isSuperAdmin && (
            <Link
              href="/dashboard/settings/businesses/new"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              <Plus size={18} />
              Create first business
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
