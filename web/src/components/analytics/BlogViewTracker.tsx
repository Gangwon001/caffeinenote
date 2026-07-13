"use client";

import { useEffect, useRef } from "react";
import { trackViewBlogPost } from "@/lib/analytics";

export default function BlogViewTracker({
  postSlug,
  postTitle,
  category,
}: {
  postSlug: string;
  postTitle: string;
  category: string | null;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackViewBlogPost({ post_slug: postSlug, post_title: postTitle, category });
  }, [postSlug, postTitle, category]);

  return null;
}
