import { getCurrentUser } from "@/lib/auth";
import CyberClient from "./CyberClient";

export const metadata = {
  title: "SageCyber | Cyber Tools",
  description:
    "Use practical cyber tools and free internet utilities in one place.",
};

export default async function CyberPage() {
  const user = await getCurrentUser();

  return (
    <CyberClient
      currentUser={user ? { id: user.id, username: user.username } : null}
    />
  );
}
