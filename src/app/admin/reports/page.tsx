import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminReportsClient from "./AdminReportsClient";

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminReportsClient />;
}
