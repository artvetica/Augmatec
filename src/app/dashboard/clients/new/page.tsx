'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

function NewClientForm() {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('from_lead')
  const supabase = createClient()

  useEffect(() => {
    if (leadId) {
      fetchLeadData()
    }
  }, [leadId])

  async function fetchLeadData() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.company || '',
          industry: data.industry || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: '',
          status: 'active',
          notes: data.notes || '',
        })
      }
    } catch (err) {
      console.error('Error fetching lead:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            business_id: currentBusiness?.id,
            name: formData.name,
            industry: formData.industry || null,
            website: formData.website || null,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            status: formData.status,
            notes: formData.notes || null,
          },
        ])
        .select()
        .single()

      if (clientError) throw clientError

      if (leadId) {
        await supabase
          .from('leads')
          .update({ status: 'converted' })
          .eq('id', leadId)
      }

      router.push('/dashboard/clients')
    } catch (err: any) {
      setError(err.message || 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2"
          >
            <ArrowLeft size={18} />
            Back to Clients
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {leadId ? 'Convert Lead to Client' : 'Add New Client'}
          </h1>
          <p className="text-[var(--muted)] mt-1">Enter client information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            placeholder="Acme Corporation"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="E-commerce, Fashion, etc."
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="contact@company.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="+92 300 1234567"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            rows={3}
            placeholder="Complete business address"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Status *
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="churned">Churned</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            rows={4}
            placeholder="Any additional information about this client..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <Link
            href="/dashboard/clients"
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>}>
      <NewClientForm />
    </Suspense>
  )
}
