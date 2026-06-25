import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// The app called this on load to find out if the user was still signed in.
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
});

export default router;
