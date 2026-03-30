import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RechargesClient from "./RechargesClient";

export default async function AdminRechargesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <RechargesClient />;
}
