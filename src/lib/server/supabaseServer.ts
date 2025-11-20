import { createClient } from '@supabase/supabase-js';
import {PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY} from '$env/static/public';

type SessionOrder = 'AB' | 'BA';

export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

export async function getSessionOrder(): Promise<SessionOrder> {
  const { data, error } = await supabaseClient.rpc('get_session_order_rpc');
  /* if (error) throw new Error(`getSessionOrder failed: ${error.message}`); */
  const v = (data as string) ?? (Math.random() < 0.5 ? 'AB' : 'BA');
  return v === 'BA' ? 'BA' : 'AB';
}

export async function incrementCounter(order: SessionOrder, session_id?: string) {
  const { error } = await supabaseClient.rpc('inc_counter_rpc', {
    order_in: order,
    session_id_in: session_id ?? null
  });
  if (error) throw new Error(`incrementCounter failed: ${error.message}`);
}
/* https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit */
/* https://supabase.com/docs/guides/auth/server-side/sveltekit */
/* https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit */
