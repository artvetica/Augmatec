'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users as UsersIcon, Plus, Search, Shield, UserCog, User } from 'lucide-react'

interface BusinessUser {
  id: string
  role: string
  permissions: any
  created_at: string
  users: {
    id: string
    email: string
  }
}

interface SuperAdmin {
  user_id: string
  users: {
    id: string
    email: string
  } | null
}

export default function UsersPage() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([])
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const { currentBusiness, isSuperAdmin } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) {
      fetchUsers()
    }
  }, [currentBusiness])

  async function fetchUsers() {
    try {
      // Get business users
      const { data: bizUsers } = await supabase
        .from('business_users')
        .select('*, users(id, email)')
        .eq('business_id', currentBusiness?.id)
        .order('created_at', { ascending: false })

      // Get super admins
      const { data: superAdminsData } = await supabase
        .from('super_admins')
        .select('user_id, users(id, email)')

      setBusinessUsers(bizUsers || [])
      setSuperAdmins((superAdminsData as any) || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = businessUsers.filter(user => {
    const matchesSearch = user.users.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const isSuperAdminUser = (userId: string) => {
    return superAdmins.some(sa => sa.user_id === userId)
  }

  const getRoleBadge = (role: string, userId: string) => {
    if (isSuperAdminUser(userId)) {
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <Shield size={12} className="inline mr-1" />
            Super Admin
          </span>
        </div>
      )
    }

    const colors: any = {
      admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      user: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[role] || colors.user}`}>
        {role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : 'User'}
      </span>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading users...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Permissions</h1>
          <p className="text-[var(--muted)] mt-1">Manage team access and permissions</p>
        </div>
        {isSuperAdmin && (
          <Link
            href="/dashboard/users/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg"
          >
            <Plus size={18} />
            Add User
          </Link>
        )}
      </div>

      {/* Super Admins Section */}
      {isSuperAdmin && superAdmins.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold text-white">Super Administrators</h2>
          </div>
          <div className="text-sm text-[var(--muted)] mb-4">
            Super Admins have complete access to all businesses and system settings
          </div>
          <div className="space-y-2">
            {superAdmins.filter(sa => sa.users).map((sa) => (
              <div key={sa.user_id} className="flex items-center gap-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                <Shield size={16} className="text-red-500" />
                <div className="flex-1">
                  <div className="text-white font-medium">{sa.users?.email}</div>
                  <div className="text-xs text-[var(--muted)] font-mono">{sa.user_id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Total Users</div>
          <div className="text-2xl font-bold text-white mt-1">{businessUsers.length}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Admins</div>
          <div className="text-2xl font-bold text-purple-500 mt-1">
            {businessUsers.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Regular Users</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">
            {businessUsers.filter(u => u.role === 'user').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'manager', 'user'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm ${
                roleFilter === role
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">
              {searchQuery ? 'No users match your search' : 'No users yet'}
            </p>
            {!searchQuery && isSuperAdmin && (
              <Link
                href="/dashboard/users/new"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]"
              >
                <Plus size={18} />
                Add your first user
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">User</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Role</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Permissions</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Added</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--card-hover)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                          <User size={16} className="text-[var(--primary)]" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.users.email}</div>
                          <div className="text-xs text-[var(--muted)] font-mono">{user.users.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role, user.users.id)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[var(--muted)]">
                        {user.permissions ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(user.permissions).slice(0, 3).map(([key, value]: any) => (
                              value && <span key={key} className="px-2 py-1 bg-[var(--background)] rounded text-xs">{key}</span>
                            ))}
                            {Object.keys(user.permissions).length > 3 && (
                              <span className="px-2 py-1 text-xs text-[var(--muted)]">+{Object.keys(user.permissions).length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          'Default permissions'
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {isSuperAdmin && !isSuperAdminUser(user.users.id) && (
                        <button
                          onClick={() => router.push(`/dashboard/users/${user.id}`)}
                          className="text-sm text-blue-500 hover:text-blue-400"
                        >
                          Manage
                        </button>
                      )}
                      {isSuperAdminUser(user.users.id) && (
                        <span className="text-sm text-[var(--muted)]">Protected</span>
                      )}
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
