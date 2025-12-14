'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X, Trash2, Plus, CheckSquare } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  deadline: string | null
  budget: number | null
  created_at: string
  clients: { name: string } | null
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProject()
    fetchTasks()
  }, [params.id])

  async function fetchProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProject(data)
      setFormData(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/dashboard/projects')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, status, priority, created_at')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    setTasks(data || [])
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          start_date: formData.start_date,
          deadline: formData.deadline,
          budget: formData.budget,
        })
        .eq('id', params.id)

      if (error) throw error
      setProject({ ...project!, ...formData })
      setEditing(false)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this project and all its tasks?')) return

    try {
      const { error } = await supabase.from('projects').delete().eq('id', params.id)
      if (error) throw error
      router.push('/dashboard/projects')
    } catch (error) {
      alert('Failed to delete project')
    }
  }

  if (loading || !project) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      on_hold: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    }
    return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/projects" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status === 'in_progress' ? 'In Progress' : project.status === 'on_hold' ? 'On Hold' : project.status}
            </span>
          </div>
          {project.clients && <p className="text-[var(--muted)] mt-1">Client: {project.clients.name}</p>}
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg">
                <Edit2 size={18} />Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                <Trash2 size={18} />Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                <Save size={18} />{saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setFormData(project) }} className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg">
                <X size={18} />Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Project Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Project Name</label>
            {editing ? (
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{project.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Status</label>
            {editing ? (
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]">
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (
              <p className="text-white">{project.status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Start Date</label>
            {editing ? (
              <input type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Deadline</label>
            {editing ? (
              <input type="date" value={formData.deadline || ''} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Budget</label>
            {editing ? (
              <input type="number" value={formData.budget || ''} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || null })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" />
            ) : (
              <p className="text-white">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Description</label>
            {editing ? (
              <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]" rows={4} />
            ) : (
              <p className="text-white whitespace-pre-wrap">{project.description || 'No description'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <Link href={`/dashboard/tasks/new?project=${params.id}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg">
            <Plus size={18} />Add Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">No tasks yet</p>
            <Link href={`/dashboard/tasks/new?project=${params.id}`} className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]">
              <Plus size={18} />Create first task
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]">
                <div>
                  <div className="font-medium text-white">{task.title}</div>
                  <div className="text-sm text-[var(--muted)] mt-1">Created {new Date(task.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted)]">{task.priority}</span>
                  <span className="text-sm text-[var(--muted)]">{task.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
