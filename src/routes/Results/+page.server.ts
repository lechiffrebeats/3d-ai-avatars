import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private";
import { PUBLIC_SUPABASE_URL } from "$env/static/public";

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const load = async () => {
  const { data, error } = await supabaseAdmin
    .from("Evaluations")
    .select("id, created_at, order, questionary_demo, timings, steps, meta, session_id"); /* DO NOT LOAD MESSAGES  */

  if (error) throw error;
  return { evaluations: data ?? [] }; 
};