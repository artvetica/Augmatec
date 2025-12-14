'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBusinessPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', domain: '', email_domain: '', email: '', phone: '', website: '', currency: 'PKR', primary_color: '#3b82f6' })

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    const { data: business, error: bizError } = await supabase.from('businesses').insert({
      name: form.name,
      slug: form.slug,
      domain: form.domain || null,
      email_domain: form.email_domain || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      currency: form.currency,
      primary_color: form.primary_color,
      created_by: user.id,
    }).select().single()

    if (bizError) { setError(bizError.message); setLoading(false); return }

    await supabase.from('business_users').insert({
      business_id: business.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    })

    await supabase.from('user_profiles').upsert({ user_id: user.id, current_business_id: business.id })

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-[var(--card)] rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Business</h1>
          <p className="text-[var(--muted)]">Add a new business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">{error}</div>}

        <div className="space-y-4">
          <input type="text" placeholder="Business Name *" required value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          <input type="text" placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Domain (e.g. slingshot.com)" value={form.domain} onChange={(e) => setForm({...form, domain: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
            <input type="text" placeholder="Email Domain" value={form.email_domain} onChange={(e) => setForm({...form, email_domain: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="email" placeholder="Contact Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
            <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <input type="url" placeholder="Website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]">
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
            </select>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({...form, primary_color: e.target.value})} className="w-14 h-12 bg-[var(--background)] border border-[var(--border)] rounded-lg cursor-pointer" />
              <input type="text" value={form.primary_color} onChange={(e) => setForm({...form, primary_color: e.target.value})} className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1 py-3 text-center border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]">Cancel</Link>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg disabled:opacity-50">{loading ? 'Creating...' : 'Create Business'}</button>
        </div>
      </form>
    </div>
  )
}
