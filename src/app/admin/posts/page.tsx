import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPostsClient from "./AdminPostsClient";

export default async function AdminPostsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminPostsClient />;
}
