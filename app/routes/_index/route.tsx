import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is authenticated (in a real app, check session/cookie)
  const isAuthenticated = false; // This would be dynamic in a real app
  
  if (!isAuthenticated) {
    return redirect("/login");
  }
  
  // ChatページでNested Route使いたかったから / はひとまずリダイレクト
  return redirect("/chats/new");
}
