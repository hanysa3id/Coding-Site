import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/verify-admin.mjs <email> <password>");
  process.exit(1);
}

// Sign in as the user using the anon key (same path the browser uses)
const supabase = createClient(url, anon);
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  console.error("✗ Login failed:", error.message);
  process.exit(1);
}

console.log("✓ Login succeeded for", data.user.email);

// Look up the profile role via service role
const admin = createClient(url, service, { auth: { persistSession: false } });
const { data: profile } = await admin
  .from("profiles")
  .select("role, full_name, email, locale")
  .eq("id", data.user.id)
  .single();

console.log("✓ Profile:", profile);
console.log("\nReady to use. Sign in at http://localhost:3000/ar/login");
