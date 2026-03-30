import { getCurrentUser } from "@/lib/auth";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  return <FriendsClient currentUserId={user?.id ?? null} />;
}
