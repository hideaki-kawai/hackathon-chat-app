import type { ActionFunctionArgs } from "react-router";
import { parseFormWithZod } from "shared/utils/parse-form-with-zod";
import { createStreamResponse } from "shared/functions/create-stream-response";
import { ChatRequestSchema } from "shared/schema/chat-request.schema";
import {
  createResponse,
  createErrorResponse,
} from "shared/utils/create-response";

/**
 * チャットAPI
 *
 * 料金は、100万トークンあたり
 * gpt-4o-search-preview
 * Input：$2.50
 * Output：$10.00
 *
 * gpt-4o-mini-search-preview
 * Input：$0.15
 * Output：$0.60
 *
 * @param request リクエスト
 * @returns レスポンス
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    switch (request.method) {
      case "POST":
        const formData = await request.formData();
        const { prompt, urls } = parseFormWithZod(formData, ChatRequestSchema);
        // 共通関数を使ってストリームレスポンスを返す
        return createStreamResponse(prompt, urls);
      default:
        return createResponse({ message: "Method not allowed" }, 405);
    }
  } catch (error: any) {
    // Zodのバリデーションエラーの場合
    if (error.name === "ZodError" || error.issues) {
      return createErrorResponse(error.issues[0].message, 400);
    }

    // その他のエラーの場合
    console.error("Unexpected error:", error);
    return createErrorResponse(
      `予期せぬエラーが発生しました。${error.message}`
    );
  }
}
