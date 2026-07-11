import { createClient } from "@supabase/supabase-js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://tyezxomrupepysxjurfj.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NCdzO3zzGgwKfvykdTtigA_HZjKeMiv";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
