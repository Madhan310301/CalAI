import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import logsRouter from "./logs";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(logsRouter);
router.use(summaryRouter);

export default router;
