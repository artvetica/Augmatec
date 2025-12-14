'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X, Trash2 } from 'lucide-react'

export default function LeadDetailPage() {
  const [lead, setLead] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchLead()
  }, [params.id])

  async function fetchLead() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setLead(data)
      setFormData(data)
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard/leads')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('leads')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error
      setLead(formData)
      setEditing(false)
    } catch (error) {
      alert('Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this lead?')) return

    try {
      const { error } = await supabase.from('leads').delete().eq('id', params.id)
      if (error) throw error
      router.push('/dashboard/leads')
    } catch (error) {
      alert('Failed to delete lead')
    }
  }

  if (loading || !lead) return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/leads" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
            <ArrowLeft size={18} />Back
          </Link>
          <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <>
              <Link href={`/dashboard/clients/new?from_lead=${lead.id}`} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                Convert to Client
              </Link>
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg">
                <Edit2 size={18} />Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                <Trash2 size={18} />Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Save size={18} />{saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setFormData(lead) }} className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg">
                <X size={18} />Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Lead Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Name</label>
            {editing ? (
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{lead.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Company</label>
            {editing ? (
              <input type="text" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{lead.company || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Status</label>
            {editing ? (
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="talking">Talking</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            ) : (
              <p className="text-white capitalize">{lead.status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Source</label>
            {editing ? (
              <input type="text" value={formData.source || ''} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{lead.source || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Estimated Value</label>
            {editing ? (
              <input type="number" value={formData.estimated_value || ''} onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || null })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'Not set'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
