import { Link } from "react-router";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "shared/components/ui/dialog";
import { Button } from "shared/components/ui/button";

export default function SettingsModal() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>チャット設定</DialogTitle>
        <DialogDescription>
          チャットの動作や表示に関する設定を変更できます。
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="dark-mode" className="text-sm font-medium">
                ダークモード
              </label>
              <p className="text-sm text-gray-500">
                暗い背景色でチャットを表示します
              </p>
            </div>
            <div className="h-5 w-9 relative inline-flex">
              <input type="checkbox" id="dark-mode" className="peer sr-only" />
              <span className="peer inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 shadow-sm transition-colors peer-checked:bg-primary"></span>
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-4"></span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="notifications" className="text-sm font-medium">
                通知
              </label>
              <p className="text-sm text-gray-500">
                新しいメッセージが届いたときに通知します
              </p>
            </div>
            <div className="h-5 w-9 relative inline-flex">
              <input
                type="checkbox"
                id="notifications"
                className="peer sr-only"
              />
              <span className="peer inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 shadow-sm transition-colors peer-checked:bg-primary"></span>
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-4"></span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="sound" className="text-sm font-medium">
                サウンド
              </label>
              <p className="text-sm text-gray-500">
                メッセージの送受信時にサウンドを再生します
              </p>
            </div>
            <div className="h-5 w-9 relative inline-flex">
              <input type="checkbox" id="sound" className="peer sr-only" />
              <span className="peer inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 shadow-sm transition-colors peer-checked:bg-primary"></span>
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-4"></span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Link to="/">
          <Button variant="outline" className="mr-2">
            キャンセル
          </Button>
        </Link>
        <Link to="/">
          <Button variant="default">保存</Button>
        </Link>
      </DialogFooter>
    </>
  );
}
