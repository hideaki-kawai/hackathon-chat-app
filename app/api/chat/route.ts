import type { ActionFunctionArgs } from "react-router";
import { parseFormWithZod } from "shared/lib/zod";
import { z } from "zod";

/**
 * Zodスキーマを定義
 * メッセージは必須です
 */
const MessageSchema = z.object({
  message: z.string().min(1, "メッセージは必須です"),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    switch (request.method) {
      case "POST":
        const formData = await request.formData();
        const { message } = parseFormWithZod(formData, MessageSchema);

        return new Response(JSON.stringify({ message: `${message}----!` }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
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
          error: "メッセージは必須です",
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
        error: "予期せぬエラーが発生しました",
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
