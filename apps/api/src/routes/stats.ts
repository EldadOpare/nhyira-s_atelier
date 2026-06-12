import { Router } from "express";
import { db, enquiriesTable, portfolioTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const allEnquiries = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  const portfolioCount = await db.select({ count: count() }).from(portfolioTable);

  const totalEnquiries = allEnquiries.length;
  const newEnquiries = allEnquiries.filter((e) => e.status === "new").length;
  const bookedEnquiries = allEnquiries.filter((e) => e.status === "booked").length;
  const totalPortfolioItems = Number(portfolioCount[0]?.count ?? 0);

  const serviceMap: Record<string, number> = {};
  for (const e of allEnquiries) {
    serviceMap[e.service] = (serviceMap[e.service] ?? 0) + 1;
  }
  const enquiriesByService = Object.entries(serviceMap).map(([service, count]) => ({
    service,
    count,
  }));

  const recentEnquiries = allEnquiries.slice(0, 5).map((item) => ({
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
  }));

  res.json({
    totalEnquiries,
    newEnquiries,
    bookedEnquiries,
    totalPortfolioItems,
    enquiriesByService,
    recentEnquiries,
  });
});

export default router;
