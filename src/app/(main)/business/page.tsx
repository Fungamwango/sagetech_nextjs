import { getCurrentUser } from "@/lib/auth";
import BusinessClient from "./BusinessClient";

export default async function BusinessPage() {
  const user = await getCurrentUser();

  return <BusinessClient currentUserId={user?.id ?? null} />;
}
