'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { Settings as SettingsIcon, Building2, User, Save } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { currentBusiness, isSuperAdmin } = useBusiness()
  const [user, setUser] = useState<any>(null)
  const [businessData, setBusinessData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
    if (currentBusiness) {
      setBusinessData(currentBusiness)
    }
  }, [currentBusiness])

  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function saveBusiness() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessData.name,
          domain: businessData.domain,
          currency: businessData.currency,
        })
        .eq('id', currentBusiness?.id)

      if (error) throw error
      alert('Business settings saved')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[var(--muted)] mt-1">Manage your account and business preferences</p>
      </div>

      {/* User Profile */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">User Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Email</label>
            <div className="text-white">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">User ID</label>
            <div className="text-white font-mono text-sm">{user?.id}</div>
          </div>
          {isSuperAdmin && (
            <div className="mt-4 px-4 py-2 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
              <div className="text-[var(--warning)] text-sm font-medium">Super Admin Access</div>
              <div className="text-[var(--muted)] text-xs mt-1">You have full access to all businesses and settings</div>
            </div>
          )}
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Business Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Business Name</label>
            <input
              type="text"
              value={businessData.name || ''}
              onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Domain</label>
            <input
              type="text"
              value={businessData.domain || ''}
              onChange={(e) => setBusinessData({ ...businessData, domain: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Currency</label>
            <select
              value={businessData.currency || 'PKR'}
              onChange={(e) => setBusinessData({ ...businessData, currency: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={saveBusiness}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Business Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Manage Businesses */}
      {isSuperAdmin && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-white">Manage Businesses</h2>
          </div>
          <div className="text-[var(--muted)] mb-4">Create and manage multiple businesses under your account</div>
          <Link
            href="/dashboard/settings/businesses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg"
          >
            <Building2 size={18} />
            Add New Business
          </Link>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-[var(--card)] border border-red-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
        <p className="text-[var(--muted)] text-sm mb-4">Irreversible and destructive actions</p>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
          Delete Business
        </button>
      </div>
    </div>
  )
}
