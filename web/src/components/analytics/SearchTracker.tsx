"use client";

import { useEffect, useRef } from "react";
import { trackSiteSearch } from "@/lib/analytics";

export default function SearchTracker({
  searchTerm,
  resultCount,
}: {
  searchTerm: string;
  resultCount: number;
}) {
  // Keyed by the term itself so a fresh search on the same page (client-side
  // navigation to a new ?q=...) fires again, but re-renders from unrelated
  // state changes (e.g. the HOT/ICED tab) don't re-fire it.
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim() || lastTracked.current === searchTerm) return;
    lastTracked.current = searchTerm;
    trackSiteSearch(searchTerm, resultCount);
  }, [searchTerm, resultCount]);

  return null;
}
