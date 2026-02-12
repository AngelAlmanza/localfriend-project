import { Environment } from '@shared/constants/Environment'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    Environment.SUPABASE_URL,
    Environment.SUPABASE_PUBLISHABLE_KEY,
  )
}