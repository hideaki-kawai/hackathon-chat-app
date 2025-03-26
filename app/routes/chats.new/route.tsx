import type { Route } from ".react-router/types/app/+types/root";
import { Send, Globe } from "lucide-react";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useNavigation,
  useSubmit,
  type ActionFunctionArgs,
} from "react-router";
import { Card, CardContent, CardFooter } from "shared/components/ui/card";
import { Button } from "shared/components/ui/button";
import { parseFormWithZod } from "shared/utils/parse-form-with-zod";
import { createStreamResponse } from "shared/functions/create-stream-response";
import { ChatRequestSchema } from "shared/schema/chat-request.schema";
import { ChatMessageList } from "shared/components/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "shared/components/chat/chat-bubble";
import { useEffect, useRef, useState } from "react";

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

// チャットメッセージの型定義
type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
};

export default function Chat() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "こんにちは、どのようにお手伝いできますか？",
      role: "assistant",
      timestamp: "",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const isSubmitting = navigation.state === "submitting";

  // クライアントサイドでのみタイムスタンプを設定する
  useEffect(() => {
    if (messages[0].timestamp === "") {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === 0
            ? { ...msg, timestamp: new Date().toLocaleTimeString() }
            : msg
        )
      );
    }
  }, []);

  /**
   * フォーム送信ハンドラー
   * @param e
   * @returns
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    // 入力をクリア
    setInputValue("");

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // フォームデータを作成して送信
    const formData = new FormData(formRef.current!);
    formData.set("prompt", inputValue.trim());
    submit(formData, { method: "post" });
  };

  // エンターキーで送信（シフト+エンターで改行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // 送信後にテキストエリアにフォーカスを戻す
  useEffect(() => {
    if (!isSubmitting) {
      inputRef.current?.focus();
    }
    setInputValue("");
  }, [isSubmitting]);

  // レスポンスを受け取った場合はメッセージリストに追加
  useEffect(() => {
    if (actionData && !isSubmitting) {
      // 応答をメッセージリストに追加
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content:
          actionData.response || "申し訳ありません、エラーが発生しました。",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  }, [actionData, isSubmitting]);

  return (
    <div className="container mx-auto px-2 flex flex-col h-screen max-w-4xl">
      <div className="flex justify-end my-2">
        <Button
          asChild
          size="lg"
          variant="default"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full"
        >
          <Link to="/chats/modal" className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <span>グローバルURL</span>
          </Link>
        </Button>
      </div>
      <Card className="flex-1 flex flex-col shadow-xl border-gray-200">
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ChatMessageList className="pb-20">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src={
                    message.role === "assistant"
                      ? "/assistant-avatar.png"
                      : "/user-avatar.png"
                  }
                  fallback={message.role === "assistant" ? "AI" : "ME"}
                />
                <div className="flex flex-col gap-1">
                  <ChatBubbleMessage
                    className={
                      message.role === "user" ? "bg-blue-100" : "bg-gray-100"
                    }
                  >
                    {message.content}
                  </ChatBubbleMessage>
                  <div className="text-xs text-gray-500">
                    {message.timestamp}
                  </div>
                </div>
              </ChatBubble>
            ))}
            {isSubmitting && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar src="/assistant-avatar.png" fallback="AI" />
                <ChatBubbleMessage isLoading className="bg-gray-100" />
              </ChatBubble>
            )}
          </ChatMessageList>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white absolute bottom-0 left-0 right-0">
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-full flex gap-2 items-end"
          >
            <textarea
              ref={inputRef}
              name="prompt"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              className="flex-1 resize-none rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[50px] max-h-[150px] h-auto transition-all duration-200"
              rows={1}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              disabled={isSubmitting || !inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </Form>
        </CardFooter>
      </Card>
      <Outlet />
    </div>
  );
}
