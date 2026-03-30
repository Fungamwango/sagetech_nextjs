import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ProfileEditClient from "./ProfileEditClient";

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.id !== id) notFound();

  return (
    <ProfileEditClient
      user={{
        id: user.id,
        username: user.username,
        bio: user.bio,
        picture: user.picture,
        email: user.email,
      }}
    />
  );
}
