import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminAccountClient from "./AdminAccountClient";

export default async function AdminAccountPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminAccountClient />;
}
