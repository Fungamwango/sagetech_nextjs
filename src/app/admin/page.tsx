import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminStats from "./AdminStats";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminStats />;
}
