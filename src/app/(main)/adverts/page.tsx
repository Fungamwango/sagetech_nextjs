import { getCurrentUser } from "@/lib/auth";
import AdvertsClient from "./AdvertsClient";

export default async function AdvertsPage() {
  const user = await getCurrentUser();
  return (
    <AdvertsClient currentUserId={user?.id ?? null} />
  );
}
