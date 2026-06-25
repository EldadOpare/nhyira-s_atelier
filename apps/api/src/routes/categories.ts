import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

function format(c: typeof categoriesTable.$inferSelect) {
  return { id: c.id, name: c.name, sortOrder: c.sortOrder };
}

// The public site read these to fill its service list and dropdowns.
router.get("/", async (_req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder));
  res.json(rows.map(format));
});

router.post("/", requireAdmin, async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name || name.length > 120) {
    res.status(400).json({ error: "A name is required" });
    return;
  }
  // Put new ones at the end of the list.
  const existing = await db.select().from(categoriesTable);
  const sortOrder = existing.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1;

  try {
    const [row] = await db.insert(categoriesTable).values({ name, sortOrder }).returning();
    res.status(201).json(format(row));
  } catch {
    res.status(409).json({ error: "That category already exists" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (typeof req.body?.name === "string") {
    const name = req.body.name.trim();
    if (!name || name.length > 120) {
      res.status(400).json({ error: "A name is required" });
      return;
    }
    updates.name = name;
  }
  if (typeof req.body?.sortOrder === "number") updates.sortOrder = req.body.sortOrder;

  try {
    const [row] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(format(row));
  } catch {
    res.status(409).json({ error: "That category already exists" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).send();
});

export default router;
