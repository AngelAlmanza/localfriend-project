import { createClient } from "@supabase/supabase-js"
import { Environment } from "@shared/constants/Environment"

export function createAdminClient() {
  return createClient(
    Environment.SUPABASE_URL,
    Environment.SUPABASE_SERVICE_ROLE_KEY,
  )
}
