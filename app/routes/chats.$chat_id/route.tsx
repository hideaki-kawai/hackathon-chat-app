import { useParams } from "react-router";

export default function Chat() {
  const { chat_id } = useParams();
  return <div>Chat: {chat_id}</div>;
}
