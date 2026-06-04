import { Router, type IRouter } from "express";
import { analyzeFoodImage } from "../lib/gemini";
import { AnalyzeFoodBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeFoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageBase64, mimeType, description } = parsed.data;

  try {
    const result = await analyzeFoodImage(imageBase64, mimeType, description);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Gemini analysis failed");
    res.status(500).json({ error: "Failed to analyze food image. Please try again." });
  }
});

export default router;
