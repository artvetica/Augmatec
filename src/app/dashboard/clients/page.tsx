'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search, Filter } from 'lucide-react'

interface Client {
  id: string
  name: string
  industry: string | null
  status: string
  email: string | null
  phone: string | null
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) {
      fetchClients()
    }
  }, [currentBusiness, filter])

  async function fetchClients() {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('business_id', currentBusiness?.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      case 'churned':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    churned: clients.filter(c => c.status === 'churned').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-[var(--muted)] mt-1">Manage your active clients and accounts</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Total Clients</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Active</div>
          <div className="text-2xl font-bold text-green-500 mt-1">{stats.active}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Inactive</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Churned</div>
          <div className="text-2xl font-bold text-red-500 mt-1">{stats.churned}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'churned'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]"
              >
                <Plus size={18} />
                Add your first client
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Client</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Industry</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Contact</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{client.name}</div>
                    </td>
                    <td className="p-4 text-[var(--muted)]">
                      {client.industry || 'Not specified'}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {client.email && <div className="text-[var(--muted)]">{client.email}</div>}
                        {client.phone && <div className="text-[var(--muted)]">{client.phone}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
