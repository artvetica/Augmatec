'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FolderKanban, Plus, Search } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  deadline: string | null
  created_at: string
  clients: {
    name: string
  } | null
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) {
      fetchProjects()
    }
  }, [currentBusiness, filter])

  async function fetchProjects() {
    try {
      let query = supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('business_id', currentBusiness?.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clients?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'on_hold':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-[var(--muted)] mt-1">Track and manage client projects</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Total Projects</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Planning</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">{stats.planning}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">In Progress</div>
          <div className="text-2xl font-bold text-yellow-500 mt-1">{stats.in_progress}</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[var(--muted)] text-sm">Completed</div>
          <div className="text-2xl font-bold text-green-500 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === status
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]'
              }`}
            >
              {status === 'in_progress' ? 'In Progress' : status === 'on_hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">
              {searchQuery ? 'No projects match your search' : 'No projects yet'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]"
              >
                <Plus size={18} />
                Create your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Project</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Client</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Deadline</th>
                  <th className="text-left p-4 text-[var(--muted)] font-medium text-sm">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-[var(--muted)] mt-1 truncate max-w-md">
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-[var(--muted)]">
                      {project.clients?.name || 'No client'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status === 'in_progress' ? 'In Progress' : project.status === 'on_hold' ? 'On Hold' : project.status}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td className="p-4 text-[var(--muted)] text-sm">
                      {new Date(project.created_at).toLocaleDateString()}
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
