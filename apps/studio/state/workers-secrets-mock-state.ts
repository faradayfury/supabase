import { proxy, useSnapshot } from 'valtio'

/**
 * Mock store for the Workers "Secrets" page. Secrets are environment variables
 * preloaded into every worker at deploy time. At alpha these mirror the
 * project's existing secrets; platform-wide secrets are a future step.
 */
export interface WorkerSecret {
  id: string
  name: string
  /** last 4 chars kept for a digest; the rest is never shown */
  digest: string
  updatedAt: string
  /** reserved secrets are always present and can't be removed */
  reserved?: boolean
}

let counter = 0
const nextId = () => `secret-${(counter++).toString(36)}`

const seed = (name: string, digest: string, reserved = false): WorkerSecret => ({
  id: nextId(),
  name,
  digest,
  reserved,
  updatedAt: new Date().toISOString(),
})

export const workerSecretsMockState = proxy<{
  secrets: WorkerSecret[]
  addSecret: (name: string, value: string) => void
  removeSecret: (id: string) => void
}>({
  secrets: [
    seed('SUPABASE_URL', 'e.co', true),
    seed('SUPABASE_ANON_KEY', 'iJ9k', true),
    seed('SUPABASE_SERVICE_ROLE_KEY', 'aZ2p', true),
    seed('STRIPE_SECRET_KEY', 'a1B2'),
  ],

  addSecret(name: string, value: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const digest = value.slice(-4).padStart(4, '•')
    const existing = workerSecretsMockState.secrets.find((s) => s.name === trimmed)
    if (existing) {
      existing.digest = digest
      existing.updatedAt = new Date().toISOString()
      return
    }
    workerSecretsMockState.secrets.unshift({
      id: nextId(),
      name: trimmed,
      digest,
      updatedAt: new Date().toISOString(),
    })
  },

  removeSecret(id: string) {
    const index = workerSecretsMockState.secrets.findIndex((s) => s.id === id)
    if (index === -1 || workerSecretsMockState.secrets[index].reserved) return
    workerSecretsMockState.secrets.splice(index, 1)
  },
})

export const useWorkerSecrets = () => useSnapshot(workerSecretsMockState).secrets as WorkerSecret[]
