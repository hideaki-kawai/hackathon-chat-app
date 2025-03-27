import {
  Form,
  Link,
  useNavigate,
  type ActionFunctionArgs,
  redirect,
} from "react-router";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "shared/components/ui/dialog";

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const urls = formData.getAll("url").filter((url) => url !== "");

  // ブラウザのlocalStorageに保存
  if (typeof window !== "undefined") {
    localStorage.setItem("url", JSON.stringify(urls));
  }

  // モーダルを閉じる
  return redirect("/");
}

export default function UrlModal() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState<string[]>([""]);

  /**
   * コンポーネントマウント時にlocalStorageからURLを取得
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUrls = localStorage.getItem("url");
      if (storedUrls) {
        try {
          const parsedUrls = JSON.parse(storedUrls);
          if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
            setUrls(parsedUrls);
          }
        } catch (error) {
          console.error("URLの解析に失敗しました:", error);
        }
      }
    }
  }, []);

  /**
   * モーダルを閉じる
   */
  const handleClose = () => {
    navigate(-1);
  };

  /**
   * URLフィールドを追加する
   */
  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  /**
   * 特定のインデックスのURLを更新する
   * @param index - 更新するURLのインデックス
   * @param value - 新しいURL値
   */
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  /**
   * 特定のインデックスのURLを削除する
   * @param index - 削除するURLのインデックス
   */
  const removeUrl = (index: number) => {
    // URL配列が1つしかない場合は空にするだけ
    if (urls.length === 1) {
      setUrls([""]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("url");
      }
      return;
    }

    // 指定されたインデックスのURLを削除
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);

    // localStorageも更新
    if (typeof window !== "undefined") {
      localStorage.setItem("url", JSON.stringify(newUrls));
    }
  };

  /**
   * 全てのURLをクリアする
   */
  const clearAllUrls = () => {
    setUrls([""]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("url");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <DialogHeader>
              <DialogTitle>URL</DialogTitle>
              <DialogDescription>
                参照したいサイトのURLを入力してください。
              </DialogDescription>
            </DialogHeader>

            <Form method="post" className="space-y-4 mt-4">
              {(urls.length > 1 || (urls.length === 1 && urls[0] !== "")) && (
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    登録済みURL
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllUrls}
                    className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <X className="h-4 w-4 mr-1" />
                    クリア
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      name="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      className="w-full"
                    />
                    <div className="flex gap-1">
                      {urls.length > 1 && url !== "" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUrl(index)}
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      )}
                      {index === urls.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={addUrlField}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  登録
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </Form>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
