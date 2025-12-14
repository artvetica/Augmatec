'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

type Lead = {
  id: string
  name: string
  company: string | null
  source: string | null
  status: string
  estimated_value: number | null
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-purple-500/20 text-purple-400',
  talking: 'bg-yellow-500/20 text-yellow-400',
  proposal: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const { currentBusiness } = useBusiness()

  useEffect(() => {
    if (currentBusiness) fetchLeads()
  }, [currentBusiness])

  const fetchLeads = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', currentBusiness!.id)
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-[var(--muted)]">{leads.length} total</p>
        </div>
        <Link href="/dashboard/leads/new" className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg">
          <Plus size={18} /><span>Add Lead</span>
        </Link>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]" />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[var(--muted)] mb-4">No leads yet.</p>
            <Link href="/dashboard/leads/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg">
              <Plus size={18} /><span>Add first lead</span>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-[var(--muted)] text-sm">Name</th>
                <th className="text-left p-4 text-[var(--muted)] text-sm hidden sm:table-cell">Source</th>
                <th className="text-left p-4 text-[var(--muted)] text-sm">Status</th>
                <th className="text-left p-4 text-[var(--muted)] text-sm hidden md:table-cell">Value</th>
                <th className="text-left p-4 text-[var(--muted)] text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--border)] hover:bg-[var(--card-hover)]">
                  <td className="p-4">
                    <div className="font-medium text-white">{lead.name}</div>
                    {lead.company && <div className="text-sm text-[var(--muted)]">{lead.company}</div>}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-[var(--muted)] capitalize">{lead.source || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>{lead.status}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-white">{lead.estimated_value ? `${currentBusiness?.currency} ${lead.estimated_value.toLocaleString()}` : '-'}</td>
                  <td className="p-4">
                    {lead.status !== 'converted' && lead.status !== 'won' ? (
                      <Link
                        href={`/dashboard/clients/new?from_lead=${lead.id}`}
                        className="text-sm text-green-500 hover:text-green-400"
                      >
                        Convert
                      </Link>
                    ) : (
                      <span className="text-sm text-[var(--muted)]">Converted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
