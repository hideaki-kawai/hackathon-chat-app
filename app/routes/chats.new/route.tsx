import type { Route } from ".react-router/types/app/+types/root";
import { Send, Globe, Trash2 } from "lucide-react";
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
import { openaiClient } from "shared/lib/openai";
import LLM_MODEL from "shared/constants/llm-model";
import { getPrompt } from "shared/prompt/prompt";
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
    const formData = await request.formData();

    const prompt = formData.get("prompt") as string;
    const urls = formData.getAll("urls") as string[];

    console.log(prompt, urls);

    // 非ストリーミングレスポンスの実装に変更
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
        });
      } else {
        console.log("Using regular model without URLs");
        completion = await openaiClient.chat.completions.create({
          model: LLM_MODEL.GPT_4O_MINI,
          messages: [{ role: "user", content: prompt }],
        });
      }

      const content = completion.choices[0]?.message?.content || "";

      console.log(
        "================================================================\n以下、回答内容\n",
        content,
        "\n================================================================"
      );

      return new Response(JSON.stringify({ content }), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("API request error:", error);
      return new Response(
        JSON.stringify({ error: "APIリクエストでエラーが発生しました" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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

// actionDataの型定義
type ActionResponse = {
  content?: string;
  error?: string;
};

export default function Chat() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<ActionResponse>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "こんにちは、どのようにお手伝いできますか？",
      role: "assistant",
      timestamp: "",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEnterPress, setLastEnterPress] = useState<number | null>(null);

  // クライアントサイドでのみタイムスタンプを設定する & ローカルストレージからメッセージを取得する
  useEffect(() => {
    // ローカルストレージからメッセージを取得
    const storedMessages = localStorage.getItem("messages");
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages) as Message[];
        setMessages(parsedMessages);
      } catch (error) {
        console.error("メッセージの解析に失敗しました:", error);
        // 初期メッセージのタイムスタンプを設定
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === 0
              ? { ...msg, timestamp: new Date().toLocaleTimeString() }
              : msg
          )
        );
      }
    } else if (messages[0].timestamp === "") {
      // ローカルストレージにメッセージがない場合は初期メッセージのタイムスタンプを設定
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === 0
            ? { ...msg, timestamp: new Date().toLocaleTimeString() }
            : msg
        )
      );
    }
  }, []);

  // ローカルストレージからURLを取得する
  useEffect(() => {
    const storedUrls = localStorage.getItem("url");
    if (storedUrls) {
      try {
        const parsedUrls = JSON.parse(storedUrls) as string[];
        setUrls(parsedUrls);
      } catch (error) {
        console.error("URLの解析に失敗しました:", error);
      }
    }
  }, []);

  // urlsの変更を検知して実行される新しいuseEffect
  useEffect(() => {
    // urlsが更新されたらログに表示
    if (urls.length > 0) {
      console.log("更新されたurls:", urls);
    }
  }, [urls]);

  // messagesが変更されたらローカルストレージに保存
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

  // actionDataの変更を検知してレスポンスを処理
  useEffect(() => {
    if (actionData && !isSubmitting) {
      setIsProcessing(false);

      if (actionData.error) {
        // エラーメッセージをアシスタントのメッセージとしてチャットに追加
        const errorAsMessage: Message = {
          id: Date.now().toString(),
          content: `エラーが発生しました: ${actionData.error}`,
          role: "assistant",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorAsMessage]);
        return;
      }

      if (actionData.content) {
        // AIの応答をメッセージリストに追加
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: actionData.content,
          role: "assistant",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    }
  }, [actionData, isSubmitting]);

  /**
   * フォーム送信ハンドラー
   * @param e
   * @returns
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || isProcessing) return;

    // 処理中フラグをセット
    setIsProcessing(true);

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

    // 保存されているURLを追加
    if (urls && urls.length > 0) {
      urls.forEach((url) => {
        if (url) {
          formData.append("urls", url);
        }
      });
    }

    submit(formData, { method: "post", action: "." });
  };

  /**
   * エンターキーで送信（シフト+エンターで改行）
   * @param e
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const now = Date.now();

      // 前回のEnterキー押下から500ミリ秒以内に再度押された場合は送信
      if (lastEnterPress && now - lastEnterPress < 500) {
        formRef.current?.requestSubmit();
        setLastEnterPress(null); // 送信後にリセット
      } else {
        // 1回目のEnterキー押下を記録
        setLastEnterPress(now);
      }
    } else {
      // Enter以外のキーが押されたらリセット
      setLastEnterPress(null);
    }
  };

  // 送信後にテキストエリアにフォーカスを戻す
  useEffect(() => {
    if (!isSubmitting && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [isSubmitting, isProcessing]);

  /**
   * 会話履歴をクリアする
   */
  const clearChatHistory = () => {
    // ローカルストレージからメッセージを削除
    localStorage.removeItem("messages");
    // 初期メッセージだけを設定
    setMessages([
      {
        id: Date.now().toString(),
        content: "こんにちは、どのようにお手伝いできますか？",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="container mx-auto px-2 flex flex-col h-screen max-w-4xl">
      <div className="flex justify-end gap-2 my-2">
        <Button
          onClick={clearChatHistory}
          size="lg"
          variant="destructive"
          className="bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white rounded-full"
        >
          <Trash2 className="h-5 w-5" />
          <span>会話履歴クリア</span>
        </Button>
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
            {(isSubmitting || isProcessing) && (
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
            action="."
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
              disabled={isSubmitting || isProcessing}
              required
            />
            <Button
              type="submit"
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              disabled={isSubmitting || isProcessing || !inputValue.trim()}
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
