import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <MessagesClient currentUser={{ id: user.id, username: user.username, picture: user.picture }} />;
}
