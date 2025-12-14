'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Shield } from 'lucide-react'

const PERMISSIONS = {
  leads: { view: true, create: true, edit: true, delete: true },
  clients: { view: true, create: true, edit: true, delete: true },
  projects: { view: true, create: true, edit: true, delete: true },
  tasks: { view: true, create: true, edit: true, delete: true },
  finance: { view: true, create: true, edit: true, delete: true },
  reports: { view: true },
  settings: { view: false, edit: false },
}

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    role: 'user',
    permissions: PERMISSIONS,
    makeAdmin: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  const roleTemplates: any = {
    admin: {
      leads: { view: true, create: true, edit: true, delete: true },
      clients: { view: true, create: true, edit: true, delete: true },
      projects: { view: true, create: true, edit: true, delete: true },
      tasks: { view: true, create: true, edit: true, delete: true },
      finance: { view: true, create: true, edit: true, delete: true },
      reports: { view: true },
      settings: { view: true, edit: true },
    },
    manager: {
      leads: { view: true, create: true, edit: true, delete: false },
      clients: { view: true, create: true, edit: true, delete: false },
      projects: { view: true, create: true, edit: true, delete: false },
      tasks: { view: true, create: true, edit: true, delete: true },
      finance: { view: true, create: true, edit: false, delete: false },
      reports: { view: true },
      settings: { view: false, edit: false },
    },
    user: {
      leads: { view: true, create: true, edit: false, delete: false },
      clients: { view: true, create: false, edit: false, delete: false },
      projects: { view: true, create: false, edit: false, delete: false },
      tasks: { view: true, create: true, edit: true, delete: false },
      finance: { view: false, create: false, edit: false, delete: false },
      reports: { view: false },
      settings: { view: false, edit: false },
    },
  }

  function handleRoleChange(role: string) {
    setFormData({
      ...formData,
      role,
      permissions: roleTemplates[role],
    })
  }

  function togglePermission(module: string, action: string) {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [module]: {
          ...formData.permissions[module as keyof typeof formData.permissions],
          [action]: !formData.permissions[module as keyof typeof formData.permissions][action as keyof typeof formData.permissions.leads],
        },
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (!existingUser) {
        setError('User not found. They need to create an account first.')
        setLoading(false)
        return
      }

      // Add user to business
      const { error: assignError } = await supabase
        .from('business_users')
        .insert([{
          business_id: currentBusiness?.id,
          user_id: existingUser.id,
          role: formData.role,
          permissions: formData.permissions,
        }])

      if (assignError) throw assignError

      router.push('/dashboard/users')
    } catch (err: any) {
      setError(err.message || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/users" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
          <ArrowLeft size={18} />Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-white">Add User to Business</h1>
        <p className="text-[var(--muted)] mt-1">Assign a user to {currentBusiness?.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* User Email */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="user@example.com"
            />
            <p className="text-xs text-[var(--muted)] mt-2">User must already have an account</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Role Assignment</h2>
          <div className="space-y-3">
            {['admin', 'manager', 'user'].map((role) => (
              <label
                key={role}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.role === role
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={formData.role === role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-white capitalize">{role}</div>
                  <div className="text-sm text-[var(--muted)] mt-1">
                    {role === 'admin' && 'Full access to all features and settings'}
                    {role === 'manager' && 'Can manage most features, limited delete permissions'}
                    {role === 'user' && 'Basic access, can view and create tasks'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Permissions */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Custom Permissions</h2>
          <p className="text-sm text-[var(--muted)] mb-4">Fine-tune access for this user</p>
          
          <div className="space-y-4">
            {Object.entries(formData.permissions).map(([module, perms]: any) => (
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

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-gray-600 text-white rounded-lg font-medium"
          >
            <Save size={18} />
            {loading ? 'Adding User...' : 'Add User to Business'}
          </button>
          <Link
            href="/dashboard/users"
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
