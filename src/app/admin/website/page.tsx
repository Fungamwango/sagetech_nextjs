import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import WebsiteSettingsClient from "./WebsiteSettingsClient";

export default async function AdminWebsitePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <WebsiteSettingsClient />;
}
