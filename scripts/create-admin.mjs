import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("✗ Missing env vars. Run with: node --env-file=.env.local scripts/create-admin.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2] ?? "admin@company.local";
const requestedPwd = process.argv[3];

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const password = requestedPwd ?? generatePassword();

// 1. Verify schema is migrated
const { error: tableErr } = await supabase
  .from("profiles")
  .select("id", { count: "exact", head: true });

if (tableErr) {
  console.error("✗ Could not query 'profiles' table.");
  console.error("  Reason:", tableErr.message);
  console.error("  → Apply migrations in supabase/migrations/ first (see supabase/README.md)");
  process.exit(1);
}

console.log("✓ Schema verified");

// 2. Check if user already exists
const { data: existing } = await supabase.auth.admin.listUsers();
const found = existing?.users.find((u) => u.email === email);
let userId;

if (found) {
  console.log(`! User ${email} already exists — updating password and role`);
  userId = found.id;
  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (updateErr) {
    console.error("✗ Failed to update password:", updateErr.message);
    process.exit(1);
  }
} else {
  // 3. Create user via admin API (skips email confirmation)
  const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Site Admin",
      phone: "",
      locale: "ar",
    },
  });

  if (userErr) {
    console.error("✗ Failed to create user:", userErr.message);
    process.exit(1);
  }

  userId = userData.user.id;
  console.log("✓ Auth user created:", userId);
}

// 4. Ensure profile exists and is admin
const { error: upsertErr } = await supabase.from("profiles").upsert(
  {
    id: userId,
    email,
    full_name: "Site Admin",
    role: "admin",
    locale: "ar",
  },
  { onConflict: "id" }
);

if (upsertErr) {
  console.error("✗ Failed to set admin role:", upsertErr.message);
  process.exit(1);
}

console.log("✓ Profile role set to: admin");
console.log("\n" + "=".repeat(50));
console.log("  ADMIN LOGIN CREDENTIALS");
console.log("=".repeat(50));
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
console.log("=".repeat(50));
console.log("\n  Login at: http://localhost:3000/ar/login");
console.log("  Admin panel: http://localhost:3000/ar/admin\n");
