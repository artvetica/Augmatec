'use client'

import { useBusiness } from '@/lib/context/business-context'
import { Users, Building2, Wallet, CheckSquare, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { currentBusiness, isSuperAdmin } = useBusiness()

  const stats = [
    { name: 'Leads', value: '0', change: '0 new', icon: Users, href: '/dashboard/leads' },
    { name: 'Clients', value: '0', change: 'active', icon: Building2, href: '/dashboard/clients' },
    { name: 'Revenue', value: `${currentBusiness?.currency || 'PKR'} 0`, change: 'this month', icon: Wallet, href: '/dashboard/finance' },
    { name: 'Tasks', value: '0', change: 'pending', icon: CheckSquare, href: '/dashboard/tasks' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-[var(--muted)]">{currentBusiness?.name} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5 hover:bg-[var(--card-hover)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--muted)] text-sm">{stat.name}</span>
              <stat.icon size={20} className="text-[var(--muted)]" />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-[var(--muted)] mt-1">{stat.change}</div>
          </Link>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/leads/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg">
            <Plus size={18} /><span>New Lead</span>
          </Link>
          <Link href="/dashboard/tasks/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg">
            <Plus size={18} /><span>New Task</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="text-[var(--muted)] text-sm py-8 text-center">No recent activity yet.</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Urgent Items</h2>
          <div className="text-[var(--muted)] text-sm py-8 text-center">All clear for now.</div>
        </div>
      </div>
    </div>
  )
}
