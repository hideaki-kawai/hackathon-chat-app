import { openaiClient } from "shared/lib/openai";
import LLM_MODEL from "shared/constants/llm-model";
import { getPrompt } from "app/api/chat/prompt";

type CreateStreamOptions = {
  prompt: string;
  urls?: string[];
  controller: ReadableStreamDefaultController;
};

/**
 * ストリームレスポンスを作成し、コントローラーに出力する
 *
 * @param options オプション
 * @returns 非同期処理
 */
const createOpenAIStream = async ({
  prompt,
  urls,
  controller,
}: CreateStreamOptions): Promise<void> => {
  const encoder = new TextEncoder();

  try {
    let completion;

    if (urls && urls.length > 0) {
      console.log("URLs:", urls);

      // プロンプトを生成（domain specificなクエリを含む）
      const generatedPrompt = getPrompt(prompt, urls);
      console.log("Generated prompt:", generatedPrompt);

      completion = await openaiClient.chat.completions.create({
        model: LLM_MODEL.GPT_4O_SEARCH_PREVIEW,
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
  }
};

/**
 * ReadableStreamを作成する
 *
 * @param prompt プロンプト
 * @param urls URL配列（オプション）
 * @returns ReadableStream
 */
export const createStreamResponse = (
  prompt: string,
  urls?: string[]
): Response => {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await createOpenAIStream({ prompt, urls, controller });
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
};
