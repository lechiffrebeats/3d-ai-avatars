import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
/* https://supabase.com/docs/guides/auth/server-side/sveltekit */

declare global {
  namespace App {
    interface Locals {
      hasConsent: boolean
      session: Session | null
      user: User | null
      order: "AB" | "BA"
      timeoutSignal: AbortSignal
    }
    interface PageData {
      session: Session | null
    }
  }
}
export {}   

