import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminMessagesClient from "./AdminMessagesClient";

export default async function AdminMessagesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminMessagesClient />;
}
