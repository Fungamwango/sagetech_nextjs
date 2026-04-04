"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import PostFeed from "@/components/posts/PostFeed";
import AdsterraBannerEmbed from "@/components/monetise/AdsterraBannerEmbed";
import MonetisationSummaryCard from "@/components/monetise/MonetisationSummaryCard";
import { prepareUploadFile } from "@/lib/client/upload";
import { useBackClosable } from "@/hooks/useBackClosable";

interface ProfileSummary {
  id: string;
  username: string;
  email: string;
  picture: string | null;
  bio: string | null;
  points: string | number | null;
  awards: number | null;
  level: string | null;
  isOnline: boolean | null;
}

interface ProfileCounts {
  followers: number;
  following: number;
  posts: number;
  photos: number;
  videos: number;
  apps: number;
  music: number;
  books: number;
  documents: number;
  products: number;
}

interface ProfilePageClientProps {
  profile: ProfileSummary;
  monetise: {
    isMonetised: boolean;
    provider: string | null;
    adsterraBannerCode: string | null;
    stats:
      | {
          impressions: number;
          clicks: number;
          revenue: number;
          ctr: number;
          cpm: number;
          updatedAt: string;
        }
      | null;
      };
  counts: ProfileCounts;
  isMe: boolean;
  isFollowing: boolean;
  currentUserId: string | null;
}

type PostFilter = "all" | "video" | "song" | "document" | "product";

const FILTERS: Array<{
  id: PostFilter;
  label: string;
  icon: string;
  countKey: keyof ProfileCounts;
}> = [
  { id: "all", label: "Posts", icon: "fas fa-paper-plane", countKey: "posts" },
  { id: "video", label: "Videos", icon: "fas fa-tv", countKey: "videos" },
  { id: "song", label: "Music", icon: "fas fa-music", countKey: "music" },
  { id: "document", label: "Documents", icon: "fas fa-file-alt", countKey: "documents" },
  { id: "product", label: "Products", icon: "fas fa-store", countKey: "products" },
];

function compactCount(value: number) {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "")}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}

function levelLabel(level: string | null) {
  if (!level) return "Amateur";
  if (level === "professor") return "Proffessor";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function ProfilePageClient({
  profile,
  monetise,
  counts,
  isMe,
  isFollowing,
  currentUserId,
}: ProfilePageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [following, setFollowing] = useState(isFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PostFilter>("all");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const closeMoreMenu = useBackClosable(showMoreMenu, () => setShowMoreMenu(false));
  const closeFullImage = useBackClosable(showFullImage, () => setShowFullImage(false));
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [preview, setPreview] = useState(profile.picture || "/files/default-avatar.svg");
  const [pictureUrl, setPictureUrl] = useState(profile.picture || "/files/default-avatar.svg");
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState({
    username: profile.username,
    bio: profile.bio ?? "",
    currentPassword: "",
    newPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const postsLabel = useMemo(() => {
    if (activeFilter === "all") return "Posts";
    return FILTERS.find((item) => item.id === activeFilter)?.label ?? "Posts";
  }, [activeFilter]);

  const handleFollow = async () => {
    if (!currentUserId) {
      showToast({ type: "error", message: "Login is required to follow users." });
      router.push("/login");
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Unable to update follow status." });
        return;
      }
      setFollowing(!!data.following);
      showToast({
        type: "success",
        message: data.following ? `You are now following ${profile.username}.` : `You unfollowed ${profile.username}.`,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploadingPicture(true);

    try {
      const { file: preparedFile } = await prepareUploadFile(file);
      const payload = new FormData();
      payload.append("file", preparedFile);

      const uploadRes = await fetch("/api/upload/file", {
        method: "POST",
        body: payload,
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        setPreview(pictureUrl);
        showToast({ type: "error", message: uploadData.error ?? "Unable to upload the profile image." });
        return;
      }

      const { fileUrl } = uploadData;

      const saveRes = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picture: fileUrl }),
      });

      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        setPreview(pictureUrl);
        showToast({ type: "error", message: saveData.error ?? "Unable to save the profile picture." });
        return;
      }

      setPictureUrl(fileUrl);
      setPreview(fileUrl);
      showToast({ type: "success", message: "Profile picture updated." });
      router.refresh();
    } finally {
      setUploadingPicture(false);
      URL.revokeObjectURL(localPreview);
      event.target.value = "";
    }
  };

  const saveProfile = async () => {
    if (!form.username.trim()) {
      showToast({ type: "error", message: "Username can not be empty." });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          bio: form.bio.trim(),
          picture: pictureUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Unable to save profile changes." });
        return;
      }

      showToast({ type: "success", message: "Profile updated." });
      router.refresh();
      setShowEditPanel(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!form.currentPassword.trim() || !form.newPassword.trim()) {
      showToast({ type: "error", message: "Enter the current password and a new password." });
      return;
    }
    if (form.currentPassword.trim() === form.newPassword.trim()) {
      showToast({ type: "error", message: "New password should be different from the current password." });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`/api/users/${profile.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({ type: "error", message: data.error ?? "Unable to change the password." });
        return;
      }

      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      showToast({ type: "success", message: "Password changed successfully." });
    } finally {
      setChangingPassword(false);
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    const shareData = {
      title: `${profile.username} | SageTech`,
      text: `Follow ${profile.username} on SageTech.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        showToast({ type: "success", message: "Profile link copied." });
      }
    } catch {}

    setShowMoreMenu(false);
  };

  const copyProfileLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.id}`);
    setShowMoreMenu(false);
    showToast({ type: "success", message: "Profile link copied." });
  };

  return (
    <div className="mx-auto w-full max-w-[650px] space-y-4">
      <section
        className="rounded-[3px] border border-white/[0.03] px-1 py-2"
        style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgb(22, 40, 50), rgba(0, 0, 0, 0.9))" }}
      >
        <div className="text-center">
          <div className="mb-2 rounded-md border border-white/[0.03] px-3 py-2 text-[17px] font-bold capitalize text-whitesmoke">
            {profile.username}
          </div>

          <div className="relative inline-block">
            <button onClick={() => setShowFullImage(true)} className="inline-block">
              <Image
                src={preview}
                alt={profile.username}
                width={200}
                height={200}
                className="h-[200px] w-[200px] rounded-full border border-white/90 object-cover p-px"
              />
            </button>
            {uploadingPicture && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
                <div className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs text-white">
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Uploading profile picture...
                </div>
              </div>
            )}
            {isMe && (
              <label
                htmlFor="profile_image"
                className={`absolute bottom-4 right-6 cursor-pointer rounded-md border border-white/90 bg-black/40 px-2 py-1 text-[22px] text-[rgba(245,225,255,1)] ${uploadingPicture ? "opacity-70" : ""}`}
              >
                <i className={uploadingPicture ? "fas fa-spinner fa-spin" : "fas fa-camera"} />
              </label>
            )}
            <input id="profile_image" type="file" accept="image/*" onChange={handlePicture} className="hidden" />
          </div>

          <ul className="mt-3 rounded-md bg-black/[0.02] px-2 py-1 text-left">
            <li className="mt-2 border-b border-white/[0.07] px-2 py-2 text-sm text-[rgba(235,245,254,0.7)]">
              Points:
              <span className="ml-5 text-white/90">{Number(profile.points ?? 0).toLocaleString()}</span>
              <Link href="/recharge" className="float-right mr-1 text-[lightskyblue]">
                Earn more points
              </Link>
            </li>
            <li className="mt-2 border-b border-white/[0.07] px-2 py-2 text-sm text-[rgba(235,245,254,0.7)]">
              Level:
              <span className="ml-5 text-white/90">{levelLabel(profile.level)}</span>
              <span className="float-right mr-1 text-[rgba(235,245,254,0.6)]">
                Followers: <span className="text-white">{compactCount(counts.followers)}</span>
              </span>
            </li>
            <li className="mt-2 border-b border-white/[0.07] px-2 py-2 text-sm text-[rgba(235,245,254,0.7)]">
              Awards:
              <span className="ml-2 text-white/90">
                <i className="fas fa-trophy" />
                <sup
                  className={`ml-1 rounded-sm px-1 py-px text-[11px] text-white ${
                    Number(profile.awards ?? 0) > 0 ? "bg-[#084]" : "bg-[rgb(221,22,66)]"
                  }`}
                >
                  {Number(profile.awards ?? 0)}
                </sup>
              </span>
              <span className="float-right mr-1 text-[rgba(235,245,254,0.6)]">
                Following: <span className="text-white">{compactCount(counts.following)}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {monetise.isMonetised && monetise.provider === "adsterra" && monetise.stats ? (
        <MonetisationSummaryCard
          provider={monetise.provider}
          impressions={monetise.stats.impressions}
          clicks={monetise.stats.clicks}
          revenue={monetise.stats.revenue}
          ctr={monetise.stats.ctr}
          cpm={monetise.stats.cpm}
        />
      ) : null}

      <section
        className="grid gap-2 rounded-[3px] border border-black/10 px-3 py-4 [grid-template-columns:repeat(auto-fit,minmax(8rem,1fr))]"
        style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgb(22, 40, 50), rgba(0, 0, 0, 0.9))" }}
      >
        <div>
          {isMe ? (
            <button
              onClick={() => setShowEditPanel((prev) => !prev)}
              className="w-full rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-left text-[13px] text-[rgba(155,155,180)]"
            >
              <i className="fas fa-edit mr-2 text-xs text-[rgba(155,155,155,0.8)]" />
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="w-full rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-left text-[13px] text-[rgba(155,155,180)]"
            >
              <i className={`mr-2 text-xs text-[rgba(155,155,155,0.8)] ${following ? "fas fa-rss" : "fas fa-user-plus"}`} />
              {followLoading ? "Please wait.." : following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div>
          <Link
            href={currentUserId ? `/messages?userId=${profile.id}` : "/login"}
            className="block w-full rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-left text-[13px] text-[rgba(155,155,180)]"
          >
            <i className="fas fa-comments mr-2 text-xs text-[rgba(155,155,155,0.8)]" />
            Chat
          </Link>
        </div>

        <div>
          <button
            onClick={() => setShowMoreMenu(true)}
            className="w-full rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-left text-[13px] text-[rgba(155,155,180)]"
          >
            <i className="fas fa-ellipsis-v mr-2 text-xs text-[rgba(155,155,155,0.8)]" />
            More
          </button>
        </div>

        {FILTERS.map((filter) => (
          <div key={filter.id}>
            <button
              onClick={() => setActiveFilter(filter.id)}
              className={`w-full rounded-full border px-3 py-1.5 text-left text-[13px] ${
                activeFilter === filter.id
                  ? "border-aqua text-white"
                  : "border-white/10 bg-black/10 text-[rgba(155,155,180)]"
              }`}
            >
              <i className={`${filter.icon} mr-2 text-xs text-[rgba(155,155,155,0.8)]`} />
              {filter.label} |{" "}
              <span className="text-[11px] text-white/60">{compactCount(counts[filter.countKey])}</span>
            </button>
          </div>
        ))}
      </section>

      {showEditPanel && isMe && (
        <section
          className="rounded-[3px] border border-white/10 px-2 py-3"
          style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgb(22, 40, 50), rgba(0, 0, 0, 0.9))" }}
        >
          <div className="grid gap-3 px-2 py-2 md:grid-cols-2 md:px-5 md:py-4">
            <div>
              <label htmlFor="profile_image_secondary" className="mb-6 mt-3 block cursor-pointer border border-white/20 bg-white/10 px-3 py-2 text-center text-sm font-normal text-sky-300">
                <i className="fas fa-image mr-2" />
                Update profile picture
              </label>
              <input id="profile_image_secondary" type="file" accept="image/*" onChange={handlePicture} className="hidden" />

              <label className="pb-1 text-[13px] font-bold text-white/90">Change Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                className="mb-6 w-full border border-white/20 bg-black/10 px-3 py-2 text-sm text-white/80 outline-none"
              />

              <label className="pb-1 text-[13px] font-bold text-white/90">Bio</label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="mb-6 w-full border border-white/20 bg-black/10 px-3 py-2 text-sm text-white/80 outline-none"
              />

              <label className="pb-1 text-[13px] font-bold text-white/90">
                {passwordMode ? "Enter current password" : "Change Password"}
              </label>
              <input
                type="password"
                value={form.currentPassword}
                onFocus={() => setPasswordMode(true)}
                onChange={(e) => {
                  setPasswordMode(true);
                  setForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                }}
                placeholder="**************"
                className="mb-6 w-full border border-white/20 bg-black/10 px-3 py-2 text-sm text-white/80 outline-none"
              />

              {passwordMode && (
                <>
                  <label className="pb-1 text-[13px] font-bold text-white/90">New password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="enter here.."
                    className="mb-6 w-full border border-white/20 bg-black/10 px-3 py-2 text-sm text-white/80 outline-none"
                  />
                </>
              )}
            </div>

            <div>
              <label className="pb-1 text-[13px] font-bold text-white/90">Email</label>
              <input
                readOnly
                disabled
                value={profile.email}
                className="mb-6 w-full border border-white/20 bg-black/10 px-3 py-2 text-sm text-white/30 outline-none"
              />

              <div className="rounded-md border border-white/10 bg-black/10 p-4 text-sm text-white/70">
                <p>Primary email can not be changed.</p>
                <p className="mt-2">Use the fields on the left to update your profile details or change your password.</p>
              </div>
            </div>
          </div>

          {!passwordMode && (
            <div className="mb-4">
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="w-full rounded-[5px] bg-[#034] px-3 py-2 text-sm text-white md:w-auto md:min-w-[220px]"
              >
                {savingProfile ? <><span className="inline-loader mr-2" aria-hidden="true" />Saving changes...</> : <><i className="fas fa-check mr-2" />Save changes</>}
              </button>
            </div>
          )}

          {passwordMode && (
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <button
                onClick={changePassword}
                disabled={
                  changingPassword ||
                  !form.currentPassword.trim() ||
                  !form.newPassword.trim() ||
                  form.currentPassword.trim() === form.newPassword.trim()
                }
                className={`w-full rounded-[5px] px-3 py-2 text-sm md:w-auto md:min-w-[220px] ${
                  changingPassword ||
                  !form.currentPassword.trim() ||
                  !form.newPassword.trim() ||
                  form.currentPassword.trim() === form.newPassword.trim()
                    ? "bg-white/5 text-white/20"
                    : "bg-[#034] text-white"
                }`}
              >
                {changingPassword ? <><span className="inline-loader mr-2" aria-hidden="true" />Saving...</> : <><i className="fas fa-check mr-2" />Change password</>}
              </button>

              <button
                onClick={() => {
                  setPasswordMode(false);
                  setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
                }}
                className="w-full rounded-[5px] border border-white/15 bg-black/10 px-3 py-2 text-sm text-white/70 md:w-auto md:min-w-[160px]"
              >
                cancel
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">{postsLabel}</div>
        <PostFeed
          userId={profile.id}
          currentUserId={currentUserId}
          postType={activeFilter === "all" ? undefined : activeFilter}
          showComposer={false}
        />
      </section>

      {monetise.isMonetised && monetise.provider === "adsterra" && monetise.adsterraBannerCode ? (
        <section
          className="rounded-[3px] border border-white/10 px-3 py-4"
          style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgb(22, 40, 50), rgba(0, 0, 0, 0.9))" }}
        >
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Sponsored</div>
          <AdsterraBannerEmbed code={monetise.adsterraBannerCode} />
        </section>
      ) : null}

      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
          onClick={closeMoreMenu}
        >
          <div
            className="w-full max-w-md rounded-md bg-[rgb(250,250,255)] px-6 py-5 text-left shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <ul className="space-y-4 text-base text-[#034]">
              <li>
                <button onClick={shareProfile} className="w-full border-b border-black/10 pb-3 text-left">
                  <i className="fas fa-share mr-2" />
                  Share profile
                </button>
              </li>
              <li>
                <button onClick={copyProfileLink} className="w-full border-b border-black/10 pb-3 text-left">
                  <i className="fas fa-copy mr-2" />
                  Copy profile link
                </button>
              </li>
              <li>
                <button onClick={closeMoreMenu} className="rounded-md border border-black/10 px-4 py-2 text-sm text-black/70">
                  cancel
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {showFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 px-3 py-5"
          onClick={closeFullImage}
        >
          <div
            className="mx-auto w-full max-w-3xl rounded-[3px] bg-white p-2"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-right">
              <button onClick={closeFullImage} className="px-3 py-1 text-xl text-black/70">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="rounded-[3px] border border-black/20 bg-[#001f37]/[0.01]">
              <Image
                src={preview}
                alt={profile.username}
                width={1200}
                height={1200}
                className="h-auto w-full object-cover p-0.5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
