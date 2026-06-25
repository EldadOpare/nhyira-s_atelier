import { Router } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubmitEnquiryBody, UpdateEnquiryBody, UpdateEnquiryParams, GetEnquiryParams, DeleteEnquiryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const items = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  res.json(items.map(formatEnquiry));
});

// This came from the public contact form, so the lengths were capped to stop
// anyone stuffing the database with huge values.
const LIMITS = { name: 120, email: 200, phone: 40, service: 120, eventDate: 40, message: 5000 };

router.post("/", async (req, res) => {
  const parsed = SubmitEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { name, email, phone, service, eventDate, message } = parsed.data;

  const tooLong =
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    (phone?.length ?? 0) > LIMITS.phone ||
    service.length > LIMITS.service ||
    (eventDate?.length ?? 0) > LIMITS.eventDate ||
    message.length > LIMITS.message;
  if (tooLong) {
    res.status(400).json({ error: "One or more fields are too long" });
    return;
  }

  const [item] = await db
    .insert(enquiriesTable)
    .values({
      name,
      email,
      phone: phone ?? null,
      service,
      eventDate: eventDate ?? null,
      message,
      status: "new",
    })
    .returning();
  res.status(201).json(formatEnquiry(item));
});

router.get("/:id", requireAdmin, async (req, res) => {
  const parsed = GetEnquiryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [item] = await db.select().from(enquiriesTable).where(eq(enquiriesTable.id, parsed.data.id));
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatEnquiry(item));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateEnquiryParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateEnquiryBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (bodyParsed.data.status !== undefined) updates.status = bodyParsed.data.status;
  if (bodyParsed.data.notes !== undefined) updates.notes = bodyParsed.data.notes;

  const [item] = await db
    .update(enquiriesTable)
    .set(updates)
    .where(eq(enquiriesTable.id, paramsParsed.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatEnquiry(item));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteEnquiryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(enquiriesTable).where(eq(enquiriesTable.id, parsed.data.id));
  res.status(204).send();
});

function formatEnquiry(item: typeof enquiriesTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone ?? null,
    service: item.service,
    eventDate: item.eventDate ?? null,
    message: item.message,
    status: item.status,
    notes: item.notes ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

export default router;
