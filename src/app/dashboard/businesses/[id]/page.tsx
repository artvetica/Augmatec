'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function BusinessEditPage() {
  const [business, setBusiness] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    currency: 'PKR',
    primary_color: '#3b82f6',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchBusiness()
  }, [params.id])

  async function fetchBusiness() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setBusiness(data)
      setFormData({
        name: data.name,
        slug: data.slug,
        domain: data.domain || '',
        currency: data.currency || 'PKR',
        primary_color: data.primary_color,
      })
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard/businesses')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          slug: formData.slug,
          domain: formData.domain || null,
          currency: formData.currency,
          primary_color: formData.primary_color,
        })
        .eq('id', params.id)

      if (error) throw error
      router.push('/dashboard/businesses')
    } catch (error) {
      alert('Failed to update business')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !business) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/businesses" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
          <ArrowLeft size={18} />Back to Businesses
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Business</h1>
        <p className="text-[var(--muted)] mt-1">{business.name}</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Business Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Domain</label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            placeholder="example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Primary Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="w-16 h-10 rounded border border-[var(--border)]"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg font-medium"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/dashboard/businesses"
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg font-medium"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
