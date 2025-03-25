import type { ActionFunctionArgs } from "react-router";
import { parseFormWithZod } from "shared/lib/zod";
import { z } from "zod";
import { openaiClient } from "shared/lib/openai";
import LLM_MODEL from "shared/constants/llm-model";
import { getPrompt } from "./prompt";

/**
 * Zodスキーマを定義
 * プロンプトは必須です
 */
const RequestPromptSchema = z.object({
  prompt: z.string().min(1, "プロンプトは必須です"),
  urls: z.array(z.string()).optional(),
});

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

        const { prompt, urls } = parseFormWithZod(
          formData,
          RequestPromptSchema
        );

        // ストリームレスポンスを返すための準備
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              let completion;

              if (urls && urls.length > 0) {
                console.log("URLs:", urls);

                // プロンプトを生成（domain specificなクエリを含む）
                const generatedPrompt = getPrompt(prompt, urls);
                console.log("Generated prompt:", generatedPrompt);

                completion = await openaiClient.chat.completions.create({
                  model: LLM_MODEL.GPT_4O_MINI_SEARCH_PREVIEW,
                  messages: [{ role: "user", content: generatedPrompt }],
                  web_search_options: {
                    search_context_size: "high",
                    user_location: {
                      type: "approximate",
                      approximate: {
                        country: "JP",
                      },
                    },
                  },
                  stream: true,
                });
              } else {
                console.log("Using regular model without URLs");
                completion = await openaiClient.chat.completions.create({
                  model: LLM_MODEL.GPT_4O_MINI,
                  messages: [{ role: "user", content: prompt }],
                  stream: true,
                });
              }

              console.log(
                "================================================================\n以下、回答内容\n"
              );

              // ストリームの処理
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                  // コンソールに回答内容を出力
                  process.stdout.write(content);
                  // ストリームに回答内容を出力
                  controller.enqueue(encoder.encode(content));
                }
              }
              console.log(
                "\n================================================================"
              );
            } catch (error) {
              console.error("Stream error:", error);
              controller.error(error);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });

      default:
        return new Response(JSON.stringify({ message: "Method not allowed" }), {
          status: 405,
          headers: {
            "Content-Type": "application/json",
          },
        });
    }
  } catch (error: any) {
    // Zodのバリデーションエラーの場合
    if (error.name === "ZodError" || error.issues) {
      return new Response(
        JSON.stringify({
          error: error.issues[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // その他のエラーの場合
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: `予期せぬエラーが発生しました。${error.message}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
