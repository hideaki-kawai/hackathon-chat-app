import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // ChatページでNested Route使いたかったから / はひとまずリダイレクト
  return redirect("/chats/new");
}
