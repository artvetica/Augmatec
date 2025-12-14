'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { LayoutDashboard, Users, Building2, FolderKanban, CheckSquare, Wallet, BarChart3, Settings, LogOut, Menu, X, ChevronDown, Plus, Shield } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Clients', href: '/dashboard/clients', icon: Building2 },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Finance', href: '/dashboard/finance', icon: Wallet },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { businesses, currentBusiness, setCurrentBusiness, loading, isSuperAdmin } = useBusiness()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-white">AUGMATEC</span>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--muted)]"><X size={20} /></button>
            </div>
            
            {isSuperAdmin && (
              <div className="flex items-center gap-1 text-xs text-[var(--warning)] mb-2">
                <Shield size={12} />
                <span>Super Admin</span>
              </div>
            )}

            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: currentBusiness?.primary_color || '#3b82f6' }}>
                    {currentBusiness?.name?.charAt(0) || '?'}
                  </div>
                  <span className="truncate text-sm">{loading ? 'Loading...' : currentBusiness?.name || 'Select'}</span>
                </div>
                <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                  {businesses.map((b) => (
                    <button key={b.id} onClick={() => { setCurrentBusiness(b); setDropdownOpen(false) }} className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--card-hover)] ${currentBusiness?.id === b.id ? 'bg-[var(--primary)]/10' : ''}`}>
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: b.primary_color }}>{b.name.charAt(0)}</div>
                      <span className="truncate text-sm">{b.name}</span>
                    </button>
                  ))}
                  <Link href="/dashboard/settings/businesses/new" onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--card-hover)] border-t border-[var(--border)] text-[var(--muted)]">
                    <Plus size={16} /><span className="text-sm">Add Business</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white'}`}>
                  <item.icon size={20} /><span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border)]">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white">
              <LogOut size={20} /><span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--muted)] mr-4"><Menu size={24} /></button>
          <div className="flex-1" />
          <div className="text-sm text-[var(--muted)]">{currentBusiness?.name}</div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {!loading && !currentBusiness ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-xl font-semibold text-white mb-2">No Business Found</h2>
              <p className="text-[var(--muted)] mb-4">Create your first business to get started.</p>
              <Link href="/dashboard/settings/businesses/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg">
                <Plus size={18} /><span>Create Business</span>
              </Link>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  )
}
