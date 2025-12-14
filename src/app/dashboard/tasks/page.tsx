'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckSquare, Plus, Search } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  projects: { name: string } | null
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentBusiness) fetchTasks()
  }, [currentBusiness, filter])

  async function fetchTasks() {
    try {
      let query = supabase
        .from('tasks')
        .select('*, projects(name)')
        .eq('business_id', currentBusiness?.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') query = query.eq('status', filter)

      const { data, error } = await query
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: any = {
      todo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
    }
    return colors[status] || colors.todo
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'text-gray-400',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    }
    return colors[priority] || colors.medium
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading tasks...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-[var(--muted)] mt-1">Manage your project tasks</p>
        </div>
        <Link href="/dashboard/tasks/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg">
          <Plus size={18} />New Task
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'todo', 'in_progress', 'review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === status
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] border border-[var(--border)]'
              }`}
            >
              {status === 'in_progress' ? 'In Progress' : status === 'todo' ? 'To Do' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">{searchQuery ? 'No tasks match your search' : 'No tasks yet'}</p>
            {!searchQuery && (
              <Link href="/dashboard/tasks/new" className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]">
                <Plus size={18} />Create your first task
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-[var(--card-hover)] cursor-pointer"
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--muted)] mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                      {task.projects && <span>Project: {task.projects.name}</span>}
                      <span className={getPriorityColor(task.priority)}>Priority: {task.priority}</span>
                      {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
