import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

// Only the emails listed in ADMIN_EMAILS could reach admin routes, even if other
// people managed to sign in to Supabase. We left this empty on purpose so a bad
// setup locked everyone out instead of letting strangers in.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

if (ADMIN_EMAILS.length === 0) {
  logger.warn(
    "ADMIN_EMAILS was not set, so every admin request got rejected. Set it to a comma-separated list of admin emails.",
  );
}

// Returned the signed-in admin for a request, or null when the caller was not
// an allow-listed admin. This let public endpoints quietly show more data to an
// admin without blocking everyone else.
export async function getAdminUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const { data, error } = await supabase.auth.getUser(authHeader.slice(7));
  if (error || !data.user) return null;

  const email = data.user.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) return null;

  return data.user;
}

// Blocked any request that did not carry a valid Supabase token belonging to an
// allow-listed admin email.
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await getAdminUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as Request & { user: typeof user }).user = user;
  next();
}
