import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UploadClient from "./UploadClient";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <UploadClient user={{ id: user.id, username: user.username, points: user.points }} />;
}
