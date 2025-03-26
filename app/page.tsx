import type { Route } from ".react-router/types/app/+types/root";
import { Search, ArrowRight } from "lucide-react";
import type { ActionFunctionArgs } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "shared/components/ui/card";
import { Button } from "shared/components/ui/button";
import { parseFormWithZod } from "shared/utils/parse-form-with-zod";
import { createStreamResponse } from "shared/functions/create-stream-response";
import { ChatRequestSchema } from "shared/schema/chat-request.schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "OpenAI Response API Sample App" },
    { name: "description", content: "OpenAI Response API Sample App" },
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    switch (request.method) {
      case "POST":
        const formData = await request.formData();

        // Zodを使用してフォームデータをパース
        const { prompt, urls } = parseFormWithZod(formData, ChatRequestSchema);

        // ストリームレスポンスを返す
        return createStreamResponse(prompt, urls);

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

// TODO: Chat画面にする
export default function Chat() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        OpenAI Response API サンプルアプリ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5" />
              AI 検索
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <p className="text-gray-600">
              AIを活用した高度な検索機能を使って、あなたの質問に最適な回答を見つけましょう。
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="group">
              はじめる{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18Z" />
              </svg>
              履歴表示
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <p className="text-gray-600">
              過去の会話履歴を簡単に確認できます。必要な情報を素早く見つけましょう。
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" className="group">
              確認する{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z" />
              </svg>
              設定
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <p className="text-gray-600">
              アプリの設定をカスタマイズして、あなた好みの使い心地に調整できます。
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="secondary" className="group">
              設定する{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
