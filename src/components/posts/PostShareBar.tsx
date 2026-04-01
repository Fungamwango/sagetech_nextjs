"use client";

import { useToast } from "@/components/ui/ToastProvider";

function buildShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

export default function PostShareBar({ url, title }: { url: string; title: string }) {
  const { showToast } = useToast();
  const links = buildShareLinks(url, title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      showToast({ type: "success", message: "Post link copied." });
    } catch {
      showToast({ type: "error", message: "Unable to copy link right now." });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.03] px-2 py-1.5">
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#25D366] transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fab fa-whatsapp" />
          </a>
          <a
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#1877F2] transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fab fa-facebook-f" />
          </a>
          <a
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fab fa-twitter" />
          </a>
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Telegram"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#27A7E7] transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fab fa-telegram-plane" />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#0A66C2] transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fab fa-linkedin-in" />
          </a>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy post link"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-cyan-300 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <i className="fas fa-link" />
          </button>
    </div>
  );
}
