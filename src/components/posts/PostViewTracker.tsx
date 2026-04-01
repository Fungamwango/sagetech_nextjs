"use client";

import { useEffect } from "react";
import { trackPostViewOnce } from "@/lib/client/postViews";

export default function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    void trackPostViewOnce(postId);
  }, [postId]);

  return null;
}
