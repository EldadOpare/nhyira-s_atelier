import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import portfolioRouter from "./portfolio";
import enquiriesRouter from "./enquiries";
import categoriesRouter from "./categories";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/portfolio", portfolioRouter);
router.use("/enquiries", enquiriesRouter);
router.use("/categories", categoriesRouter);
router.use("/stats", statsRouter);

export default router;
