import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RechargeClient from "./RechargeClient";

export default async function RechargePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <RechargeClient
      user={{ id: user.id, username: user.username, points: user.points }}
    />
  );
}
