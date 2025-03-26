import { z } from "zod";

/**
 * チャットリクエストのスキーマ
 */
export const ChatRequestSchema = z.object({
  prompt: z.string().min(1, "プロンプトは必須です"),
  urls: z.array(z.string()).optional(),
});
