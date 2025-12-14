'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X, Trash2, Plus, FolderKanban } from 'lucide-react'

interface Client {
  id: string
  name: string
  industry: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  status: string
  notes: string | null
  created_at: string
}

interface Project {
  id: string
  name: string
  status: string
  created_at: string
}

export default function ClientDetailPage() {
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchClient()
    fetchProjects()
  }, [params.id])

  async function fetchClient() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setClient(data)
      setFormData(data)
    } catch (error) {
      console.error('Error fetching client:', error)
      router.push('/dashboard/clients')
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjects() {
    try {
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, created_at')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false })

      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          industry: formData.industry,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
          notes: formData.notes,
        })
        .eq('id', params.id)

      if (error) throw error

      setClient(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated projects and tasks.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/dashboard/clients')
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Loading client...</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      case 'churned':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 text-[var(--muted)] hover:text-white mb-2"
          >
            <ArrowLeft size={18} />
            Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData(client)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-white rounded-lg transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Client Information</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Company Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              />
            ) : (
              <p className="text-white">{client.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Industry</label>
            {editing ? (
              <input
                type="text"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              />
            ) : (
              <p className="text-white">{client.industry || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Website</label>
            {editing ? (
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              />
            ) : (
              <p className="text-white">
                {client.website ? (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary-dark)]">
                    {client.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Status</label>
            {editing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="churned">Churned</option>
              </select>
            ) : (
              <p className="text-white">{client.status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Email</label>
            {editing ? (
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              />
            ) : (
              <p className="text-white">{client.email || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Phone</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
              />
            ) : (
              <p className="text-white">{client.phone || 'Not specified'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Address</label>
            {editing ? (
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
                rows={2}
              />
            ) : (
              <p className="text-white">{client.address || 'Not specified'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Notes</label>
            {editing ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
                rows={4}
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">{client.notes || 'No notes'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <Link
            href={`/dashboard/projects/new?client=${params.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <p className="text-[var(--muted)] mb-4">No projects yet</p>
            <Link
              href={`/dashboard/projects/new?client=${params.id}`}
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              <Plus size={18} />
              Create first project
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
              >
                <div>
                  <div className="font-medium text-white">{project.name}</div>
                  <div className="text-sm text-[var(--muted)] mt-1">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-sm text-[var(--muted)]">{project.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
