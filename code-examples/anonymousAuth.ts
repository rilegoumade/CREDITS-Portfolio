import { supabase } from './supabase'

export type AnonymousAuthResult = { userId: string } | { error: string }

let pending: Promise<AnonymousAuthResult> | null = null

async function resolveAnonymousUser(): Promise<AnonymousAuthResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) return { error: 'session' }
  const existing = sessionData.session?.user
  if (existing) return { userId: existing.id }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) return { error: 'signin' }
  return { userId: data.user.id }
}

// Shared across all Wall comment sections so a page visit reuses one anonymous session.
// Successful results stay cached; failures clear the cache so a later call can retry.
export function ensureAnonymousUser(): Promise<AnonymousAuthResult> {
  if (!pending) {
    pending = resolveAnonymousUser().then(
      (result) => {
        if ('error' in result) pending = null
        return result
      },
      () => {
        pending = null
        return { error: 'unexpected' } as AnonymousAuthResult
      },
    )
  }
  return pending
}
