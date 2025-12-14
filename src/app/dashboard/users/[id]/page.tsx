'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Shield } from 'lucide-react'

export default function UserDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
  }, [params.id])

  async function fetchUser() {
    try {
      const { data, error } = await supabase
        .from('business_users')
        .select('*, users(id, email)')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setUser(data)
      setFormData({
        role: data.role,
        permissions: data.permissions || {},
      })
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard/users')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('business_users')
        .update({
          role: formData.role,
          permissions: formData.permissions,
        })
        .eq('id', params.id)

      if (error) throw error
      alert('User updated successfully')
      fetchUser()
    } catch (error) {
      alert('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Remove this user from the business?')) return

    try {
      const { error } = await supabase
        .from('business_users')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/dashboard/users')
    } catch (error) {
      alert('Failed to remove user')
    }
  }

  function togglePermission(module: string, action: string) {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [module]: {
          ...formData.permissions[module],
          [action]: !formData.permissions[module]?.[action],
        },
      },
    })
  }

  if (loading || !user) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/users" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
            <ArrowLeft size={18} />Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-white">{user.users.email}</h1>
          <p className="text-[var(--muted)] mt-1">Manage user access and permissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <Trash2 size={18} />
            Remove User
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email</label>
            <div className="text-white">{user.users.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">User ID</label>
            <div className="text-white font-mono text-sm">{user.users.id}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-1">Added</label>
            <div className="text-white">{new Date(user.created_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Role</h2>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="admin">Admin - Full access</option>
          <option value="manager">Manager - Most features</option>
          <option value="user">User - Basic access</option>
        </select>
      </div>

      {/* Permissions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Detailed Permissions</h2>
        <div className="space-y-4">
          {formData.permissions && Object.entries(formData.permissions).map(([module, perms]: any) => (
            <div key={module} className="border border-[var(--border)] rounded-lg p-4">
              <div className="font-medium text-white mb-3 capitalize">{module}</div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(perms).map(([action, enabled]: any) => (
                  <label key={action} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => togglePermission(module, action)}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--muted)] capitalize">{action}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
