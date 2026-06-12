import { Router } from "express";
import { db, portfolioTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreatePortfolioItemBody, UpdatePortfolioItemBody, UpdatePortfolioItemParams, GetPortfolioItemParams, DeletePortfolioItemParams, ListPortfolioQueryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListPortfolioQueryParams.safeParse(req.query);
  const items = await db
    .select()
    .from(portfolioTable)
    .orderBy(desc(portfolioTable.createdAt));

  if (parsed.success && parsed.data.published !== undefined) {
    const filtered = items.filter((i) => i.published === parsed.data.published);
    res.json(filtered.map(formatItem));
    return;
  }
  res.json(items.map(formatItem));
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = CreatePortfolioItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error });
    return;
  }
  const { title, category, description, packageDetails, estimatedBudget, images, tags, published } = parsed.data;
  const [item] = await db
    .insert(portfolioTable)
    .values({
      title,
      category,
      description: description ?? null,
      packageDetails: packageDetails ?? null,
      estimatedBudget: estimatedBudget ?? null,
      images: images ?? [],
      tags: tags ?? [],
      published: published ?? false,
    })
    .returning();
  res.status(201).json(formatItem(item));
});

router.get("/:id", async (req, res) => {
  const parsed = GetPortfolioItemParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [item] = await db.select().from(portfolioTable).where(eq(portfolioTable.id, parsed.data.id));
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatItem(item));
});

router.put("/:id", requireAdmin, async (req, res) => {
  const paramsParsed = UpdatePortfolioItemParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdatePortfolioItemBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updates: Record<string, unknown> = {};
  const body = bodyParsed.data;
  if (body.title !== undefined) updates.title = body.title;
  if (body.category !== undefined) updates.category = body.category;
  if (body.description !== undefined) updates.description = body.description;
  if (body.packageDetails !== undefined) updates.packageDetails = body.packageDetails;
  if (body.estimatedBudget !== undefined) updates.estimatedBudget = body.estimatedBudget;
  if (body.images !== undefined) updates.images = body.images;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.published !== undefined) updates.published = body.published;

  const [item] = await db
    .update(portfolioTable)
    .set(updates)
    .where(eq(portfolioTable.id, paramsParsed.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatItem(item));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const parsed = DeletePortfolioItemParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(portfolioTable).where(eq(portfolioTable.id, parsed.data.id));
  res.status(204).send();
});

function formatItem(item: typeof portfolioTable.$inferSelect) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description ?? null,
    packageDetails: item.packageDetails ?? null,
    estimatedBudget: item.estimatedBudget ?? null,
    images: (item.images as string[]) ?? [],
    tags: (item.tags as string[]) ?? [],
    published: item.published,
    createdAt: item.createdAt.toISOString(),
  };
}

export default router;
