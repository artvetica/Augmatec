'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { BarChart3, DollarSign, TrendingUp, Users, Building2, FolderKanban } from 'lucide-react'

export default function ReportsPage() {
  const { currentBusiness } = useBusiness()
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) fetchReports()
  }, [currentBusiness])

  async function fetchReports() {
    const [leads, clients, projects, tasks, invoices] = await Promise.all([
      supabase.from('leads').select('*').eq('business_id', currentBusiness?.id),
      supabase.from('clients').select('*').eq('business_id', currentBusiness?.id),
      supabase.from('projects').select('*').eq('business_id', currentBusiness?.id),
      supabase.from('tasks').select('*').eq('business_id', currentBusiness?.id),
      supabase.from('invoices').select('*').eq('business_id', currentBusiness?.id),
    ])

    const leadsData = leads.data || []
    const clientsData = clients.data || []
    const projectsData = projects.data || []
    const tasksData = tasks.data || []
    const invoicesData = invoices.data || []

    setStats({
      leads: {
        total: leadsData.length,
        new: leadsData.filter(l => l.status === 'new').length,
        converted: leadsData.filter(l => l.status === 'converted' || l.status === 'won').length,
        lost: leadsData.filter(l => l.status === 'lost').length,
      },
      clients: {
        total: clientsData.length,
        active: clientsData.filter(c => c.status === 'active').length,
        inactive: clientsData.filter(c => c.status === 'inactive').length,
        churned: clientsData.filter(c => c.status === 'churned').length,
      },
      projects: {
        total: projectsData.length,
        planning: projectsData.filter(p => p.status === 'planning').length,
        inProgress: projectsData.filter(p => p.status === 'in_progress').length,
        completed: projectsData.filter(p => p.status === 'completed').length,
      },
      tasks: {
        total: tasksData.length,
        todo: tasksData.filter(t => t.status === 'todo').length,
        inProgress: tasksData.filter(t => t.status === 'in_progress').length,
        completed: tasksData.filter(t => t.status === 'completed').length,
      },
      finance: {
        totalRevenue: invoicesData.reduce((sum, inv) => sum + inv.amount, 0),
        paid: invoicesData.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
        pending: invoicesData.filter(i => i.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
        overdue: invoicesData.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
        invoiceCount: invoicesData.length,
      },
    })
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading reports...</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-[var(--muted)] mt-1">Business performance overview for {currentBusiness?.name}</p>
      </div>

      {/* Financial Overview */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Financial Overview</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--muted)] text-sm">Total Revenue</div>
            <div className="text-2xl font-bold text-white mt-1">${stats.finance.totalRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Paid</div>
            <div className="text-2xl font-bold text-green-500 mt-1">${stats.finance.paid.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Pending</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">${stats.finance.pending.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Overdue</div>
            <div className="text-2xl font-bold text-red-500 mt-1">${stats.finance.overdue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Lead Conversion */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Lead Conversion</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--muted)] text-sm">Total Leads</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.leads.total}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">New</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">{stats.leads.new}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Converted</div>
            <div className="text-2xl font-bold text-green-500 mt-1">{stats.leads.converted}</div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {stats.leads.total > 0 ? Math.round((stats.leads.converted / stats.leads.total) * 100) : 0}% conversion rate
            </div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Lost</div>
            <div className="text-2xl font-bold text-red-500 mt-1">{stats.leads.lost}</div>
          </div>
        </div>
      </div>

      {/* Client Status */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Client Status</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--muted)] text-sm">Total Clients</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.clients.total}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Active</div>
            <div className="text-2xl font-bold text-green-500 mt-1">{stats.clients.active}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Inactive</div>
            <div className="text-2xl font-bold text-gray-400 mt-1">{stats.clients.inactive}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Churned</div>
            <div className="text-2xl font-bold text-red-500 mt-1">{stats.clients.churned}</div>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Project Progress</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--muted)] text-sm">Total Projects</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.projects.total}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Planning</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">{stats.projects.planning}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">In Progress</div>
            <div className="text-2xl font-bold text-yellow-500 mt-1">{stats.projects.inProgress}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Completed</div>
            <div className="text-2xl font-bold text-green-500 mt-1">{stats.projects.completed}</div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {stats.projects.total > 0 ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0}% completion rate
            </div>
          </div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-white">Task Overview</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--muted)] text-sm">Total Tasks</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.tasks.total}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">To Do</div>
            <div className="text-2xl font-bold text-gray-400 mt-1">{stats.tasks.todo}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">In Progress</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">{stats.tasks.inProgress}</div>
          </div>
          <div>
            <div className="text-[var(--muted)] text-sm">Completed</div>
            <div className="text-2xl font-bold text-green-500 mt-1">{stats.tasks.completed}</div>
            <div className="text-xs text-[var(--muted)] mt-1">
              {stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}% completion rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
