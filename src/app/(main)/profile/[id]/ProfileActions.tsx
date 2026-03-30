"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

interface ProfileActionsProps {
  profileId: string;
  isMe: boolean;
  isFollowing: boolean;
  currentUserId: string | null;
}

export default function ProfileActions({ profileId, isMe, isFollowing, currentUserId }: ProfileActionsProps) {
  const { showToast } = useToast();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    if (!currentUserId) {
      showToast({ type: "error", message: "Login is required to follow users." });
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${profileId}/follow`, { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      setFollowing(d.following);
      showToast({ type: "success", message: d.following ? "User followed." : "User unfollowed." });
    } else {
      showToast({ type: "error", message: "Unable to update follow status." });
    }
    setLoading(false);
  };

  if (isMe) {
    return (
      <Link
        href={`/profile/${profileId}/edit`}
        className="btn-sage text-sm px-6"
      >
        <i className="fas fa-edit mr-1" /> Edit Profile
      </Link>
    );
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`btn-sage text-sm px-6 ${following ? "opacity-70" : ""}`}
      >
        {loading ? (
          <i className="fas fa-spinner fa-spin" />
        ) : following ? (
          <><i className="fas fa-user-minus mr-1" />Unfollow</>
        ) : (
          <><i className="fas fa-user-plus mr-1" />Follow</>
        )}
      </button>
      {currentUserId && (
        <Link
          href={`/messages/${profileId}`}
          className="px-6 py-2 rounded-full border border-white/30 text-white text-sm hover:border-cyan-400 hover:text-cyan-400 transition-colors"
        >
          <i className="fas fa-comment mr-1" /> Message
        </Link>
      )}
    </div>
  );
}
