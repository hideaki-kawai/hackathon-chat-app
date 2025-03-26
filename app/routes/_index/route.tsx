import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/chats/new");
}

export default function Index() {
  return <></>;
}
