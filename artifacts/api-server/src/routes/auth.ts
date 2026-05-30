import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "nhyira2025";

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
  }
}

router.post("/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  req.session.isAdmin = true;
  res.json({ authenticated: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ authenticated: false });
  });
});

router.get("/me", (req, res) => {
  if (req.session.isAdmin) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
