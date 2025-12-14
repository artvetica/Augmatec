'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, Plus, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  status: string
  issue_date: string
  due_date: string | null
  clients: { name: string } | null
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) fetchInvoices()
  }, [currentBusiness, filter])

  async function fetchInvoices() {
    try {
      let query = supabase
        .from('invoices')
        .select('*, clients(name)')
        .eq('business_id', currentBusiness?.id)
        .order('issue_date', { ascending: false })

      if (filter !== 'all') query = query.eq('status', filter)

      const { data, error } = await query
      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      paid: 'bg-green-500/10 text-green-500 border-green-500/20',
      overdue: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    }
    return colors[status] || colors.draft
  }

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance & Invoicing</h1>
          <p className="text-[var(--muted)] mt-1">Manage invoices and track payments</p>
        </div>
        <Link href="/dashboard/finance/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg">
          <Plus size={18} />New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-sm mb-2">
            <DollarSign size={16} />Total Revenue
          </div>
          <div className="text-2xl font-bold text-white">${stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-sm mb-2">
            <TrendingUp size={16} />Paid
          </div>
          <div className="text-2xl font-bold text-green-500">${stats.paid.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-sm mb-2">
            <Wallet size={16} />Pending
          </div>
          <div className="text-2xl font-bold text-blue-500">${stats.pending.toLocaleString()}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-sm mb-2">
            <TrendingDown size={16} />Overdue
          </div>
          <div className="text-2xl font-bold text-red-500">${stats.overdue.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">No invoices yet</p>
            <Link href="/dashboard/finance/new" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]">
              <Plus size={18} />Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Invoice</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Client</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Amount</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Issue Date</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-[var(--card-hover)] cursor-pointer"
                    onClick={() => router.push(`/dashboard/finance/${invoice.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{invoice.invoice_number}</div>
                    </td>
                    <td className="p-4 text-[var(--muted)]">
                      {invoice.clients?.name || 'No client'}
                    </td>
                    <td className="p-4 text-white font-medium">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
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
