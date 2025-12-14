'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const supabase = createClient()
  const { currentBusiness } = useBusiness()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', company: '', source: '', status: 'new', estimated_value: '', next_action: '', next_action_date: '', notes: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBusiness) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    const { error } = await supabase.from('leads').insert({
      business_id: currentBusiness.id,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      company: form.company || null,
      source: form.source || null,
      status: form.status,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      currency: currentBusiness.currency,
      next_action: form.next_action || null,
      next_action_date: form.next_action_date || null,
      notes: form.notes || null,
      created_by: user.id,
    })

    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard/leads')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads" className="p-2 hover:bg-[var(--card)] rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Lead</h1>
          <p className="text-[var(--muted)]">Enter lead details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">{error}</div>}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <input type="text" placeholder="Name *" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          <div className="grid grid-cols-2 gap-4">
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
            <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="tel" placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({...form, whatsapp: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
            <input type="text" placeholder="Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <select value={form.source} onChange={(e) => setForm({...form, source: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]">
              <option value="">Source</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="cold">Cold Outreach</option>
              <option value="other">Other</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="talking">Talking</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <input type="number" placeholder={`Estimated Value (${currentBusiness?.currency || 'PKR'})`} value={form.estimated_value} onChange={(e) => setForm({...form, estimated_value: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Follow-up</h2>
          <input type="text" placeholder="Next Action" value={form.next_action} onChange={(e) => setForm({...form, next_action: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
          <input type="date" value={form.next_action_date} onChange={(e) => setForm({...form, next_action_date: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
        </div>

        <textarea placeholder="Notes" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] resize-none" />

        <div className="flex gap-4">
          <Link href="/dashboard/leads" className="flex-1 py-3 text-center border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]">Cancel</Link>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Save Lead'}</button>
        </div>
      </form>
    </div>
  )
}
