'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/lib/context/business-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

function NewProjectForm() {
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    status: 'planning',
    start_date: '',
    deadline: '',
    budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedClient = searchParams.get('client')
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
    if (preSelectedClient) {
      setFormData(prev => ({ ...prev, client_id: preSelectedClient }))
    }
  }, [preSelectedClient])

  async function fetchClients() {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('business_id', currentBusiness?.id)
      .eq('status', 'active')
      .order('name')
    
    setClients(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .insert([{
          business_id: currentBusiness?.id,
          client_id: formData.client_id || null,
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          start_date: formData.start_date || null,
          deadline: formData.deadline || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }])

      if (projectError) throw projectError
      router.push('/dashboard/projects')
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/projects" className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2">
          <ArrowLeft size={18} />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Project</h1>
        <p className="text-[var(--muted)] mt-1">Enter project details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-2">Project Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            placeholder="Website Redesign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Client</label>
          <select
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">No client (internal project)</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
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
            placeholder="Project description and goals..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Budget</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              placeholder="10000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 flex-1 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            href="/dashboard/projects"
            className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-[var(--muted)]">Loading...</div></div>}>
      <NewProjectForm />
    </Suspense>
  )
}
