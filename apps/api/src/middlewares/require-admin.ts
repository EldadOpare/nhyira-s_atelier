import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

/**
 * Middleware that requires a valid Supabase JWT in the Authorization header.
 * Any authenticated Supabase user is treated as admin for this project.
 *
 * Usage: router.get("/protected", requireAdmin, handler)
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: missing bearer token" });
    return;
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Unauthorized: invalid or expired token" });
    return;
  }

  // Attach user to request for downstream handlers if needed
  (req as Request & { user: typeof data.user }).user = data.user;

  next();
}
