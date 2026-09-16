import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Grants the site-owner (admin) role to the signed-in user, but only while no
 * admin exists yet. Runs entirely through the user's own authenticated
 * session — no service role key required, so this works on Cloudflare too.
 */
export const claimOwnerRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_owner_role");
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) throw new Error("Could not claim owner access");
    return result as { granted: boolean; reason: string | null };
  });
