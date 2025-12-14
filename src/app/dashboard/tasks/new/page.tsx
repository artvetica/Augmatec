'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

function NewTaskForm() {
  const [projects, setProjects] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedProject = searchParams.get('project')
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
    if (preSelectedProject) {
      setFormData(prev => ({ ...prev, project_id: preSelectedProject }))
    }
  }, [preSelectedProject])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('id, name')
      .eq('business_id', currentBusiness?.id)
      .in('status', ['planning', 'in_progress'])
      .order('name')
    
    setProjects(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .insert([{
          business_id: currentBusiness?.id,
          project_id: formData.project_id || null,
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date || null,
        }])

      if (taskError) throw taskError
      router.push('/dashboard/tasks')
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/tasks" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
          <ArrowLeft size={18} />Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Task</h1>
        <p className="text-[var(--muted)] mt-1">Add a new task to your workflow</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        {error && <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-white mb-2">Task Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            placeholder="Design homepage mockup"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Project</label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">No project (standalone task)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            rows={4}
            placeholder="Task details..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Priority *</label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-gray-600 text-white rounded-lg font-medium"
          >
            <Save size={18} />{loading ? 'Creating...' : 'Create Task'}
          </button>
          <Link href="/dashboard/tasks" className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg font-medium">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>}>
      <NewTaskForm />
    </Suspense>
  )
}
