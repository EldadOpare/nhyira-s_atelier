import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your .env file.",
  );
}

// This client ran in the browser with the public anon key. It kept the login
// session and refreshed the token on its own.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
